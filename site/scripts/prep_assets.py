"""
One-off asset pipeline. Re-run any time the source photos change:

    python scripts/prep_assets.py      (from /site)

Reads the untouched originals in ../aa-pr-upscaled-photos and writes:
  public/img/<slug>.webp      full width (1672px), for desktop + WebGL textures
  public/img/<slug>-960.webp  960px, for phones
  public/fonts/Charlton-*.woff2

Cleaning steps (client-approved 2026-11-12):
  - hero: remove "CYBERPUNK DREAMS 1 / FROM CHONGQING / 重庆" (top right)
  - crimson: remove "...we found one of them"
  - rooftop: remove the third-party "DP WORLD" sign
"""
import io
import zipfile
from pathlib import Path

import cv2
import numpy as np
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "aa-pr-upscaled-photos"
SITE = Path(__file__).resolve().parents[1]
OUT_IMG = SITE / "public" / "img"
OUT_FONT = SITE / "public" / "fonts"

IMAGES = {
    "hero-chongqing": "landing page-(remove the top right font).png",
    "red-crimson-haze": "Crimson Neon Sign Through Red Haze.png",
    "red-rooftop-gate": "Neon Rooftop Gate in the Rain.png",
    "red-grid": "Neon Red Grid Cityscape.png",
    "gold-reflections": "Golden Reflections Over the Night City.png",
    "neon-canyon": "Neon Hong Kong Traffic Canyon(new).png",  # Section 05 (replaced the silhouette, 2026-11-13)
    "cool-fog": "Neon Fog Over Chongqing Skyline.png",
    "cool-hongkong": "Neon Hong Kong Night Ride.png",
}


def read(name: str) -> np.ndarray:
    data = np.fromfile(str(SRC / name), dtype=np.uint8)  # handles spaces/unicode on Windows
    return cv2.imdecode(data, cv2.IMREAD_COLOR)


def clean_hero(im: np.ndarray) -> np.ndarray:
    """Refill the top-right text box from the surrounding sky, with matched grain."""
    im = im.astype(np.float32)
    h, w = im.shape[:2]
    x0, y0, x1, y1 = 1180, 55, 1625, 198
    m = np.ones((h, w), np.float32)
    m[y0:y1, x0:x1] = 0
    num = cv2.GaussianBlur(im * m[..., None], (0, 0), 45)
    den = cv2.GaussianBlur(m, (0, 0), 45)[..., None]
    fill = num / np.maximum(den, 1e-4)
    ref = im[y1 + 5 : y1 + 80, x0:x1]
    sd = float((ref - cv2.GaussianBlur(ref, (0, 0), 3)).std())
    noise = np.random.default_rng(3).normal(0, sd, (h, w)).astype(np.float32)
    fill = fill + cv2.GaussianBlur(noise, (0, 0), 0.7)[..., None] * 1.6
    a = np.zeros((h, w), np.float32)
    a[y0:y1, x0:x1] = 1
    a = np.clip(cv2.GaussianBlur(a, (0, 0), 10) * 1.6, 0, 1)[..., None]
    return np.clip(im * (1 - a) + fill * a, 0, 255).astype(np.uint8)


def clean_crimson(im: np.ndarray) -> np.ndarray:
    """Inpaint the white caption, then soften the patch to match the bokeh."""
    b, g, _ = cv2.split(im.astype(np.int32))
    x0, y0, x1, y1 = 805, 615, 1510, 690
    m = np.zeros(b.shape, np.uint8)
    sel = ((g > 90) & (b > 70)).astype(np.uint8) * 255
    m[y0:y1, x0:x1] = sel[y0:y1, x0:x1]
    m = cv2.dilate(m, np.ones((9, 9), np.uint8))
    out = cv2.inpaint(im, m, 15, cv2.INPAINT_NS)
    blur = cv2.GaussianBlur(out, (0, 0), 6)
    mm = cv2.dilate(m, np.ones((15, 15), np.uint8)).astype(np.float32) / 255
    mm = cv2.GaussianBlur(mm, (0, 0), 5)[..., None]
    return (out * (1 - mm) + blur * mm).astype(np.uint8)


def clean_rooftop(im: np.ndarray) -> np.ndarray:
    """Inpaint only the bright logo pixels so the fence bars stay intact."""
    x0, y0, x1, y1 = 1508, 402, 1612, 436
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    m = np.zeros(g.shape, np.uint8)
    m[y0:y1, x0:x1] = (g[y0:y1, x0:x1] > 75).astype(np.uint8) * 255
    m = cv2.dilate(m, np.ones((5, 5), np.uint8))
    return cv2.inpaint(im, m, 7, cv2.INPAINT_TELEA)


CLEANERS = {
    "hero-chongqing": clean_hero,
    "red-crimson-haze": clean_crimson,
    "red-rooftop-gate": clean_rooftop,
}


def write_webp(im: np.ndarray, path: Path, quality: int) -> None:
    ok, buf = cv2.imencode(".webp", im, [cv2.IMWRITE_WEBP_QUALITY, quality])
    assert ok
    path.write_bytes(buf.tobytes())


def images() -> None:
    OUT_IMG.mkdir(parents=True, exist_ok=True)
    for slug, name in IMAGES.items():
        im = read(name)
        if slug in CLEANERS:
            im = CLEANERS[slug](im)
        write_webp(im, OUT_IMG / f"{slug}.webp", 101)  # >100 = lossless WebP (client: full quality)
        small = cv2.resize(im, (960, round(im.shape[0] * 960 / im.shape[1])), interpolation=cv2.INTER_AREA)
        write_webp(small, OUT_IMG / f"{slug}-960.webp", 86)
        print("img ", slug)


def fonts() -> None:
    OUT_FONT.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(SRC / "charlton.zip") as z:
        for info in z.infolist():
            if not info.filename.lower().endswith(".otf"):
                continue
            f = TTFont(io.BytesIO(z.read(info)))
            f.flavor = "woff2"
            out = OUT_FONT / (Path(info.filename).stem + ".woff2")
            f.save(str(out))
            print("font", out.name)


if __name__ == "__main__":
    images()
    fonts()
