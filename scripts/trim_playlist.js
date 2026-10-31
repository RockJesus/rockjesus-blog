/* 歌单产物瘦身：把「拿不到直链」的曲目从构建产物里摘掉。
 *
 * 上游 music-sync 生成的 source/data/playlist.json 是全量 3064 首，
 * 其中只有 961 首能解析出 vkey 直链（其余是版权/会员限制）。而 player.js 的
 * normalize() 第一件事就是 `if (!t.url) return;` —— 2103 首无直链曲目下载回来
 * 立刻被丢掉，纯属白传。
 *
 * 实测（2026-10-31 歌单）：
 *   原样   558KB / gzip 184KB
 *   瘦身后 381KB / gzip 124KB
 * 对首屏 + 每 10 分钟的轮询拉取都省 60KB。
 *
 * 两个约束：
 *   1. 源文件 source/data/playlist.json 保持上游格式不动（上游还会重写它）；
 *      只在 after_generate 阶段改 public 里的产物。
 *   2. 一首直链都解析不出来时（vkey 全局过期）原样保留，让播放器走种子曲兜底，
 *      不要把产物写成空数组。
 * 兜底地址 raw.githubusercontent 上的仍是全量文件，normalize() 对两种格式都认。
 */
const fs = require('fs');
const path = require('path');

hexo.extend.filter.register('after_generate', function () {
  const file = path.join(hexo.public_dir, 'data', 'playlist.json');
  if (!fs.existsSync(file)) return;

  let raw, data;
  try {
    raw = fs.readFileSync(file, 'utf8');
    data = JSON.parse(raw);
  } catch (e) {
    hexo.log.warn('trim_playlist: 解析失败，跳过');
    return;
  }

  const tracks = Array.isArray(data.tracks) ? data.tracks : [];
  if (!tracks.length) return;

  const playable = tracks.filter(t => t && t.url);
  if (!playable.length || playable.length === tracks.length) return;

  const out = {
    updated: data.updated,
    total: tracks.length,
    playable: playable.length,
    tracks: playable
  };
  const slim = JSON.stringify(out);
  if (slim.length >= raw.length) return;

  fs.writeFileSync(file, slim);
  hexo.log.info(
    'trim_playlist: %d 首 → %d 首可播，产物 %dKB → %dKB',
    tracks.length, playable.length,
    Math.round(raw.length / 1024), Math.round(slim.length / 1024)
  );
}, 5);
