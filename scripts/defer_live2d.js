/* 把看板娘（hexo-helper-live2d）从首屏摘出去。
 *
 * 插件会在 after_render:html 里往 </body> 前插一段同步脚本：
 *   <script src="/live2dw/lib/L2Dwidget.min.js?xxx"></script>
 *   <script>L2Dwidget.init({...});</script>
 * 41KB 且阻塞解析，而看板娘是纯装饰、首屏根本不该为它让路。
 *
 * 注意不能把 live2d.enable 改成 false —— 插件的 generator（生成 /live2dw 下的
 * 脚本与 miku 模型资源）同样受这个开关控制，关掉后 lib/ 会变成空目录，
 * 线上直接 404。所以保留 enable: true 让资源照常生成，只用高优先级的
 * filter 摘掉注入，加载时机交给 _config.butterfly.yml 里 inject.bottom 的
 * 延迟脚本（页面空闲后再拉）。
 */
hexo.extend.filter.register('after_render:html', function (html) {
  if (!html || html.indexOf('L2Dwidget') < 0) return html;
  return html.replace(
    /<script src="[^"]*L2Dwidget[^"]*"><\/script><script>L2Dwidget\.init\([^<]*\);<\/script>/g,
    ''
  );
}, 20);
