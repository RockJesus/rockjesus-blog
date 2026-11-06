/**
 * rockjesus.cn 统计代理 — Deno Deploy 版
 * 版本：1.0.0 · 2026-11-07
 *
 * 背景：/js/player.js 前端不持有任何密钥，只请求统计接口，由本服务代持
 * Upstash 密钥并做计数。原计划用 Cloudflare Worker（见 workers/stats/），
 * 因站长选择 Deno Deploy，改写为本文件，接口契约完全一致。
 *
 * 接口：GET|OPTIONS /api/stats
 *   ?incr=CN        国家访问 +1，返回最新国家分布
 *   ?pv=/light/     该路径阅读量 +1，返回 { pv: { "/light/": n } }
 *   ?pv=/light/&only=1   只读该路径阅读量，不计数
 *   无参数          只读，返回 { visits, pv }
 *
 * Deno Deploy 控制台需配置的环境变量（Settings → Environment Variables）：
 *   UPSTASH_URL      https://tight-wren-137459.upstash.io
 *   UPSTASH_TOKEN    轮换后的新 token（建议只给这个服务用）
 *   ALLOWED_ORIGINS  https://rockjesus.cn,https://www.rockjesus.cn （可省略）
 *
 * 与 Cloudflare Worker 版的差异：
 *   1. 环境变量改用 Deno.env.get()；
 *   2. 限流用 isolate 内存 Map（Deno Deploy 无 Cache API），
 *      多实例时各自计数，总量约为配置值 × 实例数，量级足够；
 *   3. 修复原稿 bug：?only=1 只读请求不再触发 INCR（原 worker 稿
 *      只要带 pv 就计数，会导致 sessionStorage 已计过的会话重复 +1）。
 */

const CC_RE = /^[A-Za-z]{2}$/;
const PV_MAX = 200;
const RATE_LIMIT = 40;          // 单 IP 每分钟
const RATE_WINDOW_MS = 60_000;

/* 有阅读量挂载点的文章页白名单（与线上页面一一对应）。
 * 目的：防止被刷出任意 pv_<path> 垃圾键、耗尽 Upstash 免费额度。
 * 新增文章页时在这里加一行。 */
const KNOWN_PV_PATHS = new Set([
  '/', '/ah/', '/alc/', '/cn/', '/en/', '/hdmi/', '/light/',
  '/mouse/', '/oc/', '/qa/', '/tb/', '/theme/',
  '/about/', '/messageboard/',
]);

function corsHeaders(origin) {
  const allow = (Deno.env.get('ALLOWED_ORIGINS') || 'https://rockjesus.cn')
    .split(',').map(s => s.trim()).filter(Boolean);
  const ok = allow.includes(origin);
  return {
    ok,
    headers: {
      'Access-Control-Allow-Origin': ok ? origin : allow[0] || '',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    },
  };
}

function json(body, status, extra) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: Object.assign({
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    }, extra || {}),
  });
}

async function upstash(path, method) {
  const r = await fetch(Deno.env.get('UPSTASH_URL') + path, {
    method: method || 'GET',
    headers: { Authorization: 'Bearer ' + Deno.env.get('UPSTASH_TOKEN') },
  });
  if (!r.ok) throw new Error('upstash ' + r.status);
  return r.json();
}

/* —— 轻量限流：isolate 内存计数 —— */
const rateMap = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || now > e.reset) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  e.count += 1;
  // 顺手清理，防止 Map 无限增长
  if (rateMap.size > 5000) {
    for (const [k, v] of rateMap) if (now > v.reset) rateMap.delete(k);
  }
  return e.count > RATE_LIMIT;
}

async function handler(req) {
  const url = new URL(req.url);
  const origin = req.headers.get('Origin') || '';
  const c = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: c.headers });
  }
  if (req.method !== 'GET') {
    return json({ error: 'method' }, 405, c.headers);
  }

  const ip = (req.headers.get('x-forwarded-for') || '0.0.0.0').split(',')[0].trim();
  if (rateLimited(ip)) {
    return json({ error: 'rate' }, 429, c.headers);
  }
  if (origin && !c.ok) {
    return json({ error: 'origin' }, 403, c.headers);
  }
  if (url.pathname !== '/api/stats') {
    return json({ error: 'notfound' }, 404, c.headers);
  }

  const incr = url.searchParams.get('incr');
  const pv = url.searchParams.get('pv');
  const only = url.searchParams.get('only') === '1';

  try {
    const out = {};

    // —— 国家访问计数 ——
    if (incr && !only) {
      if (!CC_RE.test(incr)) return json({ error: 'cc' }, 400, c.headers);
      await upstash('/incr/visits_' + incr.toUpperCase(), 'POST');
    }
    // 读全部国家键（只读，不暴露其他键）
    const keys = await upstash('/keys/visits_*');
    const ks = (keys.result || []).filter(k => /^visits_[A-Za-z]{2}$/.test(k));
    const visits = {};
    if (ks.length) {
      // 逐键读取：Upstash REST 的 /mget/ 路径对键名编码敏感，键数很少（<30），
      // 用 Promise.all 并发 get 更稳，也避免把空格/斜杠带进路径。
      const vals = await Promise.all(
        ks.map(k => upstash('/get/' + encodeURIComponent(k)).then(j => j.result).catch(() => null))
      );
      ks.forEach((k, i) => {
        const n = parseInt(vals[i], 10);
        if (n > 0) visits[k.slice(7)] = n;
      });
    }

    // —— 文章阅读量 ——
    if (pv !== null) {
      const pvPath = pv.slice(0, PV_MAX);
      if (!/^\/[A-Za-z0-9\-_./%\u4e00-\u9fa5]*$/.test(pvPath)) {
        return json({ error: 'pv' }, 400, c.headers);
      }
      // 去掉尾部的 index.html，与白名单统一（前端 location.pathname 不带它）
      const norm = pvPath.replace(/index\.html$/, '');
      if (!KNOWN_PV_PATHS.has(norm)) {
        return json({ error: 'pv-not-allowed' }, 403, c.headers);
      }
      if (!only) {
        await upstash('/incr/pv_' + encodeURIComponent(norm), 'POST');
      }
      const one = await upstash('/get/pv_' + encodeURIComponent(norm));
      out.pv = { [norm]: parseInt(one.result, 10) || 0 };
    } else {
      // 只读时返回全部页面阅读量（键数有限）
      const pkeys = await upstash('/keys/pv_*');
      const ps = (pkeys.result || []).filter(k => k.startsWith('pv_'));
      const pvMap = {};
      if (ps.length) {
        const vals = await Promise.all(
          ps.map(k => upstash('/get/' + encodeURIComponent(k)).then(j => j.result).catch(() => null))
        );
        ps.forEach((k, i) => {
          const n = parseInt(vals[i], 10);
          if (n > 0) {
            let p = k.slice(3);
            try { p = decodeURIComponent(p); } catch (_e) {}
            pvMap[p] = n;
          }
        });
      }
      out.pv = pvMap;
    }

    out.visits = visits;
    return json(out, 200, c.headers);
  } catch (_e) {
    return json({ error: 'upstream', visits: {}, pv: {} }, 502, c.headers);
  }
}

Deno.serve(handler);
