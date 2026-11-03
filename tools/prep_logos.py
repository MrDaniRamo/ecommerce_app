"""Turn the Los Dados del Norte logo artwork into the web images in storefront/img.

Usage (needs Pillow: pip install pillow):
    python3 tools/prep_logos.py STACKED_LOGO HORIZONTAL_LOGO storefront/img

The original artwork is kept in brand/:
    python3 tools/prep_logos.py brand/logo-stacked-original.webp brand/logo-horizontal-original.webp storefront/img

STACKED_LOGO is the version with the name under the mark, HORIZONTAL_LOGO the version with
the name beside it. Both are expected on a plain white background, at the layout of the
original 1414 x 2000 (stacked) and 2000 x 1414 (horizontal) files; if the artwork moves,
update the lettering boxes near the bottom of this file.

It writes three transparent WebP files:
    logo-stacked.webp     720 px wide, for the hero
    logo-horizontal.webp  144 px tall, for the header
    logo-mark.webp        192 px tall, the hat, die and mustache alone, for the footer
"""
import sys
from collections import deque
from PIL import Image

def knock_out_background(im, tol=28, text_box=None):
    """Make the white background transparent. Only white connected to the image border is
    removed (a flood fill), so white details inside the artwork are kept. Light pixels at the
    edge of the artwork get partial transparency, which keeps the outline smooth."""
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    def whiteness(p):  # 0 = pure white, larger = further from white
        return max(255 - p[0], 255 - p[1], 255 - p[2])
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    # Inside the lettering, every near-white pixel is background too: this clears the
    # enclosed holes in letters like O, D and A, which the edge fill can't reach.
    if text_box:
        l, t, r, b = text_box
        for y in range(t, b):
            for x in range(l, r):
                if whiteness(px[x, y]) < tol // 2: q.append((x, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]: continue
        seen[i] = 1
        p = px[x, y]
        d = whiteness(p)
        if d > tol: continue
        # fully transparent for near-white, partial for the anti-aliased fringe
        px[x, y] = (p[0], p[1], p[2], 0 if d < tol // 2 else int(255 * d / tol))
        if d >= tol // 2: continue  # fringe pixel: don't flood past it
        for nx, ny in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny*w+nx]:
                q.append((nx, ny))
    return im

def trim(im, pad=4):
    box = im.getchannel("A").getbbox()
    l, t, r, b = box
    return im.crop((max(0,l-pad), max(0,t-pad), min(im.width,r+pad), min(im.height,b+pad)))

def save(im, path, height=None, width=None):
    if height: im = im.resize((round(im.width * height / im.height), height), Image.LANCZOS)
    if width: im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, "WEBP", quality=90, method=6)
    print(path, im.size)

stacked_src, horizontal_src, out = sys.argv[1], sys.argv[2], sys.argv[3]
# Lettering areas in the source files (pixels): below the mark in the stacked logo,
# right of the mark in the horizontal one.
stacked_im, horizontal_im = Image.open(stacked_src), Image.open(horizontal_src)
stacked = trim(knock_out_background(stacked_im, text_box=(0, 1210, stacked_im.width, stacked_im.height)))
horizontal = trim(knock_out_background(horizontal_im, text_box=(830, 0, horizontal_im.width, horizontal_im.height)))
save(stacked, f"{out}/logo-stacked.webp", width=720)        # hero, shown up to ~360px wide
save(horizontal, f"{out}/logo-horizontal.webp", height=144)  # header, shown ~48px tall
# The mark alone: the left part of the horizontal logo, before the lettering starts.
alpha = horizontal.getchannel("A")
cols = [any(alpha.getpixel((x, y)) for y in range(0, horizontal.height, 2)) for x in range(horizontal.width)]
# find the first fully empty column gap after the mark
x = 0
while x < len(cols) and not cols[x]: x += 1
while x < len(cols) and cols[x]: x += 1
mark = trim(horizontal.crop((0, 0, x, horizontal.height)))
save(mark, f"{out}/logo-mark.webp", height=192)              # footer and small spots
