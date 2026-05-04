"""Generate the canonical Hive logo assets.

Outputs (under packages/hive-onboarding/assets/):
  hive-logo-full.png  — 512x512 PNG. Gold 3D hex with "HIVE" centred in dark
                        text, surrounded by a honeycomb of darker outer cells.
                        This matches Sonny's brief; swap with the canonical art
                        when it's available.
  hive-logo-full.webp — same image as WebP for performance.
  hive-mark.svg       — simplified single-hex SVG (just the central gold cell,
                        no text, no surrounding cells). Same gradient + drop
                        shadow as ParkBack's primary HexButton.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "packages" / "hive-onboarding" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

GOLD = (212, 175, 55, 255)
GOLD_HI = (255, 230, 161, 255)
GOLD_DARK = (160, 127, 21, 255)
GOLD_DIM = (138, 111, 31, 255)
GOLD_DEEP = (94, 74, 13, 255)
INK = (10, 10, 10, 255)
CELL_OUTER = (35, 28, 12, 255)  # very dark warm gold for the surrounding cells
CELL_OUTER_RIM = (74, 60, 24, 255)
BLACK = (0, 0, 0, 255)


def find_bold_font(size: int):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for p in candidates:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def hex_vertices(cx: float, cy: float, radius: float, flat_top: bool = True):
    """Return six (x, y) vertices of a regular hexagon centred at (cx, cy).
    radius = distance from centre to vertex."""
    verts = []
    for i in range(6):
        angle = math.radians(60 * i + (0 if flat_top else 30))
        verts.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    return verts


def draw_filled_hex(img, cx, cy, radius, fill, rim_dark, rim_light, flat_top=True):
    """Draw a hex with a 3D rim — top edges lighter, bottom edges darker."""
    verts = hex_vertices(cx, cy, radius, flat_top=flat_top)
    draw = ImageDraw.Draw(img)
    draw.polygon(verts, fill=fill)
    # Bottom rim (verts 0→1, 1→2 are bottom-right and bottom in flat-top? Let me
    # be explicit. flat_top vertex order at angle 0,60,120,180,240,300:
    #   0°  → right
    #   60° → bottom-right
    #   120° → bottom-left
    #   180° → left
    #   240° → top-left
    #   300° → top-right
    n = len(verts)
    rim_w = max(2, int(radius * 0.04))
    # Bottom three edges: right→bottom-right, bottom-right→bottom-left, bottom-left→left.
    for i in [0, 1, 2]:
        draw.line([verts[i], verts[(i + 1) % n]], fill=rim_dark, width=rim_w)
    # Top three edges: left→top-left, top-left→top-right, top-right→right.
    for i in [3, 4, 5]:
        draw.line([verts[i], verts[(i + 1) % n]], fill=rim_light, width=max(1, rim_w // 2))


def draw_logo(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (12, 12, 12, 255))
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2

    # Geometry: central gold hex + 6 surrounding darker hexes (honeycomb ring).
    # For flat-top hexes, neighbours are offset by (±1.5*r, ±√3/2 * 2r) ... or
    # for tight tiling: neighbour_distance = 2 * r * cos(30°) = r * √3.
    # We'll keep visible gaps so each cell reads as discrete.
    central_r = size * 0.20
    neighbour_r = size * 0.16
    # Distance from central centre to each neighbour centre.
    sep = central_r + neighbour_r + size * 0.02  # small gap between cells
    # 6 neighbours at 30°, 90°, 150°, 210°, 270°, 330° around the centre
    # (rotated so they fit between the central hex's flat edges).
    for k in range(6):
        angle = math.radians(30 + 60 * k)
        nx = cx + sep * math.cos(angle)
        ny = cy + sep * math.sin(angle)
        draw_filled_hex(img, nx, ny, neighbour_r, fill=CELL_OUTER, rim_dark=CELL_OUTER_RIM, rim_light=CELL_OUTER_RIM)

    # Soft outer glow under the central hex.
    for spread, alpha in [(int(size * 0.04), 18), (int(size * 0.025), 36), (int(size * 0.012), 60)]:
        glow = hex_vertices(cx, cy, central_r + spread)
        layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(layer).polygon(glow, outline=(212, 175, 55, alpha))
        img = Image.alpha_composite(img, layer)
    draw = ImageDraw.Draw(img)

    # Central gold hex with rim.
    draw_filled_hex(img, cx, cy, central_r, fill=GOLD, rim_dark=GOLD_DEEP, rim_light=GOLD_HI)

    # "HIVE" wordmark centred in dark text.
    font = find_bold_font(int(size * 0.078))
    text = "HIVE"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = cx - tw / 2 - bbox[0]
    ty = cy - th / 2 - bbox[1] - size * 0.005
    # Subtle inset shadow.
    draw.text((tx + 1, ty + 1), text, font=font, fill=(60, 45, 8, 220))
    draw.text((tx, ty), text, font=font, fill=INK)

    return img


# ─── PNG + WebP ─────────────────────────────────────────────────────────────
master = draw_logo(512)
png_path = OUT / "hive-logo-full.png"
master.save(png_path, "PNG", optimize=True)
print(f"wrote {png_path} ({png_path.stat().st_size} bytes)")
webp_path = OUT / "hive-logo-full.webp"
master.convert("RGB").save(webp_path, "WEBP", quality=88, method=6)
print(f"wrote {webp_path} ({webp_path.stat().st_size} bytes)")

# ─── Simplified mark SVG ────────────────────────────────────────────────────
svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 86.6" role="img" aria-label="Hive">
  <defs>
    <linearGradient id="hive-mark-rim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE6A1"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#5E4A0D"/>
    </linearGradient>
    <filter id="hive-mark-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
      <feOffset dx="0" dy="1" result="shadow"/>
      <feColorMatrix in="shadow" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <polygon
    points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3"
    fill="url(#hive-mark-rim)"
    stroke="#8a6f1f"
    stroke-width="0.8"
    stroke-linejoin="round"
    vector-effect="non-scaling-stroke"
    filter="url(#hive-mark-shadow)"/>
</svg>
'''
svg_path = OUT / "hive-mark.svg"
svg_path.write_text(svg)
print(f"wrote {svg_path} ({svg_path.stat().st_size} bytes)")
