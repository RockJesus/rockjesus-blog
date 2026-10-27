/* global hexo */
/**
 * 正文标题层级归一化
 *
 * 问题：文章源里作者习惯用 `#` 写小标题，导致单篇文章出现 16 个 <h1>，
 *      页面大纲（读屏器、SEO）无法区分「文章标题」和「章节标题」。
 *
 * 方案：在渲染后把正文 h1–h5 统一降一级（h1→h2 … h5→h6），
 *      让页面内唯一的 <h1> 始终是模板里的 post-title。
 *      锚点 id 原样保留，旧链接不会失效。
 *
 * 只处理 data.content（正文），不动 title / excerpt。
 * 代码块内的 <h1> 在 HTML 里是实体转义文本，不会被标签正则命中。
 */
hexo.extend.filter.register('after_post_render', function (data) {
  if (!data.content) return data;

  data.content = data.content.replace(
    /<h([1-5])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g,
    function (match, level, attrs, inner) {
      var next = Number(level) + 1;
      return '<h' + next + (attrs || '') + '>' + inner + '</h' + next + '>';
    }
  );

  return data;
}, 9);
