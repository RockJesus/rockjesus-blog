/**
 * RockJesus.cn — /api/stats 统计代理（Cloudflare Worker）
 * ---------------------------------------------------------------------------
 * 背景：2026-11-04 发现旧前端把 Upstash 可写 token 明文写在 player.js 里，
 * 任何人拿到都能读、写、清空整库（实测 FLUSHALL 可执行）。修复方案是把前端
 * 改成只请求同域 /api/stats，由本 Worker 代持密钥。前端改完了，Worker 却
 * 一直没部署 —— rockjesus.cn 是 GitHub Pages，/api/stats 返回的是 Pages 的
 * 404 页，于是全站文章「阅读量」都显示 “—”。本文件补齐这一环。
 *
 * 部署（一次性）：
 *   1) Upstash 上新建一个「只读写计数键」的 token，不要复用 sync-visits
 *      用的管理员 token（那个能 FLUSHALL）。
 *   2) cd workers/stats && npm i -g wrangler && wrangler login
 *      wrangler secret put UPSTASH_URL        # https://tight-wren-137459.upstash.io
 *      wrangler secret put UPSTASH_TOKEN      # 第 1 步的读写 token
 *   3) wrangler deploy
 *   4) Cloudflare 控制台 → rockjesus.cn 的 DNS/路由：
 *        路由 rockjesus.cn/api/stats/*  →  stats-proxy
 *      （或为该域名添加一条指向 Worker 的路由规则）
 *
 * 接口契约（与 source/js/player.js 对齐，改动需同步两端）：
 *   GET /api/stats                         → { visits: { CN: 845, ... } }
 *   GET /api/stats?incr=CN                 → 访客国家 +1，返回同一结构
 *   GET /api/stats?pv=<path>               → 文章 +1，返回 { pv: { "<path>": 12 } }
 *   GET /api/stats?pv=<path>&only=1        → 只读不计数（同一会话重复进入时用）
 *   GET /api/stats?incr=CN&pv=/qa/         → 两者同时，返回 { visits, pv }
 *   GET /api/stats?adminKeys=1             → 调试用，列出计数键（需 ADMIN_KEY）
 *
 * 安全：
 *   · 只暴露 visits_<CC> / pv_<path> 两类键，永远不透传任意 Upstash 路径
 *   · path 白名单化（必须 / 开头、无 ..、长度受限），避免用任意 key 撑爆存储
 *   · 计数走 INCR，天然并发安全；单次请求最多 2 次写
 *   · CORS 只放行本站，其余来源返回 403（防止被当免费计数器刷）
 */

const ALLOWED_ORIGINS = [
  'https://rockjesus.cn',
  'https://www.rockjesus.cn',
  'http://localhost:4000',   // hexo s
  'http://localhost:8081',   // 本地静态预览
];

const MAX_PV_KEY_LEN = 200;

/* ---------------- Upstash REST 客户端 ---------------- */
async function upstash(env, cmd, ...args) {
  // ⚠️ 参数里的 / 必须二次编码成 %2F。Upstash 按 / 切分路径段，
  //    pv_/qa/ 这种键如果只做一次 encodeURIComponent，斜杠仍会被当成
  //    路径分隔符 → 实际写入 pv_ 后接 /qa/ 两段，键名被截断成 "pv_"，
  //    全站所有文章的阅读量会挤进同一个键（实测踩过）。
  //    这里对已编码参数里的 / 再转一次，保证整个键是一个完整的路径段。
  const seg = a => encodeURIComponent(String(a)).replace(/\//g, '%2F');
  const path = [cmd, ...args.map(seg)].join('/');
  const r = await fetch(env.UPSTASH_URL.replace(/\/+$/, '') + '/' + path, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.UPSTASH_TOKEN,
      'Content-Type': 'application/json',
    },
    // 统计接口不能被缓存
    cf: { cacheTtl: 0 },
  });
  if (!r.ok) throw new Error('upstash ' + r.status + ' ' + (await r.text()).slice(0, 120));
  const j = await r.json();
  return j.result;
}

/* ---------------- 参数校验 ---------------- */
function badRequest(msg, status = 400) {
  return json({ error: msg }, status);
}

function normalizePath(raw) {
  if (!raw || typeof raw !== 'string') return null;
  if (raw.length > MAX_PV_KEY_LEN) return null;
  if (!raw.startsWith('/')) return null;
  if (raw.includes('..')) return null;
  // 只允许 URL 路径里合法出现的字符，杜绝控制字符与换行
  if (/[^\w\-./%~\u4e00-\u9fa5]/.test(raw)) return null;
  return raw;
}

function json(body, status = 200, origin) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    // 计数是实时数据，禁止任何中间层缓存（GitHub Pages 的 Fastly 在前）
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}

/* ---------------- 批量读国家计数 ---------------- */
async function readVisits(env) {
  const keys = await upstash(env, 'keys', 'visits_*');
  const list = (keys || []).filter(k => /^visits_[A-Za-z]{2}$/.test(k));
  const out = {};
  if (!list.length) return out;
  const vals = await upstash(env, 'mget', ...list);
  list.forEach((k, i) => {
    const n = parseInt(vals[i], 10);
    if (n > 0) out[k.slice(7)] = n;
  });
  return out;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : null;

    // 预检
    if (request.method === 'OPTIONS') {
      if (!allowedOrigin) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'GET' && request.method !== 'POST') {
      return badRequest('method not allowed', 405);
    }

    // 跨域来源校验：浏览器会带 Origin，非本站一律拒绝
    // （curl / 服务端请求没有 Origin，放行以便运维排查）
    if (origin && !allowedOrigin) {
      return json({ error: 'forbidden origin' }, 403);
    }

    const p = url.searchParams;

    // 调试：列出全部计数键的总量，需 ADMIN_KEY
    if (p.has('adminKeys')) {
      if (!env.ADMIN_KEY || p.get('adminKey') !== env.ADMIN_KEY) return badRequest('unauthorized', 401);
      const keys = await upstash(env, 'keys', '*');
      return json({ count: (keys || []).length }, 200, allowedOrigin);
    }

    // 兼容前端两种写法：pv=/qa/（+1 计数）与 pv=/qa/&only=1（只读）
    const rawPv = p.get('pv');
    const pvOnly = p.get('only') === '1' || p.get('readonly') === '1';
    const incr = p.get('incr');   // 国家代码

    let pvKey = null;
    if (rawPv !== null) {
      const clean = normalizePath(rawPv);
      if (!clean) return badRequest('invalid pv path');
      pvKey = 'pv_' + clean;
    }

    if (incr !== null && !/^[A-Za-z]{2}$/.test(incr)) {
      return badRequest('invalid country code');
    }

    try {
      const body = {};

      // —— 文章阅读量 ——
      if (pvKey) {
        const n = pvOnly ? await upstash(env, 'get', pvKey) : await upstash(env, 'incr', pvKey);
        // 返回结构必须与前端一致：{ pv: { "<path>": 数值 } }
        body.pv = { [rawPv]: parseInt(n, 10) || 0 };
        // 计数键太多时给个上限，防止异常路径被无限写入
        if (!pvOnly && parseInt(n, 10) === 1) await guardKeyBudget(env);
      }

      // —— 访客国家分布 ——
      if (incr !== null) {
        if (incr !== 'XX') await upstash(env, 'incr', 'visits_' + incr.toUpperCase());
        body.visits = await readVisits(env);
      } else if (!pvKey) {
        // 无参数 = 只读访客分布（首页地球图用）
        body.visits = await readVisits(env);
      }

      return json(body, 200, allowedOrigin);
    } catch (e) {
      // 不把 Upstash 的错误细节透给前端，只回 502 让前端走降级
      console.error('stats error:', e.message);
      return json({ error: 'upstream' }, 502, allowedOrigin);
    }
  },
};

/* 新建 pv 键时做一次粗粒度巡检：键数超过预算就告警（不自动删数据） */
const PV_KEY_BUDGET = 5000;
async function guardKeyBudget(env) {
  try {
    const keys = await upstash(env, 'keys', 'pv_*');
    const n = (keys || []).length;
    if (n > PV_KEY_BUDGET) console.warn('pv_* key budget exceeded: ' + n);
  } catch (e) { /* 巡检失败不影响主流程 */ }
}
