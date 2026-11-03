/* 静态资源缓存破防：把 CSS/JS 引用上的 ?v=xxx 换成「文件内容哈希」。
 *
 * 背景（2026-11-03）：
 *   _config.butterfly.yml 里 inject 的版本号是手写的死值
 *   （custom.css?v=1.9.37、player.js?v=1.8.29 …）。实际样式改了好几轮、
 *   版本号一次没动，导致：
 *     · 浏览器命中本地缓存，看到的是几轮前的老样式；
 *     · Fastly CDN max-age=600 期间，不同访客拿到的版本不一致；
 *     · 排查「改了没生效 / 没改却变了」时无法判断是缓存还是真 bug。
 *
 * 做法：
 *   构建产物生成后，扫描 public/ 下所有 HTML，把每个
 *     <link|script … href|src="/css/xxx.css?v=任意"（或没有 ?v）>
 *   改写为 ?v=<该文件的 sha1 前 10 位>。
 *   版本号与内容强绑定：内容不变则 URL 不变（缓存继续有效、不多余失效），
 *   内容一变 URL 立刻变（浏览器/CDN 必然回源）。
 *
 *   同时删掉残留的旧版本号（如 ?v=1.9.37），避免出现两个 ?v。
 *
 * 两种跑法（沿用 trim_playlist.js 的约定）：
 *   · after_generate filter —— 本地 `hexo g` 直接生效；
 *   · `node scripts/asset-version.js` —— CI 里显式跑一步。
 *     CI 必须走 CLI：public/ 是空的，静态资源写入与 after_generate 存在竞态，
 *     filter 里读文件常常扑空（trim_playlist.js 2026-10-31 踩过同一个坑）。
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PUBLIC = path.join(__dirname, '..', 'public');

// 只给这些目录下的静态资源加版本号（站内自托管资源）。
// 外链（jsdelivr / alicdn / shields.io）一律不动——它们的版本由服务方管。
const LOCAL_ASSET_RE = /^(?:\/)(?:css|js|lib|live2dw)\/[^?#]+\.(?:css|js)$/;

function sha1of(file) {
  return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 10);
}

/* 递归列出 public 下所有 .html */
function walkHtml(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkHtml(p, out);
    else if (/\.html?$/i.test(ent.name)) out.push(p);
  }
  return out;
}

function run() {
  if (!fs.existsSync(PUBLIC)) {
    return { ok: false, reason: 'public/ 不存在（需先 hexo g）' };
  }

  const hashCache = new Map();
  function versionOf(urlPath) {
    if (hashCache.has(urlPath)) return hashCache.get(urlPath);
    const abs = path.join(PUBLIC, urlPath.replace(/^\//, ''));
    let v = null;
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) v = sha1of(abs);
    hashCache.set(urlPath, v);
    return v;
  }

  const htmlFiles = walkHtml(PUBLIC, []);
  let touchedFiles = 0;
  let touchedRefs = 0;
  const missing = new Set();

  // 只处理 <link href> 与 <script src>，且必须指向站内 css/js。
  // 不能用全局 href=/src= 通配：正文里的 <a href="/css/custom.css"> 不该被加版本号。
  // 先整体匹配标签，再在其内部替换属性，保证不改动其他位置。
  const TAG_RE = /<(link|script)\b([^>]*)>/gi;
  const ATTR_RE = /(\s(?:src|href)=)(["'])(\/(?:css|js|lib|live2dw)\/[^"'?#]+\.(?:css|js))(\?[^"']*)?\2/gi;

  for (const file of htmlFiles) {
    const before = fs.readFileSync(file, 'utf8');
    let changed = 0;
    const after = before.replace(TAG_RE, (tag, name, attrs) => {
      const newAttrs = attrs.replace(ATTR_RE, (m, attr, q, urlPath) => {
        if (!LOCAL_ASSET_RE.test(urlPath)) return m;
        const v = versionOf(urlPath);
        if (!v) { missing.add(urlPath); return m; }
        const next = `${attr}${q}${urlPath}?v=${v}${q}`;
        if (next !== m) changed++;
        return next;
      });
      return newAttrs === attrs ? tag : `<${name}${newAttrs}>`;
    });
    if (changed > 0) {
      fs.writeFileSync(file, after, 'utf8');
      touchedFiles++;
      touchedRefs += changed;
    }
  }

  const result = {
    ok: true,
    html: htmlFiles.length,
    touchedFiles,
    touchedRefs,
    assets: hashCache.size,
    missing: [...missing]
  };
  if (missing.size) {
    console.warn('[asset-version] 以下资源在 public/ 中找不到，已跳过：');
    missing.forEach(m => console.warn('  - ' + m));
  }
  return result;
}

module.exports = run;

/* ---- 跑法 1：hexo filter（本地 hexo g） ---- */
if (typeof hexo !== 'undefined' && hexo && hexo.extend && hexo.extend.filter) {
  hexo.extend.filter.register('after_generate', function () {
    try {
      const r = run();
      if (r.ok) {
        console.log(`[asset-version] filter 完成：${r.touchedFiles} 个 HTML，${r.touchedRefs} 处引用`);
      } else {
        console.log(`[asset-version] filter 跳过：${r.reason}`);
      }
    } catch (e) {
      console.warn('[asset-version] filter 出错（不阻断构建）：', e.message);
    }
  });
}

/* ---- 跑法 2：CI 显式 CLI ---- */
if (require.main === module) {
  const r = run();
  if (!r.ok) {
    console.error('[asset-version] 失败：' + r.reason);
    process.exit(1);
  }
  console.log(`[asset-version] OK：扫描 ${r.html} 个 HTML，改写 ${r.touchedFiles} 个文件 / ${r.touchedRefs} 处引用，覆盖 ${r.assets} 个资源`);
  if (r.missing.length) process.exitCode = 0; // 缺失只告警，不阻断部署
}
