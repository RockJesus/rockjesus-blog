# Liquid Glass 侧边栏卡片材质

> **version: 1.0.0** · 2026-11-05
>
> **全站统一**：除侧栏卡片外，导航胶囊、下拉菜单、搜索弹窗、移动端侧滑、
> 播放列表、404 卡片、主列文章卡片已全部统一到同一材质，
> 见 `liquid-glass-global.css`（15 节，含暗背景补偿与正文加厚）。
>
> 材质自身的语义化版本。每次改动材质后递增并同步推送：
> 破坏性改参数名/结构 → MAJOR；新增档位或令牌 → MINOR；纯调参/修 bug → PATCH。
> 与站点缓存用的 `?v=<sha1>` 无关，后者由 `scripts/asset-version.js` 自动生成。

## 一句话

两个档位并存：**均衡档**（暗玻璃、清晰透光、通过 WCAG AA）和 **复刻档**（iOS 26 控制中心参考图：无暗膜、亮玻璃、重虚化、一圈细白线）。切换方式：给卡片加 `rj-lg--ultra` 类。

---

## v6 复刻档：推翻此前全部参数

站长给了两张 iPhone 控制中心的 Liquid Glass 截图，对比后发现**我前五版的方向全错**：

| | 我此前做的（v1–v5） | 参考图真实特征 |
|---|---|---|
| 底色 | 4–8% **黑** | **趋 0**，甚至加一层极淡的**白** |
| 亮度 | 压到 0.58–0.78 | **不压**，壁纸原亮度透过 |
| 模糊 | 46px | **很重 88px**，但要「糊而不暗」 |
| 边缘 | 角度渐变亮环 | **均匀一圈细白线 + 内部柔白发光** |
| 四角 | 无处理 | **略亮**（两个 radial-gradient 叠角部柔光） |
| 文字 | 压在玻璃上 | **在玻璃外** ← 这是关键差别 |

最后一行是复刻的最大障碍：参考图里「photo」标签在卡片**上方**，不在玻璃上，所以它不需要为可读性做任何妥协。我们的文字必须在玻璃内，所以做了两件事：

1. **深色档**：字所在那一条叠一层极窄的 `radial-gradient` 暗色 scrim（26% → 12% → 透明，blur 6px）。只染文字行，不污染整块玻璃。
2. **浅色档**：玻璃提亮到乳白（白 14% 底 + 角部 30%/22% 柔光），文字直接改深墨 `--rj-ink-900`，**并去掉字影** —— 白字影在深色壁纸上透上来时会形成一圈灰边，字看起来发脏。

```css
/* 复刻档核心 */
--rj-lg-tint: 0;
background:
  radial-gradient(120% 90% at 18% 0%, white 14%, transparent 55%),
  radial-gradient(110% 80% at 88% 100%, white 10%, transparent 55%),
  color-mix(in srgb, white 5%, transparent);
backdrop-filter: blur(88px) saturate(112%);   /* 不压 brightness */
box-shadow:
  inset 0 0 0 1px color-mix(in srgb, white 55%, transparent),   /* 细白线 */
  inset 0 0 24px color-mix(in srgb, white 18%, transparent),    /* 内发光 */
  inset 0 0 60px color-mix(in srgb, white 8%, transparent);
```

---

## 均衡档（v5）一句话

整块均匀薄玻璃，卡面底色只有 **8%**，靠把透过来的光压到 58% 来保住文字。上缘带冷色折射光晕、下缘暖色反光、四边有玻璃厚度内阴影。

---

## v5 的关键：参数方向是反的

前几版一直在用「加底色（tint）」来补偿「压亮度（brightness）」，导致卡片越调越闷。这轮做了 **5×6 网格搜索**（tint 8–26% × brightness 0.62–0.92，共 30 组），结论完全反直觉：

```
tint 8%  + brightness 0.62 → 4.89:1  PASS
tint 26% + brightness 0.62 → 4.89:1  PASS   ← 完全一样
tint 8%  + brightness 0.92 → 2.48:1  fail
tint 26% + brightness 0.92 → 2.48:1  fail   ← 完全一样
```

**决定对比度的只有 `brightness`，tint 几乎不影响。** 所以正确配方是：**tint 拉到最低（8%，接近纯透明）+ brightness 压狠（0.58–0.62）**。这正好是 Apple 暗色玻璃的做法——低底色、重压透光。

---

## 呈现效果

| 特性 | 均衡档 | 复刻档 |
|---|---|---|
| 卡面底色 | `--rj-lg-tint: .08`（8% 黑） | **0** + 5% 白 |
| 透光处理 | `brightness(0.58)` 压低 | `blur(88px) saturate(112%)` **不压亮度** |
| 边缘 | 角度渐变亮环 | 均匀 1px 白线 + 三层内发光 |
| 色散感 | 上冷下暖双色温 | 无（参考图没有色散） |
| 文字方案 | 字影托底 | 深色档：窄条 scrim；浅色档：深墨字无字影 |
| WCAG AA | ✅ 通过 | ❌ 不通过（参考图本身也不通过） |

## 实测对比度（均衡档，像素采样）

| 模式 | 最坏底色 | 对比度 | 结论 |
|---|---|---|---|
| 暗色 | rgb(46,110,114) | **4.80:1** | 通过 AA |
| 浅色 | rgb(151,157,165) | **6.16:1** | 通过 AA |

复刻档不保证 AA —— 它的设计目标就是「透到像参考图」。截图肉眼可读，但严格测量在 2–3:1 区间。站长知情选择。

---

## 一、先讲清楚「液态玻璃」到底是什么

它不是一张可以下载的图，也不是一个 CSS 属性。真实效果由四层叠加而成，缺一层就会「像塑料」：

| 层 | 作用 | 实现手段 |
|---|---|---|
| ① 背景透射 | 让背后的东西透过来并模糊 | `backdrop-filter: blur() saturate()` |
| ② **厚度分层** | 薄玻璃铺面、厚玻璃装字，两套参数 | 两层独立元素 + 各自的 `backdrop-filter` |
| ③ **切面亮环** | 玻璃有厚度，边缘有一道细高光 | 1px 内遮罩 + 角度渐变 |
| ④ **动态高光** | 玻璃是活的，会随视角变化 | JS 写坐标 + `radial-gradient` |

②③④ 是绝大多数「液态玻璃」实现漏掉的，也是拿掉之后一眼假的原因。特别是 ②，多数人只做一块均匀的玻璃，所以永远「不够苹果」。

---

## 二、走过的路线与取舍

### ❌ 路线 A：整体压暗（v1）

`brightness(0.72)` 把背景压暗换对比度，得到 10.66:1，但卡片发闷，玻璃感全无。

### ❌ 路线 B：加重模糊，靠模糊抹平亮斑

想法很合理——Apple 官网玻璃就是重度模糊。但实测结果相反：

| 方案 | 文字区最坏底色 | 对比度 |
|---|---|---|
| blur 28px（v2） | rgb(40,50,81) | 8.31:1 ✅ |
| blur 60px | rgb(14,101,105) | 4.49:1 ❌ |
| blur 90px | rgb(100,155,156) | 2.06:1 ❌ |
| blur 90px + 白字 | rgb(26,152,140) | 3.21:1 ❌ |

**原因**：模糊不会降低峰值亮度，反而把周围星云的青绿「摊」进文字区。Apple 能这么玩是因为它的底图是可控的白灰产品图，而你这张壁纸的星云亮部太强。

### 路线 C：双厚度分层（v3，已按你要求移除）

把「透」和「读」拆给两个不同材质层，互不干扰：

| 层 | 材质 | 参数 | 职责 |
|---|---|---|---|
| 卡面（Clear） | 薄玻璃 | `blur(50px) saturate(170%) brightness(1.08)`，alpha 仅 `.10` | 全透，让星云直接透过来 |
| `.rj-lg__thick` | 厚玻璃 | `blur(18px) brightness(.55)`，alpha `.52` | 装全部文字 |

实测：

```
薄玻璃区（星云正上方）：rgb(35,205,178)  → 文字放这里只有 1.65:1，所以不放
厚玻璃层内最坏底色：    rgb(38,107,113)  → 正文 5.03:1  PASS
浅色模式厚层：          rgb(211,217,220) → 正文 11.80:1 PASS
```

这就是 iOS 26 的真实做法——它不是一块均匀的玻璃，是**有厚度等级的材质系统**。

---

## 三、文件清单

| 文件 | 说明 |
|---|---|
| `liquid-glass.css` | 材质定义 |
| `liquid-glass.js` | 光标光斑驱动 |
| `preview.html` | 实景预览：真实 `tokens.css` + 真实壁纸 `oc.webp` + 三张侧栏卡片 |
| `preview-dark.png` / `preview-light.png` | 双模式效果图 |
| `tokens.css` | 从线上抓取的副本，仅用于本地预览 |

直接打开 `preview.html` 就能看到效果，鼠标移到卡片上光斑会跟随。

---

## 四、接入方式

### 方案 A：只改材质（推荐先试这个）

把 `liquid-glass.css` 内容追加到 `source/css/custom.css` 末尾，然后在 HTML 里给侧栏卡片加 `rj-lg` 类。

Butterfly 的侧栏卡片都是 `.card-widget`，用属性选择器可以一次性全上，**不用改任何模板文件**：

```css
/* 追加在 liquid-glass.css 末尾 */
#aside-content .card-widget{
  /* 复用同一套材质，但不需要光斑时省略 rj-lg--spot */
}
```

更稳妥的做法是直接在 Butterfly 的 `inject` 里加一行脚本自动打类（见下）。

### 方案 B：自动挂类（推荐）

在 `_config.butterfly.yml` 中：

```yaml
inject:
  bottom:
    - <script src="/js/liquid-glass.js"></script>
    - <script>
      document.addEventListener('DOMContentLoaded', function(){
        document.querySelectorAll('#aside-content .card-widget').forEach(function(el){
          el.classList.add('rj-lg','rj-lg--spot');
        });
      });
      </script>
```

`liquid-glass.js` 只做一件事：驱动光标光斑，并在 pjax 切换后重新扫描。

**挂类**这一步仍需你做——因为我不知道你想给哪些卡片上效果。

### 想让某个卡片不上效果

```html
<div class="card-widget rj-lg rj-lg--spot">...</div>   <!-- 有玻璃 -->
<div class="card-widget">...</div>                      <!-- 保持原样 -->
```

---

## 五、可调参数

全部在 `.rj-lg` 上，改 CSS 变量即可，不用动 JS：

| 变量 | 默认 | 说明 |
|---|---|---|
| `--rj-lg-rim` | `1` | 亮环强度，`0` = 关，`1.5` = 很亮 |
| `--rj-lg-tint` | `.26` | 卡面暗色调 |
| `--rj-lg-sheen` | `.12` | 卡面白色反光 |
| `--rj-lg-spot` | `180px` | 光斑半径，已做 `clamp()` 自适应 |

常用微调：

```css
/* 想更透：降卡面暗色调，同时把 brightness 提回去 */
.rj-lg{ --rj-lg-tint:.12 }
#aside-content .card-widget.rj-lg{ backdrop-filter:blur(46px) saturate(112%) brightness(.88) }

/* 想文字更稳：brightness 往下压 */
#aside-content .card-widget.rj-lg{ backdrop-filter:blur(46px) saturate(112%) brightness(.62) }

/* 更细的亮环 */
.rj-lg{ --rj-lg-rim:.7 }
```

> `brightness` 目前写在卡面规则里而非变量，是因为它同时受主题影响。要频繁调的话建议自己提成变量。

> ⚠️ 改 `--rj-lg-thick-*` 之前建议先读第二节。这几个值直接决定文字对比度，改完请用 `preview.html` 复核。

---

## 六、实测数据（不是估算）

### 文字对比度（v4 实测）

测量方法：隐藏文字只留材质 → 截图 → 在每张卡内密集采样（步长 2px）→ 取最亮 5%（暗色）/ 最暗 5%（浅色）作为最坏底色 → 算 WCAG 对比度。

| 模式 | 最坏底色 | 对比度 | 结论 |
|---|---|---|---|
| 暗色 | rgb(43,114,112) | **4.60:1** | 通过 AA（余量仅 0.1，偏紧） |
| 浅色 | rgb(142,150,158) | **5.62:1** | 通过 AA |

对比 v3 双厚度（5.03:1 / 11.80:1）略低，换来的是去掉了一整层视觉结构。

### 性能

| 项目 | 结果 |
|---|---|
| 光斑节流 | 120 次 `pointermove` → **仅 2 次样式写入**（rAF 合帧） |
| 布局抖动 | 无（`getBoundingClientRect` 结果缓存，仅 enter 时重测） |
| 动画属性 | 只用 `box-shadow` / `transform` / `opacity`，走合成层 |
| 体积 | CSS 2.8KB + JS 1.2KB（gzip） |


### 兼容与降级

| 场景 | 表现 |
|---|---|
| 不支持 `backdrop-filter` | `@supports` 兜底为 `--rj-surface-solid`，文字仍可读 |
| `prefers-reduced-motion` | 去掉位移过渡，光斑常驻 0.5 不透明度 |
| 触屏（`hover: none`） | 光斑常驻 0.45 不透明度，不会「永远不出现」 |
| 键盘聚焦 | `:focus-visible` 时亮环拉到最亮并加青色外环 |
| 无 JS | `--mx/--my` 有默认值 `50%/0%`，光斑停在顶部中间，视觉上也成立 |

---

## 七、踩过的坑

### 1. `feDisplacementMap` 做真折射：效果有，但会毁掉圆角

这是我最初选的方案——用 SVG 滤镜位移背景，模拟透镜折射。实测确实能出折射（边缘条纹明显弯曲拉伸），但有两个硬伤：

- **`backdrop-filter: url(#f)` 会让 `border-radius` 裁剪失效**，圆角变直角
- 即使外层加 `overflow:hidden` 修回圆角，`feImage` 在 `objectBoundingBox` 下的非等比拉伸仍会在边缘产生**彩色锯齿噪点**（R/G 通道插值不一致，左缘偏紫、右上偏蓝）

结论：视觉收益抵不上兼容性与瑕疵代价。改用 1px 内遮罩亮环 + 多层内 `box-shadow` 模拟切面，在真实壁纸上几乎看不出差别，且零噪点、全浏览器一致。**这个方案的文件留在了 `_test-refract.html` / `_test-refract2.html`，供你对比。**

### 2. 「加重模糊就能压暗亮斑」是错的

v3 之前我试过把 blur 从 28px 加到 60px、90px，想靠模糊抹平星云亮部。实测对比度反而从 8.31:1 掉到 4.49:1、2.06:1。

原因是模糊做的是**邻域平均**，不是削峰。星云的青绿被摊得更开，反而更多地渗进文字区。真正能压亮的只有 `brightness()`，而它一旦全局生效就会毁掉通透感——所以最终只能走「局部厚度」这条路。

### 3. 用全卡片采样测对比度，测出来的数字没有意义

第二轮验证时，我一开始把采样范围设成「整张卡片」，结果四个方案全部判 FAIL（1.07–1.61:1）。

看着很吓人，其实是方法错了：卡片顶部透区本来就设计成高亮，而**那里根本没有文字**。真正的可读性只取决于文字坐落的那块底色。

改法：按每个文字元素的 `getBoundingClientRect()` 精确采样，且**文字像素和背景像素要分开**——用矩形内的**众数色**当背景（文字只占少数像素），用**离背景最远的像素**当文字色。这样测出来才和肉眼一致。

### 4. 文字色不能写死

第一版我在预览页把正文写死成 `#c4d2e0`，暗色下好好的，切到浅色模式立刻变成「浅字配浅卡」，几乎完全不可读。

修法：组件只管材质，文字色一律绑站点的 `--rj-text-*` 语义令牌。现在实测暗色 `rgba(226,232,255,.82)`、浅色 `rgba(29,29,31,.82)`，自动跟随。

### 5. 采样测对比度时，别把文字像素算进背景

第一轮测出 `1.78:1` 其实是**真的**（当时确实不达标），但修完后再测却是误报——我把采样区域框在了文字上，最亮像素取到的是文字本身 `rgb(210,224,238)`。改成只取卡片右侧空白带后数据才干净。

**教训：测对比度要么逐像素分类，要么严格避开前景。**

### 6. 【最坑的一次】`var()` 为空时，整条声明静默失效

做复刻档时，我把 CSS 全部改写成 `color-mix(in srgb, var(--rjp-white) …)` 的形式，截图看着「有效果」，其实**那层白色高光从头到尾就没渲染过**。

原因：单文件预览在多次同步过程中把 `tokens.css` 那段 `<style>` 弄丢了，`--rjp-white` / `--rj-ink-900` 全部解析为空字符串。而 CSS 的规则是——**`var()` 解析失败会让整条声明作废，不报错、不降级到透明，直接当没写**。

所以：

- 看到的「通透」是纯 `blur(88px)` 的效果，与设计意图无关
- `background` 声明整条失效，计算值是 `rgba(0,0,0,0)`
- DevTools 里 `background-image: none`，但截图看着「就是玻璃」，很容易被骗过去

**排查方法**（一行就能验）：
```js
getComputedStyle(card).getPropertyValue('--rjp-white')  // 空字符串 = 令牌没加载
```

**教训：做了 `color-mix()` + `var()` 的材质，第一件事永远是打印变量值，不是看截图。** 视觉上的「还行」会掩盖声明根本没生效的事实。

---

## 七、v6 复刻档的使用方式

给卡片加类即可：

```js
document.querySelectorAll('#aside-content .card-widget')
        .forEach(el => el.classList.add('rj-lg', 'rj-lg--ultra'));
```

预览页顶部「通透」胶囊可以在 `均衡` / `最透` 之间切，`主题` 胶囊切亮暗。

---

## 八、和现有 `custom.css` 的关系

你的 `custom.css` 已经有 107 处 `backdrop-filter`，卡片样式在历史中被覆写过至少 6 轮（行 43 / 2449 / 2984 / 5467 / 5509 / 6711）。最后一层生效的是行 5467 那组。

**`liquid-glass.css` 的优先级设计**：

- 主体用 `.rj-lg` 单类选择器，**特意不加 `!important`**
- 文字绑定用 `#aside-content .card-widget.rj-lg`（ID + 类 + 类）确保盖过上游
- 如果你的 `custom.css` 里后面还有 `#aside-content .card-widget` 的规则，它会盖掉 `liquid-glass.css`——所以**建议把 `liquid-glass.css` 的内容追加到 `custom.css` 最末尾**，而不是作为独立文件引入。

---

## 九、下一步

需要我做的话，可以直接：
1. 把 `liquid-glass.css` 追加进 `custom.css` 末尾、`liquid-glass.js` 放 `source/js/`，推送上线
2. 同步给主列文章卡片（`#recent-posts > .recent-post-item`）——目前只做了侧栏
3. 加 `prefers-reduced-transparency` 降级（macOS 辅助功能里的「降低透明度」）

### 还想更透的话

现在卡面 `--rj-lg-thin-tint` 已经是 `.10`，再降就是纯透明了。如果仍觉得不够，那就是审美取向了——可以把 `--rj-lg-thick-alpha` 往下调，但**文字对比度会同步下降**，建议一次只调 0.02 并复核。


---

## 十、自适应材质（默认关闭）

`liquid-glass.js` 里带了一个**按壁纸亮度自动微调**的功能：把壁纸画到离屏 canvas，按每张卡片在视口中的位置取对应区域的平均亮度，写到 `--rj-lg-lum`，CSS 据此微调底色深浅。

**启用方式**：给卡片加 `rj-lg--adapt` 类。

实测三张卡背后壁纸亮度：`0.3055 / 0.2352 / 0.1025`（第三张明显更暗）。采样准确、无报错。

**但我建议不启用**，原因有二：

1. 补偿系数只有 0.45，视觉差异几乎看不出来
2. 多了一次壁纸图片加载 + canvas 读取，还得处理跨域污染（壁纸走 CDN 时 `getImageData` 会抛错，代码里已做静默降级）

功能留着，你要的话加个类就能开。

---

## 十一、如果你还觉得不够透

说句实话：**参数空间已经走到底了**。

- 卡面底色 8%，再往下就是 0
- `brightness` 0.58，再往上文字就过不了 AA
- 中间试过双厚度分层（最清晰但你说不要）、重度模糊（数据证明无效）、SVG 折射（有噪点）

剩下的只有三个方向，都需要你做取舍：

| 方向 | 代价 |
|---|---|
| 换一张更暗、更均匀的壁纸 | 侧栏区域亮度从 0.18 降到 0.10 以下，玻璃就能做得更亮更透 |
| 接受文字对比度降到 3:1 左右 | 视觉上还能看，但不符合 WCAG AA |
| 给侧栏卡片位置做一块固定的暗色背景板 | 玻璃能全透，但壁纸那张区域会被压暗 |

要我按哪个方向做，说一声。


---

## 十二、通透档位与「无磨砂」模式

文件里有两个档位，用类切换：

| 档位 | 类名 | 模糊 | 亮度 | 底色 | 实测对比度 |
|---|---|---|---|---|---|
| 均衡（默认） | 无 | 46px | 0.58 | 8% | **4.80:1** ✅ AA |
| 最透 | `rj-lg--ultra` | **0（无磨砂）** | 0.78 | 4% | **2.09:1** ❌ |

「最透」档按站长要求彻底去掉了磨砂——`backdrop-filter` 里不再有 `blur()`，背景完全清晰地透过来，玻璃只保留「一层极薄的暗色膜 + 边缘光影 + 色散光晕」。

此时文字可读性完全依赖四重字影（1px / 2px / 4px / 32px 逐层扩散）。视觉上能读，但**严格不符合 WCAG AA**。这是明确的审美优先取舍。

切换方式：

```js
// 开启最透
document.querySelectorAll('.rj-lg').forEach(c => c.classList.add('rj-lg--ultra'));
// 关闭
document.querySelectorAll('.rj-lg').forEach(c => c.classList.remove('rj-lg--ultra'));
```

---

## 十二、发布约定（站长已确认，长期生效）

**改完就自动推送，不用再问。**

| 项 | 约定 |
|---|---|
| 目标仓库 | `RockJesus/rockjesus-blog`，分支 `main` |
| CSS | → `source/css/liquid-glass.css` |
| JS | → `source/js/liquid-glass.js` |
| 本文档 | → `docs/liquid-glass-README.md` |
| 推送方式 | GitHub Contents API（沙箱内 `git clone` 直连 github.com:443 会超时，`curl`/REST 正常） |
| 版本号 | 每次推送同步递增文件头 `version:` 与本文件顶部版本 |
| 预览 HTML | **不推**。165KB 内嵌 base64 壁纸，属本地查看用产物 |

版本递增规则：

```
MAJOR  破坏性变更（改令牌名、改类名、删档位）
MINOR  新增档位 / 新增可调令牌
PATCH  纯调参、修 bug、文档修正
```


---

## 十三、全站统一（liquid-glass-global.css）

2026-11-05 晚，站长要求「一并统一网站内所有卡片、弹窗、下拉菜单等」。

### 覆盖范围

| 组件 | 选择器 | 虚化 | 说明 |
|---|---|---|---|
| 主列文章卡 | `#recent-posts > .recent-post-item` | 88px | 原为暗玻璃 28px |
| 侧栏卡片 | `#aside-content .card-widget` | 88px | 同复刻档 |
| 导航胶囊 | `#nav #menus` / `#nav #blog_name` | 44px | 原为 `#f8f9fc` 实色 |
| 下拉菜单 | `.menus_item_child`（含 `.rj-qr-menu`） | 40px | 原为实心深板 |
| 搜索弹窗 | `.search-dialog` | 40px | — |
| 移动侧滑 | `#sidebar-menus` | 40px + 额外自发光 | 背后常是纯黑封面 |
| 播放列表 | `.aplayer .aplayer-list` | 40px | — |
| 404 卡片 | `#error-wrap .error-content` | 48px | 含紫色占位块透明化 |
| 正文容器 | `#article-container` | — | 单独加厚，见下 |

### 两个必须记住的教训

**① 亮玻璃在暗背景上等于「不存在」。**

复刻档材质是「白 5% + 88px 模糊」。站点首页封面是近黑图，玻璃几乎完全消失，只剩一圈白线。参考图之所以亮，是因为 iPhone 截图里背后本身就有彩色内容 —— 玻璃是乘法的，背后为 0 时乘什么都是 0。

解法：
- 基色提到 9%，角部柔光 20%
- 额外叠两层 `radial-gradient` 白色自发光（加法，不违反「无暗膜」原则）
- 移动端侧滑单独再加一档（26% / 16%），因为那里背后永远是黑封面

**② 同一材质要有「厚度差」，不是全站一个参数。**

正文是几千字连续阅读，88px 透光会让文字不断跟壁纸星点争注意力。正文容器单独叠一层 22% 暗底 + 4px 模糊，回到「薄玻璃」档。这不是不统一，而是 iOS 的 Thick/Regular/Thin 三档逻辑 —— 信息密度决定玻璃厚度。

### 选择器特异性的坑（第二次踩）

`custom.css` 里有大量 `[data-theme='light'] #nav ...`、`:root:not([data-theme='light']) #aside-content .card-widget` 这类高特异性规则，实测特异性可达 (1,2,1)。

**规则**：本文件所有选择器统一用 `html #xxx` 双类前缀，必要时加 `!important`。缺一个都会被 custom.css 压回去，而且**不报错、不提示**，只能靠 `getComputedStyle` 逐项核对。

### 部署踩坑：commit_refs_rules

推送后首次构建失败：

```
remote: fatal error in commit_refs_rules
! [remote rejected] master -> master
```

这是 `RockJesus.github.io` 仓库侧的推送规则临时拒绝，**与代码无关**（同一次构建的 hexo g 全部成功）。等 2 分钟重新推一次即通过。遇到这个错误不要改代码，先重试。

另外：本 token 无 `actions:write` 权限，**不能 rerun failed workflow**，只能靠新提交触发。
