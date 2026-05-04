"""Generate ParkBack PWA icons + Open Graph image.

Outputs (all under apps/parkback/public/):
  icon-192.png  — PWA icon, 192x192
  icon-512.png  — PWA icon, 512x512
  og.png        — Open Graph image, 1200x630
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "apps" / "parkback" / "public"
OUT_DIR.mkdir(parents=True, exist_ok=True)

GOLD = (212, 175, 55, 255)
GOLD_DIM = (138, 111, 31, 255)
BLACK = (0, 0, 0, 255)
PAPER = (245, 241, 230, 255)
MUTED = (154, 149, 136, 255)


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


def find_regular_font(size: int):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_p_with_pin(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int) -> None:
    """Render a gold 'P' glyph with a pin marker at top-right, anchored at (cx, cy)."""
    font = find_bold_font(int(size * 0.62))
    text = "P"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = cx - tw // 2 - bbox[0] - int(size * 0.04)
    ty = cy - th // 2 - bbox[1] - int(size * 0.02)
    draw.text((tx, ty), text, font=font, fill=GOLD)

    px = cx + int(size * 0.24)
    py = cy - int(size * 0.16)
    r = int(size * 0.12)
    draw.ellipse((px - r, py - r, px + r, py + r), fill=GOLD)
    tail = [
        (px - int(r * 0.55), py + int(r * 0.3)),
        (px + int(r * 0.55), py + int(r * 0.3)),
        (px, py + int(r * 1.5)),
    ]
    draw.polygon(tail, fill=GOLD)
    inner = int(r * 0.4)
    draw.ellipse((px - inner, py - inner, px + inner, py + inner), fill=BLACK)


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BLACK)
    draw = ImageDraw.Draw(img)
    draw_p_with_pin(draw, size // 2, size // 2, size)
    return img


def draw_og() -> Image.Image:
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), BLACK)
    draw = ImageDraw.Draw(img)

    # Subtle radial gold glow behind the mark
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    for radius, alpha in [(420, 30), (320, 40), (220, 55)]:
        glow_draw.ellipse(
            (W // 2 - radius - 200, H // 2 - radius - 50, W // 2 - 200 + radius, H // 2 - 50 + radius),
            fill=(212, 175, 55, alpha),
        )
    img = Image.alpha_composite(img, glow_layer)
    draw = ImageDraw.Draw(img)

    # Mark: large "P" + pin on the left
    draw_p_with_pin(draw, W // 2 - 200, H // 2 - 50, 360)

    # Tagline on the right
    tagline_font = find_bold_font(56)
    sub_font = find_regular_font(28)
    title = "never lose"
    title2 = "your car again"
    brand = "ParkBack"

    # Brand label (top of right column)
    bx = W // 2 + 40
    draw.text((bx, H // 2 - 200), brand, font=find_bold_font(40), fill=GOLD)
    draw.text((bx, H // 2 - 90), title, font=tagline_font, fill=PAPER)
    draw.text((bx, H // 2 - 20), title2, font=tagline_font, fill=PAPER)
    draw.text((bx, H // 2 + 80), "Tap once to park. Tap again to find.", font=sub_font, fill=MUTED)
    draw.text((bx, H // 2 + 120), "No app. No signup. Free forever.", font=sub_font, fill=MUTED)

    # Hairline at bottom
    draw.rectangle((60, H - 60, W - 60, H - 59), fill=GOLD_DIM)
    draw.text((60, H - 50), "parkback.hive.baby", font=find_regular_font(22), fill=GOLD)
    no_agenda = "No ads. No investors. No agenda."
    bbox = draw.textbbox((0, 0), no_agenda, font=find_regular_font(22))
    draw.text((W - 60 - (bbox[2] - bbox[0]), H - 50), no_agenda, font=find_regular_font(22), fill=MUTED)

    return img


for s in (192, 512):
    icon = draw_icon(s)
    out = OUT_DIR / f"icon-{s}.png"
    icon.save(out, "PNG")
    print(f"wrote {out}")

og = draw_og().convert("RGB")
out = OUT_DIR / "og.png"
og.save(out, "PNG", optimize=True)
print(f"wrote {out}")
