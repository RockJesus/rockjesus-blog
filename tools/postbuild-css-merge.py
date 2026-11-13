#!/usr/bin/env python3
"""
hexo g 之后跑：把主题编译出来的 /css/index.css 并进 /css/bundle.min.css。

为什么：站点的前置代理只给 HTTP/1.1（每域名 6 并发），两套样式表各付一次
TTFB，而它们又都是阻塞渲染的，首屏平白多一个竞争者（实测 1280×900、
200KB/s 下 141KB 的 index.css 单独吃 1.4s）。合并后首屏只留一个 CSS。

层叠顺序必须保持：head 里 index.css 原本排在 bundle 之前，所以 index 的内容
必须拼在 bundle **前面**（prepend），否则自建样式会被主题样式反向覆盖。

index.css 无 @import / @charset（已核对），可以直接拼，不需要重排。

幂等：bundle 里已有 MARK 就不再拼（同一份 public 重复跑安全）。
每次 hexo g 会重新复制 source/css/bundle.min.css，所以构建流程里必须每次跑。
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, 'public')
IDX = os.path.join(PUB, 'css', 'index.css')
BUN = os.path.join(PUB, 'css', 'bundle.min.css')
MARK = '/*@rj-merged-index*/'

# 主题注入的那一条：<link rel="stylesheet" href="/css/index.css?v=xxx">
LINK_RE = re.compile(r'[ \t]*<link[^>]+href="[^"]*/css/index\.css[^"]*"[^>]*>[ \t]*\r?\n?')


def read_text(path):
    with open(path, 'r', encoding='utf-8', errors='surrogateescape') as f:
        return f.read()


def write_text(path, text):
    with open(path, 'w', encoding='utf-8', errors='surrogateescape') as f:
        f.write(text)


def main():
    if not os.path.exists(IDX) or not os.path.exists(BUN):
        print('skip: index.css 或 bundle.min.css 不存在（未构建？）', file=sys.stderr)
        return 1

    if not (os.path.exists(BUN) and MARK in read_text(BUN)[:400]):
        idx = read_text(IDX).lstrip('\ufeff')
        bun = read_text(BUN)
        if not bun.strip():
            print('skip: bundle.min.css 为空', file=sys.stderr)
            return 1
        merged = MARK + '\n' + idx.rstrip() + '\n' + bun
        write_text(BUN, merged)
        print('merged: index.css %d B + bundle %d B -> %d B' % (len(idx), len(bun), len(merged)))
    else:
        print('merge: already merged, skip concat')

    pages = 0
    stripped = 0
    html_files = []
    for dirpath, _dirs, files in os.walk(PUB):
        for name in files:
            if name.endswith('.html'):
                html_files.append(os.path.join(dirpath, name))

    for path in html_files:
        src = read_text(path)
        if '/css/index.css' not in src:
            continue
        # 只有同时引到 bundle 的页面才能摘掉 index.css，否则会丢主题样式
        if '/css/bundle.min.css' not in src:
            print('WARN: %s 没有 bundle.min.css，保留 index.css' % os.path.relpath(path, ROOT))
            continue
        new, n = LINK_RE.subn('', src)
        if n:
            write_text(path, new)
            pages += 1
            stripped += n

    print('html: %d 页，摘掉 %d 条 index.css 引用' % (pages, stripped))
    if pages == 0:
        print('WARN: 没有任何页面被改写', file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
