# rockjesus.cn 统计代理 — Deno Deploy 部署指南

版本：1.0.0 · 2026-11-07

## 背景

2026-11-04 安全修复后，前端不再持有 Upstash token，改走服务端代理 `/api/stats`。
原计划部署 Cloudflare Worker（`workers/stats/`），最终选择 **Deno Deploy**（免费、
GitHub 账号一键登录、无需信用卡）。本文件对应代码 `workers/deno/stats-api.ts`。

**为什么 GitHub Actions 不行**：Actions 是批处理环境，没有公网 HTTP 入口，
前端没法实时调用它做 INCR 计数，最多定时快照——解决不了「数字不更新」。

## 部署步骤（网页操作，约 5 分钟）

1. **登录**：打开 <https://dash.deno.com>，用 GitHub 账号一键授权登录。
2. **新建 Playground**：点 **New Playground**（在线编辑器，不需要装任何东西）。
3. **粘贴代码**：把 [`stats-api.ts`](./stats-api.ts) 的全部内容粘进编辑器，
   覆盖默认代码。文件名 `main.ts` 或 `stats-api.ts` 都可以。
4. **首次部署**：点 **Save & Deploy**，得到专属 URL，形如
   `https://随机词-随机词-随机词.deno.dev`。**把这个 URL 记下来发给站长/助手**，
   前端 `player.js` 的 `STATS_API` 要改成这个地址。
5. **配置环境变量**：项目页 → **Settings → Environment Variables**，添加：

   | 变量名 | 值 | 说明 |
   |---|---|---|
   | `UPSTASH_URL` | `https://tight-wren-137459.upstash.io` | Upstash 控制台可查 |
   | `UPSTASH_TOKEN` | **轮换后的新 token** | 见下方「务必轮换 token」 |
   | `ALLOWED_ORIGINS` | `https://rockjesus.cn,https://www.rockjesus.cn` | 可省略，默认 rockjesus.cn |

6. **重新部署**：环境变量改完后，回到编辑器再点一次 **Save & Deploy** 生效。
7. **验证**：浏览器直接打开 `https://你的URL/api/stats`，应返回类似：

   ```json
   {"pv":{"/light/":37},"visits":{"CN":845,"US":102}}
   ```

## 务必轮换 token

旧 token 曾明文写在前端 `player.js` 里（2026-11-04 已被人拿去 FLUSHALL 清过库），
**必须视为已泄露**。趁这次部署一起换：

1. 登录 <https://console.upstash.com> → 数据库 `tight-wren-137459`；
2. REST 面板 → **Reset / 新建 token**（旧 token 立即失效）；
3. 新 token 只填进 Deno Deploy 的环境变量，**不要**再写进任何前端文件。

代价：11-04 丢失的计数无法找回（那段时间 INCR 一直在静默 401），新 token
启用后计数恢复实时累加，不会再丢。

## 前端切换（部署完成后由助手执行）

拿到 deno.dev URL 后，把 `source/js/player.js` 里：

```js
var STATS_API = '/api/stats';
```

改为：

```js
var STATS_API = 'https://你的URL.deno.dev/api/stats';
```

推送后等 GitHub Pages 构建 + CDN 缓存过期（约 10 分钟），访客分布即恢复实时更新。
**注意**：改动只有一行，`USE_LEGACY_UPSTASH` 保持 `false`，Upstash URL/TOKEN
两个死变量保持空串，不再恢复明文。

## 可选：绑定自定义域名（推荐）

`deno.dev` 子域在部分地区可能偶发被墙。Deno Deploy 免费版支持自定义域名：

1. Deno Deploy 项目 → Settings → Domains → Add Domain，填 `stats.rockjesus.cn`；
2. 按提示在你的 DNS 服务商加一条 CNAME：`stats` → `你的URL.deno.dev`；
3. 证书自动签发。之后前端用 `https://stats.rockjesus.cn/api/stats`，
   与主站同根域，连 CORS 都更干净。

## 与 Cloudflare Worker 版的差异

| 项 | CF Worker（`workers/stats/`） | Deno Deploy（本文件） |
|---|---|---|
| 运行时 | `export default { fetch }` | `Deno.serve(handler)` |
| 环境变量 | `env.UPSTASH_URL` 绑定 | `Deno.env.get()` 控制台配置 |
| 限流 | Cache API / CF 规则 | isolate 内存 Map，40 次/分钟/IP |
| `only=1` 只读 | 旧稿未处理（bug） | ✅ 已修复：不触发 INCR |
| 自定义域名 | 需 DNS 托管在 Cloudflare | 任意 DNS，CNAME 即可 |
| 免费额度 | 10 万请求/天 | 100 万请求/月（个人站绰绰有余） |

接口契约两者完全一致，以后想迁回 CF Worker，前端零改动。

## 本地冒烟测试记录（2026-11-07，Deno 2.9.8）

mock Upstash 下 10 项全部通过：只读、incr、pv 计数、only=1 只读不计数、
非法 Origin 403、非白名单路径 403、非法国家码 400、预检 204、CORS 头正确、
限流第 41 次起 429。
