"""Site icons and the share image, made from the site's own lettering.

- favicon.svg: the "P" of Pinyon Script (the script in her name) as a vector path, on the night ink,
  with three faint long-exposure streaks in the hero's red, amber and white behind it.
- favicon.ico (16/32/48), apple-touch-icon.png (180), icon-512.png: the same mark, rendered.
- og.jpg (1200x630): the hero photograph with her name, for link previews.
Run from site/: python scripts/make_icons.py
"""
import io
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SITE = Path(__file__).resolve().parents[1]
PUB = SITE / 'public'
NM = SITE / 'node_modules'
FONTS = {
    'pinyon': NM / '@fontsource/pinyon-script/files/pinyon-script-latin-400-normal.woff2',
    'serif': NM / '@fontsource-variable/noto-serif-display/files/noto-serif-display-latin-wdth-normal.woff2',
    'sans': NM / '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2',
}
INK, WARM = '#120b0b', '#fff4e2'
STREAKS = [('#e42e08', 0.30, 0.62), ('#e89135', 0.55, 0.5), ('#ebe8da', 0.74, 0.35)]  # colour, x, opacity


def ttf_bytes(woff2: Path) -> io.BytesIO:
    f = TTFont(str(woff2))
    f.flavor = None
    b = io.BytesIO()
    f.save(b)
    b.seek(0)
    return b


# ---------------------------------------------------------------- favicon.svg
font = TTFont(str(FONTS['pinyon']))
gs = font.getGlyphSet()
gname = font.getBestCmap()[ord('P')]
bp = BoundsPen(gs)
gs[gname].draw(bp)
x0, y0, x1, y1 = bp.bounds
pen = SVGPathPen(gs)
gs[gname].draw(pen)
path = pen.getCommands()
# fit the glyph into a 64 box with a margin, flipping font units (y up) to SVG (y down)
box, margin = 64, 9
scale = (box - 2 * margin) / max(x1 - x0, y1 - y0)
gw, gh = (x1 - x0) * scale, (y1 - y0) * scale
tx = (box - gw) / 2 - x0 * scale
ty = (box - gh) / 2 + y1 * scale
streaks = ''.join(
    f'<rect x="{x * box - 1.6:.1f}" y="6" width="3.2" height="52" rx="1.6" fill="url(#s{i})"/>'
    for i, (c, x, o) in enumerate(STREAKS))
grads = ''.join(
    f'<linearGradient id="s{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{c}" stop-opacity="0"/>'
    f'<stop offset=".55" stop-color="{c}" stop-opacity="{o}"/><stop offset="1" stop-color="{c}" stop-opacity="0"/></linearGradient>'
    for i, (c, x, o) in enumerate(STREAKS))
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs>{grads}</defs>
<rect width="64" height="64" rx="14" fill="{INK}"/>
{streaks}
<path transform="translate({tx:.2f} {ty:.2f}) scale({scale:.5f} {-scale:.5f})" fill="{WARM}" d="{path}"/>
</svg>
'''
(PUB / 'favicon.svg').write_text(svg, encoding='utf-8')
print('favicon.svg')


# ---------------------------------------------------------------- raster icons
pinyon = ttf_bytes(FONTS['pinyon'])


def mark(size: int) -> Image.Image:
    s = 4  # supersample
    W = size * s
    im = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, W - 1, W - 1], radius=int(W * 14 / 64), fill=INK)
    # streaks
    for c, x, o in STREAKS:
        layer = Image.new('RGBA', (W, W), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        cx = int(x * W)
        rgb = tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
        top, bot = int(W * 6 / 64), int(W * 58 / 64)
        for yy in range(top, bot):
            t = (yy - top) / (bot - top)
            a = (t / .55 if t < .55 else (1 - t) / .45) * o
            ld.line([(cx - W * 1.6 / 64, yy), (cx + W * 1.6 / 64, yy)], fill=rgb + (int(255 * a),))
        im = Image.alpha_composite(im, layer)
    # the P, sized to the same box as the SVG
    pinyon.seek(0)
    f = ImageFont.truetype(pinyon, int(W * 0.9))
    bb = f.getbbox('P')
    target = W * (64 - 18) / 64
    k = target / max(bb[2] - bb[0], bb[3] - bb[1])
    pinyon.seek(0)
    f = ImageFont.truetype(pinyon, int(W * 0.9 * k))
    bb = f.getbbox('P')
    d = ImageDraw.Draw(im)
    d.text(((W - (bb[2] - bb[0])) / 2 - bb[0], (W - (bb[3] - bb[1])) / 2 - bb[1]), 'P', font=f, fill=WARM)
    return im.resize((size, size), Image.LANCZOS)


mark(180).convert('RGB').save(PUB / 'apple-touch-icon.png')  # iOS ignores transparency: flat ink corners
mark(512).save(PUB / 'icon-512.png')
mark(48).save(PUB / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print('favicon.ico apple-touch-icon.png icon-512.png')


# ---------------------------------------------------------------- og.jpg (1200x630)
W, H = 1200, 630
src = Image.open(PUB / 'img' / 'hero-chongqing.webp').convert('RGB')
r = max(W / src.width, H / src.height)
src = src.resize((round(src.width * r), round(src.height * r)), Image.LANCZOS)
left, top = (src.width - W) // 2, (src.height - H) // 2
og = src.crop((left, top, left + W, top + H))
# darken toward the centre so the name reads, like the hero's scrim
shade = Image.new('L', (W, H), 0)
sd = ImageDraw.Draw(shade)
sd.ellipse([W * 0.12, H * 0.08, W * 0.88, H * 0.92], fill=150)
shade = shade.filter(ImageFilter.GaussianBlur(120))
og = Image.composite(Image.new('RGB', (W, H), (10, 6, 6)), og, shade)
d = ImageDraw.Draw(og)

pinyon.seek(0)
script = ImageFont.truetype(pinyon, 190)
serif = ImageFont.truetype(ttf_bytes(FONTS['serif']), 108)
try:
    serif.set_variation_by_axes([500, 62.5])  # axes are (wght, wdth): the site's condensed display serif
except Exception:
    pass
sans = ImageFont.truetype(ttf_bytes(FONTS['sans']), 26)
try:
    sans.set_variation_by_axes([600, 62])  # (wght, wdth): condensed caps
except Exception:
    pass


def centred(text, font, y, fill, spacing=0):
    if spacing:
        widths = [d.textlength(ch, font=font) for ch in text]
        total = sum(widths) + spacing * (len(text) - 1)
        x = (W - total) / 2
        for ch, w in zip(text, widths):
            d.text((x, y), ch, font=font, fill=fill)
            x += w + spacing
    else:
        w = d.textlength(text, font=font)
        d.text(((W - w) / 2, y), text, font=font, fill=fill)


# glow under the script, then the lettering
glow = Image.new('RGB', (W, H), (0, 0, 0))
gd = ImageDraw.Draw(glow)
gw = gd.textlength('Pragya', font=script)
gd.text(((W - gw) / 2, 120), 'Pragya', font=script, fill=(228, 46, 8))
glow = glow.filter(ImageFilter.GaussianBlur(28))
og = Image.blend(og, Image.composite(glow, og, glow.convert('L')), 0.55)
d = ImageDraw.Draw(og)
centred('Pragya', script, 120, '#fff4e2')
centred('Reddy A', serif, 330, '#f4cec4', spacing=10)
centred('AI/ML  ·  B.TECH CSE  ·  SRM IST RAMAPURAM', sans, 486, '#ebe8da', spacing=2)
og.save(PUB / 'og.jpg', quality=88, optimize=True, progressive=True)
print('og.jpg')
