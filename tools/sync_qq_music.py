# -*- coding: utf-8 -*-
"""QQ 音乐歌单 -> source/data/playlist.json（零依赖，可在任意机器跑）

- 歌单元数据：c.y.qq.com fcg_ucc_getcdinfo_byids_cp，匿名可取全量
- 音频直链：u.y.qq.com musicu.fcg vkey.GetVkeyServer，批量取；vkey 有效期约 22 小时（expiration=80400）
- QQ CDN（ws/dl/isure.stream.qqmusic.qq.com）回 Access-Control-Allow-Origin: *，
  所以浏览器可直连 + crossOrigin=anonymous + AnalyserNode 取真实频谱，无需任何音频代理
- 只输出「可播」曲目；全量数记在 total 里
"""
import json, os, sys, time, urllib.request, urllib.error

PLID = os.environ.get('QQ_PLID', '3787157504')
OUT = sys.argv[1] if len(sys.argv) > 1 else 'playlist.json'
COOKIE = os.environ.get('QQ_COOKIE', '').strip()
BATCH = 100
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')


def fetch(url, post=None, timeout=30, tries=3):
    h = {'User-Agent': UA, 'Referer': 'https://y.qq.com/'}
    if COOKIE:
        h['Cookie'] = COOKIE
    if post is not None:
        h['Content-Type'] = 'application/json'
    last = None
    for _ in range(tries):
        try:
            req = urllib.request.Request(
                url, data=json.dumps(post).encode() if post is not None else None, headers=h)
            return urllib.request.urlopen(req, timeout=timeout).read().decode('utf-8', 'ignore')
        except Exception as e:
            last = e
            time.sleep(1.5)
    raise last


def main():
    raw = fetch('https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
                '?type=1&json=1&utf8=1&onlysong=0&new_format=1&disstid=%s&format=json'
                '&g_tk=5381&uin=0&loginUin=0&hostUin=0&platform=wk_v15&needNewCode=0' % PLID)
    obj = json.loads(raw[raw.find('{'):raw.rfind('}') + 1])
    cd = obj['cdlist'][0]
    songs = cd.get('songlist', [])
    plname = cd.get('dissname') or '我喜欢'
    print('playlist=%s total=%s' % (plname, len(songs)), flush=True)

    # 统一字段
    items = []
    for s in songs:
        mid = s.get('songmid') or s.get('mid')
        if not mid:
            continue
        singers = s.get('singer') or []
        artist = '/'.join([x.get('name', '') for x in singers if x.get('name')])
        alb = s.get('album') or {}
        albummid = alb.get('mid') or s.get('albummid') or ''
        items.append({
            'mid': mid,
            'name': s.get('songname') or s.get('name') or '',
            'artist': artist,
            'duration': int(s.get('interval') or 0),
            'albummid': albummid,
        })
    print('parsed=%d' % len(items), flush=True)

    # 批量取 vkey
    url_map = {}
    codes = {}
    uin = '0'
    if COOKIE:
        import re
        m = re.search(r'uin=(\d+)', COOKIE)
        if m:
            uin = m.group(1)

    for i in range(0, len(items), BATCH):
        chunk = items[i:i + BATCH]
        mids = [x['mid'] for x in chunk]
        body = {"req_0": {"module": "vkey.GetVkeyServer", "method": "CgiGetVkey", "param": {
            "guid": "10000", "songmid": mids, "songtype": [0] * len(mids),
            "uin": uin, "loginflag": 1, "platform": "20"}},
            "comm": {"uin": int(uin) if uin.isdigit() else 0,
                     "format": "json", "ct": 24, "cv": 0}}
        try:
            o = json.loads(fetch('https://u.y.qq.com/cgi-bin/musicu.fcg', body))
            infos = o['req_0']['data']['midurlinfo']
            for inf in infos:
                mid = inf.get('songmid')
                r = inf.get('result')
                codes[r] = codes.get(r, 0) + 1
                purl = inf.get('purl') or ''
                if purl:
                    url_map[mid] = 'https://ws.stream.qqmusic.qq.com/' + purl
        except Exception as e:
            print('batch %d failed: %s' % (i, e), flush=True)
        print('  ..%d/%d playable=%d' % (min(i + BATCH, len(items)), len(items), len(url_map)), flush=True)
        time.sleep(0.25)

    print('vkey codes=%s' % codes, flush=True)

    tracks = []
    for it in items:
        u = url_map.get(it['mid'])
        if not u:
            continue
        cover = ''
        if it['albummid']:
            cover = 'https://y.gtimg.cn/music/photo_new/T002R300x300M000%s.jpg' % it['albummid']
        tracks.append({'name': it['name'], 'artist': it['artist'],
                       'duration': it['duration'], 'url': u, 'cover': cover})

    # 守卫：vkey 通道被风控时（如数据中心 IP 返回 10006）会拿不到直链，
    # 这时绝不能把线上好数据覆盖成空表，直接失败退出，保留上一版。
    if len(tracks) < 100:
        print('ABORT: only %d playable, keep previous playlist untouched' % len(tracks), flush=True)
        sys.exit(1)

    data = {
        'updated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'source': 'qq',
        'playlist': plname,
        'total': len(items),
        'playable': len(tracks),
        'tracks': tracks,
        'note': 'QQ 音乐歌单直链；vkey 有效期约 22 小时，由定时任务刷新',
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print('WROTE %s playable=%d/%d' % (OUT, len(tracks), len(items)), flush=True)


if __name__ == '__main__':
    main()
