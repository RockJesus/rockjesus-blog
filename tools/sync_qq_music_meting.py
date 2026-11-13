#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""通过 Meting 大陆中转抓取 QQ 歌单直链，供 GitHub Actions 自动刷新。

为什么必须中转：
  GitHub Actions 的 runner 跑在海外机房，直接调 u.y.qq.com 的 CgiGetVkey
  会因版权按地区授权而大面积返回 104003 —— 实测 3069 首里只有 128 首可用，
  而中国大陆出口能拿到 910 首。Meting 公共实例部署在中国大陆，由它生成
  vkey 再 302 跳到真实直链，本脚本只负责采集，因此不受 runner 出口 IP 影响。

直链特征（实测 2026-11-13）：
  https://aqqmusic.tc.qq.com/M500<mid>.mp3?guid=...&vkey=...
  响应带 Access-Control-Allow-Origin: * 且支持 Range，可直接交给前端
  crossOrigin=anonymous 做真实频谱（域名已在 player.js 白名单内）。

用法：
  python3 tools/sync_qq_music_meting.py [输出路径]
  环境变量 QQ_PLAYLIST_ID / QQ_WORKERS / QQ_TIMEOUT 可覆盖默认值。
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

PLAYLIST_ID = os.environ.get('QQ_PLAYLIST_ID', '3787157504')
OUT = sys.argv[1] if len(sys.argv) > 1 else 'source/data/playlist.json'
WORKERS = int(os.environ.get('QQ_WORKERS', '8'))
TIMEOUT = float(os.environ.get('QQ_TIMEOUT', '20'))

UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0 Safari/537.36')

# (列表模板, 单曲直链模板)；按顺序尝试，前一个挂了自动退到下一个
SOURCES = [
    ('https://api.vlssu.com/meting/?server=tencent&type=playlist&id={pl}',
     'https://api.vlssu.com/meting/?server=tencent&type=url&id={mid}'),
    ('https://api.injahow.cn/meting/?server=tencent&type=playlist&id={pl}',
     'https://api.injahow.cn/meting/?server=tencent&type=url&id={mid}'),
]


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """禁止自动跟随 302：我们要的是 Location 里的真实 CDN 直链。"""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


OPENER = urllib.request.build_opener(NoRedirect)


def get(url, timeout=None):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': '*/*'})
    return OPENER.open(req, timeout=timeout or TIMEOUT)


def fetch_list():
    for list_tpl, _ in SOURCES:
        url = list_tpl.format(pl=PLAYLIST_ID)
        try:
            with get(url, 40) as r:
                raw = json.loads(r.read().decode('utf-8', 'replace'))
        except Exception as exc:
            print('LIST FAIL %s: %s' % (url, exc), flush=True)
            continue
        if not isinstance(raw, list) or not raw:
            print('LIST EMPTY %s' % url, flush=True)
            continue
        items = []
        for it in raw:
            if not isinstance(it, dict):
                continue
            u = it.get('url') or ''
            m = re.search(r'id=([0-9A-Za-z]+)', u)
            if not m:
                continue
            items.append({
                'mid': m.group(1),
                'name': it.get('name') or it.get('title') or '',
                'artist': it.get('artist') or it.get('author') or '',
                'cover': it.get('pic') or it.get('cover') or it.get('cover_url') or '',
            })
        if items:
            print('LIST %s -> %d 首' % (url, len(items)), flush=True)
            return items
    return []


def resolve(item, tpl):
    url = tpl.format(mid=item['mid'])
    try:
        r = get(url)
        code = r.getcode()
        loc = r.headers.get('Location') or ''
        r.close()
    except urllib.error.HTTPError as exc:
        code = exc.code
        loc = ''
        if exc.headers is not None:
            loc = exc.headers.get('Location') or ''
    except Exception:
        return None
    if code != 302 or 'vkey=' not in loc:
        return None
    if loc.startswith('http://'):
        loc = 'https://' + loc[len('http://'):]
    return loc


def work(item):
    for _, tpl in SOURCES:
        loc = resolve(item, tpl)
        if loc:
            return loc
    return None


def main():
    items = fetch_list()
    if not items:
        print('ABORT: 歌单列表抓取失败（中转实例可能不可用）', flush=True)
        sys.exit(1)

    total = len(items)

    # 快速模式：一首歌是否可播在 22 小时尺度上基本稳定，没必要每轮都把
    # 3069 首全探一遍（GitHub runner 跨境访问大陆中转很慢，全量要 20 分钟+）。
    # 默认只重新解析上一版已确认可播的 mid，把单轮压到三分之一；
    # UTC 周一 0-6 点那次（对应北京时间周一上午的定时）自动做全量扫描，
    # 用来发现歌单新增曲目。QQ_MODE=full / fast 可强制。
    known = set()
    prev = {}
    try:
        with open(OUT, encoding='utf-8') as f:
            prev = json.load(f)
        for t in prev.get('tracks') or []:
            m = re.search(r'(?:M500|M800|C400|F200|O400)([0-9A-Za-z]+)\.', t.get('url') or '')
            if m:
                known.add(m.group(1))
    except Exception:
        prev = {}
        known = set()

    mode = os.environ.get('QQ_MODE', 'auto')
    full = (mode == 'full') or (mode == 'auto' and not known) or \
           (mode == 'auto' and time.gmtime().tm_wday == 0 and time.gmtime().tm_hour < 6)
    if full:
        scan = items
        print('FULL: 全量扫描 %d 首' % len(scan), flush=True)
    else:
        scan = [it for it in items if it['mid'] in known]
        print('FAST: 只重新解析已知可播 %d 首（歌单共 %d 首）' % (len(scan), total), flush=True)

    results = {}
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futures = {ex.submit(work, it): it for it in scan}
        done = 0
        for fut in as_completed(futures):
            it = futures[fut]
            done += 1
            try:
                loc = fut.result()
            except Exception:
                loc = None
            if loc:
                results[it['mid']] = loc
            if done % 500 == 0:
                print('  ..%d/%d playable=%d' % (done, len(scan), len(results)), flush=True)

    tracks = []
    for it in scan:
        u = results.get(it['mid'])
        if not u:
            continue
        tracks.append({
            'name': it['name'],
            'artist': it['artist'],
            'duration': 0,
            'url': u,
            'cover': it['cover'],
        })

    prev = 0
    try:
        with open(OUT, encoding='utf-8') as f:
            prev = int(json.load(f).get('playable') or 0)
    except Exception:
        prev = 0
    floor = max(100, prev)
    if len(tracks) < floor:
        print('ABORT: only %d playable (< floor %d), keep previous playlist untouched'
              % (len(tracks), floor), flush=True)
        sys.exit(1)

    data = {
        'updated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'source': 'qq',
        'playlist': os.environ.get('QQ_PLAYLIST_NAME', 'QQ 歌单'),
        'total': total,
        'playable': len(tracks),
        'tracks': tracks,
        'note': 'QQ 音乐歌单直链，经 Meting 大陆中转生成；vkey 约 22 小时过期，由 GitHub Actions 定时刷新',
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print('WROTE %s playable=%d/%d' % (OUT, len(tracks), total), flush=True)


if __name__ == '__main__':
    main()
