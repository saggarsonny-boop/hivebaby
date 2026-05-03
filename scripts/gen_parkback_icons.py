"""Generate ParkBack PWA icons: black background, gold 'P' with a pin marker."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "apps" / "parkback" / "public"
OUT_DIR.mkdir(parents=True, exist_ok=True)

GOLD = (212, 175, 55, 255)
BLACK = (0, 0, 0, 255)


def find_bold_font(size: int):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BLACK)
    draw = ImageDraw.Draw(img)

    # Big gold "P"
    font = find_bold_font(int(size * 0.62))
    text = "P"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (size - tw) // 2 - bbox[0] - int(size * 0.04)
    ty = (size - th) // 2 - bbox[1] - int(size * 0.02)
    draw.text((tx, ty), text, font=font, fill=GOLD)

    # Pin marker top-right: teardrop shape
    cx = int(size * 0.74)
    cy = int(size * 0.34)
    r = int(size * 0.12)
    # Filled gold circle
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=GOLD)
    # Pin tail (triangle pointing down)
    tail = [
        (cx - int(r * 0.55), cy + int(r * 0.3)),
        (cx + int(r * 0.55), cy + int(r * 0.3)),
        (cx, cy + int(r * 1.5)),
    ]
    draw.polygon(tail, fill=GOLD)
    # Inner black hole on the pin
    inner = int(r * 0.4)
    draw.ellipse((cx - inner, cy - inner, cx + inner, cy + inner), fill=BLACK)

    return img


for s in (192, 512):
    icon = draw_icon(s)
    out = OUT_DIR / f"icon-{s}.png"
    icon.save(out, "PNG")
    print(f"wrote {out}")
