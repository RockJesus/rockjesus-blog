/* 歌单产物瘦身：把「拿不到直链」的曲目从构建产物里摘掉。
 *
 * 上游 music-sync 生成的 source/data/playlist.json 是全量 3064 首，
 * 其中只有 961 首能解析出 vkey 直链（其余是版权/会员限制）。而 player.js 的
 * normalize() 第一件事就是 `if (!t.url) return;` —— 2103 首无直链曲目下载回来
 * 立刻被丢掉，纯属白传。
 *
 * 实测（2026-10-31 歌单）：
 *   原样   558KB / gzip 184KB
 *   瘦身后 376KB / gzip 124KB
 * 首屏与每 10 分钟的轮询拉取各省 60KB。
 *
 * 两个约束：
 *   1. 源文件 source/data/playlist.json 保持上游格式不动（上游还会重写它）；
 *      只改 public 里的产物。
 *   2. 一首直链都解析不出来时（vkey 全局过期）原样保留，让播放器走种子曲兜底。
 * 兜底地址 raw.githubusercontent 上的仍是全量文件，normalize() 对两种格式都认。
 *
 * 两种跑法（都要，别删其中一个）：
 *   · 构建后由 hexo filter 触发 —— 本地 `hexo g` 直接生效；
 *   · `node scripts/trim_playlist.js` —— CI 里显式跑一步。
 *     CI 必须走 CLI：public/ 是空的，静态资源与 after_generate 之间存在写入竞态，
 *     filter 里 existsSync 常常还没文件（2026-10-31 首次上线就因此没瘦身成功）。
 */
const fs = require('fs');
const path = require('path');

function trimFile(file) {
  if (!fs.existsSync(file)) return 'missing';
  let raw, data;
  try {
    raw = fs.readFileSync(file, 'utf8');
    data = JSON.parse(raw);
  } catch (e) {
    return 'parse-failed';
  }

  const tracks = Array.isArray(data.tracks) ? data.tracks : [];
  if (!tracks.length) return 'empty';

  const playable = tracks.filter(t => t && t.url);
  if (!playable.length) return 'no-playable';       // 直链全过期 → 保留原样
  if (playable.length === tracks.length) return 'already-slim';

  const slim = JSON.stringify({
    updated: data.updated,
    total: tracks.length,
    playable: playable.length,
    tracks: playable
  });
  if (slim.length >= raw.length) return 'no-gain';

  fs.writeFileSync(file, slim);
  return `${tracks.length}→${playable.length} 首, ${Math.round(raw.length / 1024)}KB→${Math.round(slim.length / 1024)}KB`;
}

if (require.main === module) {
  // CLI：默认裁 public/data/playlist.json（可在 CI 的 hexo g 之后单独跑）
  const file = path.resolve(process.argv[2] || 'public/data/playlist.json');
  const r = trimFile(file);
  console.log('trim_playlist:', r, '·', file);
  // missing 在 CI 属于异常（说明产物没生成），让流水线红掉比静默上线好
  if (r === 'missing' || r === 'parse-failed') process.exit(1);
} else {
  hexo.extend.filter.register('after_generate', function () {
    const file = path.join(hexo.public_dir, 'data', 'playlist.json');
    const r = trimFile(file);
    if (r !== 'missing' && r !== 'already-slim') {
      hexo.log.info('trim_playlist: %s', r);
    }
  }, 5);
}
