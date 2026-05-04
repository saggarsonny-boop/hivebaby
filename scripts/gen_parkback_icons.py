"""Generate ParkBack PWA icons + favicon set + Open Graph image.

Outputs (all under apps/parkback/public/):
  favicon.ico            — multi-resolution ICO bundle (16, 32)
  icon-192.png           — PWA icon, 192x192, hex glyph + "P"
  icon-512.png           — PWA icon, 512x512, hex glyph + "P"
  apple-touch-icon.png   — iOS home-screen icon, 180x180, hex glyph + "P"
  maskable-icon.png      — Android adaptive icon, 512x512, with safe zone
  og.png                 — Open Graph image, 1200x630

Brand language matches the canonical Hive flat-top hex (see
apps/parkback/app/_lib/HexButton.tsx and packages/hive-onboarding/assets/hive-mark.svg):
gold rim with vertical gradient, gold radial inner face, top-edge catchlight,
soft drop-shadow glow. ParkBack's per-engine treatment is the central "P"
glyph on the inner hex face.

Maskable icon places the hex inside the Android safe zone (centred, occupies
~80% of the canvas) so adaptive-icon masks (circle, squircle, etc.) never
clip the hex.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "apps" / "parkback" / "public"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Canonical Hive palette — keep in lockstep with packages/hive-onboarding.
GOLD_HI = (255, 230, 161, 255)
GOLD = (212, 175, 55, 255)
GOLD_DARK = (160, 127, 21, 255)
GOLD_DEEP = (94, 74, 13, 255)
GOLD_DIM = (138, 111, 31, 255)
INK = (10, 10, 10, 255)
BLACK = (0, 0, 0, 255)
PAPER = (245, 241, 230, 255)
MUTED = (154, 149, 136, 255)


def find_bold_font(size: int):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def find_regular_font(size: int):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def hex_vertices(cx: float, cy: float, w: float, h: float):
    """Six vertices of a flat-top regular hex centred at (cx, cy)."""
    sx = w / 100.0
    sy = h / 86.6
    rel = [
        (25 * sx, 0),
        (75 * sx, 0),
        (100 * sx, 43.3 * sy),
        (75 * sx, 86.6 * sy),
        (25 * sx, 86.6 * sy),
        (0, 43.3 * sy),
    ]
    return [(cx - w / 2 + x, cy - h / 2 + y) for (x, y) in rel]


def linear_gradient(width: int, height: int, top_rgba, bottom_rgba) -> Image.Image:
    grad = Image.new("RGBA", (width, height), top_rgba)
    px = grad.load()
    for y in range(height):
        t = y / max(1, height - 1)
        r = int(top_rgba[0] + (bottom_rgba[0] - top_rgba[0]) * t)
        g = int(top_rgba[1] + (bottom_rgba[1] - top_rgba[1]) * t)
        b = int(top_rgba[2] + (bottom_rgba[2] - top_rgba[2]) * t)
        a = int(top_rgba[3] + (bottom_rgba[3] - top_rgba[3]) * t)
        for x in range(width):
            px[x, y] = (r, g, b, a)
    return grad


def draw_hex_with_letter(canvas_size: int, letter: str, hex_fraction: float = 0.78,
                          background: tuple = BLACK) -> Image.Image:
    """Render the canonical Hive flat-top gold hex with `letter` centred on its face."""
    canvas = Image.new("RGBA", (canvas_size, canvas_size), background)

    hex_w = int(canvas_size * hex_fraction)
    hex_h = int(hex_w * 86.6 / 100)
    cx = canvas_size // 2
    cy = canvas_size // 2

    # Soft gold halo behind the hex (matches planet-cell emissive glow).
    shadow = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.polygon(hex_vertices(cx, cy + int(canvas_size * 0.012), hex_w, hex_h),
               fill=(212, 175, 55, 110))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=canvas_size * 0.04))
    canvas = Image.alpha_composite(canvas, shadow)

    # Outer rim — vertical gradient.
    rim_grad = linear_gradient(hex_w, hex_h, GOLD_HI, GOLD_DEEP)
    rim_mask = Image.new("L", (hex_w, hex_h), 0)
    rd = ImageDraw.Draw(rim_mask)
    rd.polygon(hex_vertices(hex_w / 2, hex_h / 2, hex_w, hex_h), fill=255)
    rim_layer = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    rim_layer.paste(rim_grad, (cx - hex_w // 2, cy - hex_h // 2), rim_mask)
    canvas = Image.alpha_composite(canvas, rim_layer)

    # Inner face hex (~14% inset from rim) with simulated radial gradient.
    inner_w = int(hex_w * 0.86)
    inner_h = int(hex_h * 0.86)
    face_layer = Image.new("RGBA", (inner_w, inner_h), (0, 0, 0, 0))
    fd = ImageDraw.Draw(face_layer)
    light_cx = inner_w * 0.32
    light_cy = inner_h * 0.28
    fd.polygon(hex_vertices(inner_w / 2, inner_h / 2, inner_w, inner_h), fill=GOLD_DARK)
    mid_w = int(inner_w * 0.92)
    mid_h = int(inner_h * 0.92)
    fd.polygon(hex_vertices(light_cx + (inner_w / 2 - light_cx) * 0.85,
                            light_cy + (inner_h / 2 - light_cy) * 0.85,
                            mid_w, mid_h), fill=GOLD)
    bright_w = int(inner_w * 0.55)
    bright_h = int(inner_h * 0.55)
    fd.polygon(hex_vertices(light_cx, light_cy, bright_w, bright_h), fill=(255, 217, 110, 220))
    face_layer = face_layer.filter(ImageFilter.GaussianBlur(radius=canvas_size * 0.018))

    face_mask = Image.new("L", (inner_w, inner_h), 0)
    fmd = ImageDraw.Draw(face_mask)
    fmd.polygon(hex_vertices(inner_w / 2, inner_h / 2, inner_w, inner_h), fill=255)
    face_paste = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    face_paste.paste(face_layer, (cx - inner_w // 2, cy - inner_h // 2), face_mask)
    canvas = Image.alpha_composite(canvas, face_paste)

    # Upper-edge catchlight.
    catch = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    cd = ImageDraw.Draw(catch)
    inner_pts = hex_vertices(cx, cy, inner_w, inner_h)
    catch_path = [inner_pts[5], inner_pts[0], inner_pts[1], inner_pts[2]]
    cd.line(catch_path, fill=(255, 255, 255, 180),
            width=max(2, canvas_size // 200), joint="curve")
    catch = catch.filter(ImageFilter.GaussianBlur(radius=max(1, canvas_size * 0.004)))
    canvas = Image.alpha_composite(canvas, catch)

    # Centred letter on the gold face.
    if letter:
        font = find_bold_font(int(hex_h * 0.55))
        td = ImageDraw.Draw(canvas)
        bbox = td.textbbox((0, 0), letter, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        tx = cx - tw // 2 - bbox[0]
        ty = cy - th // 2 - bbox[1]
        td.text((tx + 1, ty + 1), letter, font=font, fill=(255, 240, 200, 110))
        td.text((tx, ty), letter, font=font, fill=INK)

    return canvas


def draw_og() -> Image.Image:
    """OG image: hex mark on the left, ParkBack tagline column on the right."""
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), BLACK)

    # Subtle radial gold glow behind the mark.
    glow_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    for radius, alpha in [(420, 30), (320, 40), (220, 55)]:
        glow_draw.ellipse(
            (W // 2 - radius - 200, H // 2 - radius - 50,
             W // 2 - 200 + radius, H // 2 - 50 + radius),
            fill=(212, 175, 55, alpha),
        )
    img = Image.alpha_composite(img, glow_layer)

    # Hex mark with "P" on the left.
    mark = draw_hex_with_letter(380, "P", hex_fraction=0.86, background=(0, 0, 0, 0))
    img.paste(mark, (W // 2 - 200 - mark.width // 2, H // 2 - 50 - mark.height // 2), mark)

    # Tagline on the right.
    draw = ImageDraw.Draw(img)
    bx = W // 2 + 40
    draw.text((bx, H // 2 - 200), "ParkBack", font=find_bold_font(40), fill=GOLD)
    draw.text((bx, H // 2 - 90), "never lose", font=find_bold_font(56), fill=PAPER)
    draw.text((bx, H // 2 - 20), "your car again", font=find_bold_font(56), fill=PAPER)
    draw.text((bx, H // 2 + 80), "Works in any dead zone — no signal needed.",
              font=find_regular_font(28), fill=GOLD)
    draw.text((bx, H // 2 + 120), "No app. No signup. Free forever.",
              font=find_regular_font(28), fill=MUTED)

    # Hairline at bottom.
    draw.rectangle((60, H - 60, W - 60, H - 59), fill=GOLD_DIM)
    draw.text((60, H - 50), "parkback.hive.baby", font=find_regular_font(22), fill=GOLD)
    no_agenda = "No ads. No investors. No agenda."
    bbox = draw.textbbox((0, 0), no_agenda, font=find_regular_font(22))
    draw.text((W - 60 - (bbox[2] - bbox[0]), H - 50), no_agenda,
              font=find_regular_font(22), fill=MUTED)

    return img


def main():
    # Standard square icons (192, 512) — solid black background, hex fills 78% of canvas.
    for s in (192, 512):
        icon = draw_hex_with_letter(s, "P")
        out = OUT_DIR / f"icon-{s}.png"
        icon.save(out, "PNG", optimize=True)
        print(f"wrote {out}")

    # apple-touch-icon — iOS home screen, 180px, same treatment as PWA icons.
    apple = draw_hex_with_letter(180, "P")
    apple_out = OUT_DIR / "apple-touch-icon.png"
    apple.save(apple_out, "PNG", optimize=True)
    print(f"wrote {apple_out}")

    # maskable-icon — Android adaptive icon. Safe zone: hex must fit inside the
    # central 80%-diameter circle (Android's documented adaptive-icon mask).
    # We shrink the hex to 60% of canvas so any mask shape (circle, squircle,
    # rounded rect) leaves the full hex visible.
    maskable = draw_hex_with_letter(512, "P", hex_fraction=0.60)
    maskable_out = OUT_DIR / "maskable-icon.png"
    maskable.save(maskable_out, "PNG", optimize=True)
    print(f"wrote {maskable_out}")

    # favicon.ico — multi-res bundle (16, 32) generated by downscaling the
    # 192px icon. Pillow's ICO encoder accepts a list of sizes via .save's
    # `sizes` arg.
    favicon_src = draw_hex_with_letter(64, "P")  # render larger then downscale
    favicon_out = OUT_DIR / "favicon.ico"
    favicon_src.save(favicon_out, "ICO", sizes=[(16, 16), (32, 32)])
    print(f"wrote {favicon_out}")

    # OG image.
    og = draw_og().convert("RGB")
    og_out = OUT_DIR / "og.png"
    og.save(og_out, "PNG", optimize=True)
    print(f"wrote {og_out}")


if __name__ == "__main__":
    main()
