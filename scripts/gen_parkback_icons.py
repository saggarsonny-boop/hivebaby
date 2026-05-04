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
    """Lead with a clean gold hexagon (#D4AF37) on a dark background, with a
    small dark "P" centred inside. Replaces the older P-with-pin glyph so
    the home-screen icon reads as a Hive cell at small sizes."""
    img = Image.new("RGBA", (size, size), BLACK)
    draw = ImageDraw.Draw(img)

    # Flat-top regular hexagon inscribed in a square ~80% of the canvas.
    pad = int(size * 0.10)
    w = size - 2 * pad
    h = int(w * 0.866)
    cx, cy = size // 2, size // 2
    # Vertices of a flat-top regular hex centred on (cx, cy):
    #   left (-w/2, 0), top-left (-w/4, -h/2), top-right (w/4, -h/2),
    #   right (w/2, 0), bottom-right (w/4, h/2), bottom-left (-w/4, h/2).
    verts = [
        (cx - w // 2, cy),
        (cx - w // 4, cy - h // 2),
        (cx + w // 4, cy - h // 2),
        (cx + w // 2, cy),
        (cx + w // 4, cy + h // 2),
        (cx - w // 4, cy + h // 2),
    ]
    # Soft outer glow — 3 concentric hex outlines, fading.
    for spread, alpha in [(int(size * 0.04), 25), (int(size * 0.025), 50), (int(size * 0.012), 90)]:
        glow = [
            (cx - (w // 2 + spread), cy),
            (cx - (w // 4 + spread // 2), cy - (h // 2 + spread)),
            (cx + (w // 4 + spread // 2), cy - (h // 2 + spread)),
            (cx + (w // 2 + spread), cy),
            (cx + (w // 4 + spread // 2), cy + (h // 2 + spread)),
            (cx - (w // 4 + spread // 2), cy + (h // 2 + spread)),
        ]
        # Pillow doesn't support alpha on polygon outline directly without RGBA;
        # composite a transparent layer.
        layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        ImageDraw.Draw(layer).polygon(glow, outline=(212, 175, 55, alpha))
        img = Image.alpha_composite(img, layer)
    draw = ImageDraw.Draw(img)

    # Solid gold hex fill.
    draw.polygon(verts, fill=GOLD)
    # Darker rim (the bottom edges, simulating a chamfered cell).
    rim_dim = (138, 111, 31, 255)
    draw.line([verts[3], verts[4]], fill=rim_dim, width=max(2, size // 96))
    draw.line([verts[4], verts[5]], fill=rim_dim, width=max(2, size // 96))
    draw.line([verts[5], verts[0]], fill=rim_dim, width=max(2, size // 96))
    # Top-edge highlight (lighter gold).
    rim_hi = (255, 230, 161, 255)
    draw.line([verts[0], verts[1]], fill=rim_hi, width=max(1, size // 128))
    draw.line([verts[1], verts[2]], fill=rim_hi, width=max(1, size // 128))
    draw.line([verts[2], verts[3]], fill=rim_hi, width=max(1, size // 128))

    # Small dark "P" centred inside.
    font = find_bold_font(int(size * 0.42))
    text = "P"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    tx = cx - tw // 2 - bbox[0]
    ty = cy - th // 2 - bbox[1] - int(size * 0.01)
    # Slight inner shadow for the letter — black with a touch of warm.
    draw.text((tx + max(1, size // 192), ty + max(1, size // 192)), text, font=font, fill=(48, 36, 8, 200))
    draw.text((tx, ty), text, font=font, fill=BLACK)

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
    draw.text((bx, H // 2 + 80), "Works in any dead zone — no signal needed.", font=sub_font, fill=GOLD)
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
