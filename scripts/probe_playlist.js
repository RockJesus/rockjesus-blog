/* 构建期直链可用性探测：把「有 url 但实际打不开」的曲目也剔掉。
 *
 * 背景：上游 music-sync 解析出的 vkey 直链里有相当一部分是 403/410 的死链
 * （单曲版权变动、vkey 提前失效、CDN 节点差异）。trim_playlist.js 只看 `t.url`
 * 非空，所以这些死链会原样进产物 —— 播放器随机到就报错、静默跳歌。
 *
 * 本脚本对每条直链发一个 `Range: bytes=0-2047` 的 GET，拿到首个 chunk 即断，
 * 只判「读不读得到字节」，不下载整首。961 条 / 并发 24 实测 15~40s。
 *
 * 三条安全阀（任何一条触发都不写文件，宁可留着死链也不要把歌单打空）：
 *   1. 探测到的可播数 < PROBE_MIN（默认 40）→ 视作 vkey 全局失效 / 网络异常，回退
 *   2. 可播数为 0 → 回退
 *   3. 单条请求异常（DNS/超时）但整体可播率仍旧正常 → 该条按不可播处理
 *
 * 用法：
 *   node scripts/probe_playlist.js [file]     // 默认 public/data/playlist.json
 * 环境变量：
 *   PROBE_CONCURRENCY  并发数，默认 24
 *   PROBE_TIMEOUT      单条超时 ms，默认 8000
 *   PROBE_MIN          最小可播数，低于此回退，默认 40
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CONC = Math.max(1, parseInt(process.env.PROBE_CONCURRENCY || '24', 10));
const TIMEOUT = Math.max(1000, parseInt(process.env.PROBE_TIMEOUT || '8000', 10));
const MIN_OK = Math.max(1, parseInt(process.env.PROBE_MIN || '40', 10));
const MAX_REDIRECT = 3;

// 只读前 2KB 探测。拿到首块就销毁连接，避免白下整首（单曲 3~8MB）。
function probeOnce(u, depth = 0) {
  return new Promise(resolve => {
    let settled = false;
    let req = null;
    const done = (ok, code) => {
      if (settled) return;
      settled = true;
      try { req && req.destroy(); } catch (e) {}
      resolve({ ok, code });
    };
    let parsed;
    try { parsed = new URL(u); } catch (e) { return done(false, 'bad-url'); }
    const mod = parsed.protocol === 'http:' ? http : https;
    try {
      req = mod.get(parsed, {
        headers: {
          Range: 'bytes=0-2047',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
          Accept: '*/*',
          Referer: /163\.com/.test(parsed.host) ? 'https://music.163.com/' : 'https://y.qq.com/'
        },
        timeout: TIMEOUT
      }, res => {
        const c = res.statusCode;
        if ([301, 302, 303, 307, 308].includes(c) && res.headers.location && depth < MAX_REDIRECT) {
          const next = new URL(res.headers.location, parsed).toString();
          res.resume();
          settled = true;
          return probeOnce(next, depth + 1).then(resolve);
        }
        if (c === 200 || c === 206) {
          // 2xx 不代表有音频：音乐平台对下架/无版权曲目会返回 200 的 HTML 404 页。
          // 必须看首块字节与 content-type，否则会把整份不可播歌单判成 100% 健康。
          const ct = String(res.headers['content-type'] || '').toLowerCase();
          let judged = false;
          res.once('data', chunk => {
            if (judged) return; judged = true;
            const head = chunk ? chunk.slice(0, 3).toString('binary') : '';
            const html = head.slice(0, 2) === '<!';
            const id3 = head === 'ID3';
            const frame = chunk && chunk.length >= 2 && chunk[0] === 0xFF && (chunk[1] & 0xE0) === 0xE0;
            const audioCt = /audio|octet-stream|mpeg|mp3|mp4|m4a|ogg/.test(ct);
            const ok = !html && (id3 || frame || audioCt);
            done(ok, ok ? c : 'notaudio:' + (ct || 'no-ct'));
          });
          res.once('end', () => { if (!judged) { judged = true; done(false, 'empty-body'); } });
          res.once('error', () => { if (!judged) { judged = true; done(false, 'stream-err'); } });
        } else {
          res.resume();
          done(false, c);
        }
      });
      req.on('timeout', () => done(false, 'timeout'));
      req.on('error', e => done(false, e.code || 'err'));
    } catch (e) {
      done(false, 'throw');
    }
  });
}

// 带重试：QQ CDN 偶发 5xx，重试一次再判死，避免把好链误杀
async function probe(u) {
  const a = await probeOnce(u);
  if (a.ok) return a;
  if (a.code === 403 || a.code === 404 || a.code === 410) return a;   // 确定性死链不重试
  await new Promise(r => setTimeout(r, 120));
  const b = await probeOnce(u);
  return b.ok ? b : a;
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let cur = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (true) {
      const i = cur++;
      if (i >= items.length) return;
      out[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return out;
}

async function main() {
  const file = path.resolve(process.argv[2] || 'public/data/playlist.json');
  if (!fs.existsSync(file)) {
    console.error('probe_playlist: 找不到', file);
    process.exit(1);
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.error('probe_playlist: 解析失败', e.message);
    process.exit(1);
  }
  const tracks = Array.isArray(data.tracks) ? data.tracks : [];
  let withUrl = tracks.filter(t => t && t.url);
  if (!withUrl.length) {
    console.log('probe_playlist: 没有带直链的曲目，跳过');
    return;
  }

  /* 曲目多时改抽样：3000 首逐条探测会跑几十分钟并把 CI 拖到超时。
     均匀抽样保持首中尾都覆盖，判定仍用 MIN_OK（抽样基数下的通过数）。 */
  const MAX_PROBE = Math.max(1, parseInt(process.env.PROBE_MAX || '80', 10));
  let sampled = false;
  if (withUrl.length > MAX_PROBE) {
    const step = withUrl.length / MAX_PROBE;
    const pick = [];
    for (let i = 0; i < MAX_PROBE; i++) pick.push(withUrl[Math.floor(i * step)]);
    withUrl = pick;
    sampled = true;
    console.log(`probe_playlist: 共 ${tracks.filter(t => t && t.url).length} 条直链，均匀抽样 ${MAX_PROBE} 条探测`);
  }

  const t0 = Date.now();
  const results = await mapLimit(withUrl, CONC, async t => await probe(t.url));
  const ms = Date.now() - t0;

  const alive = withUrl.filter((t, i) => results[i].ok);
  const dead = withUrl.length - alive.length;
  // 失败码统计：一眼区分「风控/限流（403/429）」和「vkey 过期（410/404）」
  const codeTally = {};
  results.forEach(r => {
    if (r.ok) return;
    const k = String(r.code);
    codeTally[k] = (codeTally[k] || 0) + 1;
  });

  const rate = alive.length / withUrl.length;
  const tally = Object.entries(codeTally).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}×${v}`).join(' ');
  console.log(
    `probe_playlist: ${sampled ? '抽样 ' : ''}${withUrl.length} 条直链 → 可播 ${alive.length}，失效 ${dead}` +
    `（${(rate * 100).toFixed(1)}%），耗时 ${(ms / 1000).toFixed(1)}s / 并发 ${CONC}` +
    (tally ? ` | 失败码 ${tally}` : '')
  );

  if (alive.length < MIN_OK) {
    console.log(`probe_playlist: 可播数 ${alive.length} < 阈值 ${MIN_OK}，判定为 vkey 全局失效或网络异常 → 保留原样`);
    return;
  }
  /* 抽样只用来判断整体是否健康，绝不能按抽样结果写回文件 —— 那会把 3000 首砍成 80 首 */
  if (sampled) {
    console.log(`probe_playlist: 抽样模式，只报告不写回，完整歌单 ${tracks.filter(t => t && t.url).length} 条保留`);
    return;
  }
  if (dead === 0) {
    console.log('probe_playlist: 全部可播，无需改写');
    return;
  }
  if (process.env.PROBE_DRY === '1') {
    console.log('probe_playlist: DRY 模式，只报告不写文件');
    return;
  }

  const out = {
    updated: data.updated,
    total: data.total || tracks.length,
    playable: alive.length,
    probed: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    tracks: alive
  };
  const before = JSON.stringify(data).length;
  const after = JSON.stringify(out).length;
  fs.writeFileSync(file, JSON.stringify(out));
  console.log(
    `probe_playlist: 已写回 ${path.basename(file)}，` +
    `${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`
  );
}

// 仅在直接 `node scripts/probe_playlist.js` 时执行；
// hexo 会把 scripts/*.js 当脚本加载（包裹成模块），守卫避免误跑探测/杀掉构建
if (require.main === module) {
  main().catch(e => { console.error('probe_playlist: 崩溃', e); process.exit(1); });
}
