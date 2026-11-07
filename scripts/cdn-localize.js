/**
 * cdn-localize.js — 把主题默认从 jsDelivr 取的第三方库改成本地副本
 * --------------------------------------------------------------------------------
 * 背景：butterfly 的 third_party_provider 默认是 jsdelivr，生成的 HTML 里会出现
 *   <script src="https://cdn.jsdelivr.net/npm/..."> 这类**同步、无 async/defer** 的标签。
 *   同步脚本会阻塞 DOM 解析，而 jsDelivr 在国内访问极不稳定（实测单个
 *   APlayer.min.js 要 8.1 秒、Meting.min.js 5.2 秒），整页 DOMContentLoaded 被拖到 9~33 秒。
 *   换 CDN / 换托管都治不了这个 —— 只要依赖还在 jsDelivr，前三屏都是等。
 *
 * 做法：把这些文件（9 个：7 js + 2 css）下载进 source/js/vendor、source/css/vendor，
 *   生成 HTML 后按 URL 精确替换成本地路径。**保持原来的同步顺序**，不加 defer：
 *   main.js 里有 `new LazyLoad(...)`、`if (window.fjGallery)` 这类用法，
 *   改执行时序有踩空风险，先只换域名，收益已经够大（同一台 Fastly 边缘取，不再跨境）。
 *
 * 依赖清单与来源（版本跟 jsDelivr 当前最新一致）：
 *   aplayer/dist/APlayer.min.js                     -> /js/vendor/aplayer.min.js
 *   butterfly-extsrc/metingjs/dist/Meting.min.js    -> /js/vendor/meting.min.js
 *   @fancyapps/ui/dist/fancybox.umd.min.js          -> /js/vendor/fancybox.umd.min.js
 *   @fancyapps/ui/dist/fancybox.min.css             -> /css/vendor/fancybox.min.css
 *   flickr-justified-gallery/dist/fjGallery.min.js  -> /js/vendor/fjGallery.min.js
 *   flickr-justified-gallery/dist/fjGallery.min.css -> /css/vendor/fjGallery.min.css
 *   pjax/pjax.min.js                                -> /js/vendor/pjax.min.js
 *   typed.js/lib/typed.min.js                       -> /js/vendor/typed.min.js
 *   vanilla-lazyload/dist/lazyload.iife.min.js      -> /js/vendor/lazyload.iife.min.js
 *
 * 注意：source/css/vendor/*.css 必须在 _config.yml 的 skip_render 里放行，
 *   否则 Hexo 会把这些自制 CSS 截断（本地已复现过，见 v1.8.5 的 bundle.min.css）。
 */
'use strict';

var MAP = {
  'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js': '/js/vendor/aplayer.min.js',
  'https://cdn.jsdelivr.net/npm/butterfly-extsrc/metingjs/dist/Meting.min.js': '/js/vendor/meting.min.js',
  'https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.umd.min.js': '/js/vendor/fancybox.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.min.css': '/css/vendor/fancybox.min.css',
  'https://cdn.jsdelivr.net/npm/flickr-justified-gallery/dist/fjGallery.min.js': '/js/vendor/fjGallery.min.js',
  'https://cdn.jsdelivr.net/npm/flickr-justified-gallery/dist/fjGallery.min.css': '/css/vendor/fjGallery.min.css',
  'https://cdn.jsdelivr.net/npm/pjax/pjax.min.js': '/js/vendor/pjax.min.js',
  'https://cdn.jsdelivr.net/npm/typed.js/lib/typed.min.js': '/js/vendor/typed.min.js',
  'https://cdn.jsdelivr.net/npm/vanilla-lazyload/dist/lazyload.iife.min.js': '/js/vendor/lazyload.iife.min.js'
};

// 顺手去掉对 jsDelivr 的 preconnect：外链已经清零，这条预连接只会白白多发一次 DNS/TCP。
var PRECONNECT = '<link rel="preconnect" href="//cdn.jsdelivr.net"/>';

hexo.extend.filter.register('after_render:html', function (str) {
  str = str.split(PRECONNECT).join('');
  Object.keys(MAP).forEach(function (remote) {
    if (str.indexOf(remote) !== -1) {
      str = str.split(remote).join(MAP[remote]);
    }
  });
  return str;
});
