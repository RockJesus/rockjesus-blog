#!/usr/bin/env python3
"""
把 head 里注入的 4 个样式表按原顺序合并成一个并做保守压缩。

为什么合并：站点前置代理只给 HTTP/1.1（每域名 6 并发），这 4 个 CSS
在窄链路上每个都要吃 1-5 秒 TTFB，合并后只付一次。

压缩只做三件不改变语义的事：
  1. 删 /* ... */ 注释（字符串里的注释形态保留）；
  2. 连续空白压成单个空格；
  3. 去掉 { } ; 前后的多余空格与首尾空白。
字符串、url()、选择器里的内容一律不碰。
"""
import os, re, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, 'source', 'css')
ORDER = ['tokens.css', 'custom.css', 'liquid-glass.css', 'liquid-glass-global.css']
OUT = os.path.join(SRC_DIR, 'bundle.min.css')


def strip_comments(css):
    out, i, n = [], 0, len(css)
    while i < n:
        c = css[i]
        if c in ('"', "'"):
            q = c
            out.append(c)
            i += 1
            while i < n:
                out.append(css[i])
                if css[i] == '\\':
                    if i + 1 < n:
                        out.append(css[i + 1])
                        i += 2
                        continue
                elif css[i] == q:
                    i += 1
                    break
                i += 1
            continue
        if c == '/' and i + 1 < n and css[i + 1] == '*':
            end = css.find('*/', i + 2)
            i = n if end < 0 else end + 2
            continue
        out.append(c)
        i += 1
    return ''.join(out)


def squeeze(css):
    css = strip_comments(css)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*\{\s*', '{', css)
    css = re.sub(r'\s*\}\s*', '}', css)
    css = re.sub(r'\s*;\s*', ';', css)
    css = re.sub(r';\}', '}', css)
    return css.strip()


def main():
    parts = []
    for name in ORDER:
        path = os.path.join(SRC_DIR, name)
        with open(path, encoding='utf-8') as f:
            raw = f.read()
        parts.append(squeeze(raw))
        print(f'  {name:28s} {os.path.getsize(path)/1024:7.1f} KB -> 压缩后待合并')
    bundle = '\n'.join(parts)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(bundle)
    src_total = sum(os.path.getsize(os.path.join(SRC_DIR, n)) for n in ORDER)
    out_size = os.path.getsize(OUT)
    h = hashlib.md5(bundle.encode()).hexdigest()[:10]
    print(f'\n源文件合计 {src_total/1024:.1f} KB -> bundle.min.css {out_size/1024:.1f} KB '
          f'（省 {(1-out_size/src_total)*100:.1f}%），md5={h}')


if __name__ == '__main__':
    main()
