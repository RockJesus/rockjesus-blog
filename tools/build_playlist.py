#!/usr/bin/env python3
# 把「上游歌单 + 网易云匹配结果」合成站点播放器用的 playlist.json。
# 用法：python3 tools/build_playlist.py --source /tmp/up_pl.json --match /tmp/ne_result.jsonl --out source/data/playlist.json
import argparse
import json
import os
import re
from datetime import datetime, timezone

OUTER = 'https://music.163.com/song/media/outer/url?id=%s.mp3'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--source', required=True)
    ap.add_argument('--match', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--min-score', type=int, default=0, help='低于该匹配分的曲目丢弃，默认全保留')
    ap.add_argument('--covers', default='', help='song_id -> 封面 URL 的 JSON 映射（可选）')
    args = ap.parse_args()
    cover_map = {}
    if args.covers:
        cover_map = json.load(open(args.covers, encoding='utf-8'))

    src = json.load(open(args.source, encoding='utf-8'))
    order = []
    meta = {}
    for t in (src.get('tracks') or src.get('songs') or []):
        name = (t.get('name') or '').strip()
        if not name:
            continue
        mid = ''
        m = re.search(r'/C4\d{2}([0-9A-Za-z]{14})\.', t.get('url') or '')
        if m:
            mid = m.group(1)
        key = mid or ('%s|%s' % (name, (t.get('artist') or '').strip()))
        if key in meta:
            continue
        meta[key] = {'name': name, 'artist': (t.get('artist') or '').strip()}
        order.append(key)

    hits = {}
    for line in open(args.match, encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        try:
            r = json.loads(line)
        except Exception:
            continue
        if r.get('song_id'):
            hits[r['key']] = r

    tracks = []
    for key in order:
        h = hits.get(key)
        if not h or not h.get('song_id'):
            continue
        if args.min_score and (h.get('score') or 0) < args.min_score:
            continue
        m = meta[key]
        item = {
            'name': m['name'],
            'artist': m['artist'],
            'url': OUTER % h['song_id'],
        }
        cov = h.get('cover') or cover_map.get(str(h['song_id'])) or ''
        if cov:
            # 统一降到 130×130：封面图省流量，播放器展示尺寸足够
            item['cover'] = cov.split('?')[0] + '?param=130y130'
        tracks.append(item)

    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    data = {
        'updated': now,
        'probed': now,
        'total': len(order),
        'playable': len(tracks),
        'tracks': tracks,
        'note': '音源自网易云官方外链（实时签发、长期有效），按歌名+歌手+时长从 QQ 歌单匹配。',
    }
    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print('写出 %s：源 %d 首 → 可播 %d 首，%.0fKB'
          % (args.out, len(order), len(tracks), os.path.getsize(args.out) / 1024))


if __name__ == '__main__':
    main()
