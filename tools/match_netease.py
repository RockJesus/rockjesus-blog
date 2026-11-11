#!/usr/bin/env python3
# 把 QQ 歌单里的曲目逐首匹配到网易云，产出可播放外链。
# 断点续跑：每首结果追加进 --out 指定的 jsonl，已存在的 songmid/name 跳过。
import argparse
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

UA = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) '
                  'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Referer': 'https://music.163.com/',
}
SEARCH = 'https://music.163.com/api/cloudsearch/pc?s=%s&type=1&limit=6&offset=0'


def load_source(path):
    """读上游歌单：优先 tracks（name/artist/duration/url），兼容 songs 列表。"""
    d = json.load(open(path, encoding='utf-8'))
    tracks = d.get('tracks') or d.get('songs') or []
    out = []
    for t in tracks:
        mid = ''
        u = t.get('url') or ''
        m = re.search(r'/C4\d{2}([0-9A-Za-z]{14})\.', u)
        if m:
            mid = m.group(1)
        out.append({
            'name': (t.get('name') or '').strip(),
            'artist': (t.get('artist') or '').strip(),
            'duration': int(float(t.get('duration') or 0)),
            'cover': t.get('cover') or '',
            'mid': mid,
        })
    return out


def search(name, artist, retries=3):
    q = urllib.parse.quote(('%s %s' % (name, artist)).strip())
    url = SEARCH % q
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            raw = urllib.request.urlopen(req, timeout=15).read()
            j = json.loads(raw.decode('utf-8', 'ignore'))
            songs = (j.get('result') or {}).get('songs') or []
            if songs:
                return songs, None
            if j.get('code') == 405:
                raise RuntimeError('rate-limited')
            return [], None
        except Exception as e:
            msg = str(e)[:60]
            if 'rate-limited' in msg or '405' in msg:
                time.sleep(3 + i * 4)
                continue
            time.sleep(1 + i * 2)
    return [], msg if 'msg' in dir() else 'request failed'


def pick(songs, name, artist, duration):
    """按时长接近 + 歌手命中给分，分高者优先。"""
    best, best_score = None, -1
    low_artist = artist.lower()
    for s in songs:
        sname = (s.get('name') or '').lower()
        sartists = ' '.join((a.get('name') or '') for a in (s.get('artists') or [])).lower()
        dur = int((s.get('duration') or 0) / 1000)
        score = 0
        if sname == name.lower():
            score += 40
        elif name.lower() in sname or sname in name.lower():
            score += 20
        if low_artist and low_artist in sartists:
            score += 30
        elif low_artist and any(w in sartists for w in low_artist.split()):
            score += 10
        if duration and dur:
            diff = abs(dur - duration)
            if diff <= 3:
                score += 30
            elif diff <= 10:
                score += 15
            elif diff > 60:
                score -= 25
        if score > best_score:
            best, best_score = s, score
    return best, best_score


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--source', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--start', type=int, default=0, help='从第几首开始（分段并行用）')
    ap.add_argument('--sleep', type=float, default=0.45)
    args = ap.parse_args()

    items = load_source(args.source)
    done = set()
    if os.path.exists(args.out):
        for line in open(args.out, encoding='utf-8'):
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
                done.add(rec['key'])
            except Exception:
                pass
    if args.limit:
        items = items[:args.limit]
    if args.start:
        items = items[args.start:]

    fout = open(args.out, 'a', encoding='utf-8')
    ok = miss = fail = 0
    consec_fail = 0
    for idx, it in enumerate(items):
        key = it['mid'] or ('%s|%s' % (it['name'], it['artist']))
        if key in done:
            continue
        songs, err = search(it['name'], it['artist'])
        if err and not songs:
            fail += 1
            consec_fail += 1
            if consec_fail >= 5:
                time.sleep(45)
                consec_fail = 0
            fout.write(json.dumps({'key': key, 'miss': True, 'reason': err}, ensure_ascii=False) + '\n')
        else:
            consec_fail = 0
            if not songs:
                miss += 1
                fout.write(json.dumps({'key': key, 'miss': True, 'reason': 'no-result'}, ensure_ascii=False) + '\n')
            else:
                s, score = pick(songs, it['name'], it['artist'], it['duration'])
                ok += 1
                alb = (s.get('album') or {})
                fout.write(json.dumps({
                    'key': key,
                    'song_id': s['id'],
                    'nname': s.get('name'),
                    'nartist': ' / '.join((a.get('name') or '') for a in (s.get('artists') or [])),
                    'ndur': int((s.get('duration') or 0) / 1000),
                    'score': score,
                    'cover': alb.get('picUrl') or '',
                }, ensure_ascii=False) + '\n')
        fout.flush()
        if (ok + miss + fail) % 50 == 0:
            print('进度 %d/%d  命中 %d 无果 %d 失败 %d' % (ok + miss + fail, len(items), ok, miss, fail), flush=True)
        time.sleep(args.sleep)
    fout.close()
    print('完成：命中 %d / 无果 %d / 失败 %d（本次处理 %d 首）' % (ok, miss, fail, ok + miss + fail))


if __name__ == '__main__':
    main()
