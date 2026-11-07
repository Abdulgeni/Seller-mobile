import os
import math
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets"))
os.makedirs(ASSETS_DIR, exist_ok=True)

def draw_star(draw, cx, cy, r_outer, r_inner, points=8, fill="#F59E0B", outline="#D97706", width=2):
    coords = []
    angle_step = math.pi / points
    for i in range(2 * points):
        r = r_outer if i % 2 == 0 else r_inner
        angle = i * angle_step - math.pi / 2
        x = cx + r * math.cos(angle)
        y = cy + r * math.sin(angle)
        coords.append((x, y))
    draw.polygon(coords, fill=fill, outline=outline)

def create_luxury_icon(size=1024):
    img = Image.new("RGBA", (size, size), (10, 13, 20, 255))
    draw = ImageDraw.Draw(img)

    cx = size // 2
    cy = size // 2

    # Concentric radial background rings
    for r in range(size // 2, 0, -4):
        alpha = int(255 * (1 - (r / (size // 2)) * 0.45))
        # Subtle charcoal-gold glow in the center
        r_col = int(10 + (35 - 10) * (1 - r / (size // 2)))
        g_col = int(13 + (28 - 13) * (1 - r / (size // 2)))
        b_col = int(20 + (18 - 20) * (1 - r / (size // 2)))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(r_col, g_col, b_col, alpha))

    # Outer rounded gold border
    pad = int(size * 0.08)
    radius = int(size * 0.22)
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=radius,
        outline=(217, 119, 6, 255),
        width=int(size * 0.015)
    )

    # Inner hairline border
    pad_inner = int(size * 0.12)
    radius_inner = int(size * 0.18)
    draw.rounded_rectangle(
        [pad_inner, pad_inner, size - pad_inner, size - pad_inner],
        radius=radius_inner,
        outline=(245, 158, 11, 140),
        width=int(size * 0.005)
    )

    # 4 Corner decorative diamonds
    corner_pad = int(size * 0.15)
    corner_size = int(size * 0.02)
    corners = [
        (corner_pad, corner_pad),
        (size - corner_pad, corner_pad),
        (corner_pad, size - corner_pad),
        (size - corner_pad, size - corner_pad),
    ]
    for (kx, ky) in corners:
        draw_star(draw, kx, ky, corner_size, corner_size // 2, points=4, fill=(245, 158, 11, 200), outline=(217, 119, 6, 255))

    # Center Axumite Star
    star_center_y = int(size * 0.42)
    star_outer = int(size * 0.22)
    star_inner = int(size * 0.09)

    # Outer decorative glow ring
    ring_r = int(star_outer * 1.15)
    draw.ellipse(
        [cx - ring_r, star_center_y - ring_r, cx + ring_r, star_center_y + ring_r],
        outline=(217, 119, 6, 80),
        width=int(size * 0.004)
    )

    # Backing 8-pointed star (dark gold)
    draw_star(draw, cx, star_center_y, star_outer, star_inner, points=8, fill=(217, 119, 6, 255), outline=(245, 158, 11, 255), width=int(size * 0.006))
    
    # Layered Inner Star (bright amber gold)
    draw_star(draw, cx, star_center_y, int(star_outer * 0.72), int(star_inner * 0.65), points=8, fill=(251, 191, 36, 255), outline=(254, 243, 199, 255), width=int(size * 0.004))

    # Center jewel dot
    jewel_r = int(size * 0.035)
    draw.ellipse(
        [cx - jewel_r, star_center_y - jewel_r, cx + jewel_r, star_center_y + jewel_r],
        fill=(254, 243, 199, 255),
        outline=(217, 119, 6, 255),
        width=int(size * 0.004)
    )

    # Typography banner
    text_y = int(size * 0.70)
    # Draw "ATELIER"
    # We create vector text or geometric blocks if system font is basic
    try:
        font_large = ImageFont.truetype("arial.ttf", int(size * 0.08))
        font_small = ImageFont.truetype("arial.ttf", int(size * 0.038))
    except Exception:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()

    # Draw ATELIER
    text1 = "A T E L I E R"
    bbox1 = draw.textbbox((0, 0), text1, font=font_large)
    w1 = bbox1[2] - bbox1[0]
    draw.text((cx - w1 // 2, text_y), text1, fill=(245, 158, 11, 255), font=font_large)

    # Horizontal hairline divider
    div_y = text_y + int(size * 0.095)
    div_w = int(size * 0.32)
    draw.line([(cx - div_w // 2, div_y), (cx + div_w // 2, div_y)], fill=(217, 119, 6, 160), width=int(size * 0.003))

    # Center diamond on divider
    draw_star(draw, cx, div_y, int(size * 0.012), int(size * 0.006), points=4, fill=(251, 191, 36, 255), outline=(217, 119, 6, 255))

    # Draw HABESHA
    text2 = "✦  H A B E S H A  ✦"
    bbox2 = draw.textbbox((0, 0), text2, font=font_small)
    w2 = bbox2[2] - bbox2[0]
    draw.text((cx - w2 // 2, div_y + int(size * 0.025)), text2, fill=(254, 243, 199, 230), font=font_small)

    return img

def create_adaptive_foreground(size=512):
    # Android adaptive icon foreground is transparent around the emblem
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = size // 2
    cy = size // 2

    # Emblem in center
    star_outer = int(size * 0.28)
    star_inner = int(size * 0.12)
    draw_star(draw, cx, cy - int(size * 0.06), star_outer, star_inner, points=8, fill=(217, 119, 6, 255), outline=(245, 158, 11, 255), width=int(size * 0.008))
    draw_star(draw, cx, cy - int(size * 0.06), int(star_outer * 0.72), int(star_inner * 0.65), points=8, fill=(251, 191, 36, 255), outline=(254, 243, 199, 255), width=int(size * 0.005))

    jewel_r = int(size * 0.045)
    draw.ellipse(
        [cx - jewel_r, (cy - int(size * 0.06)) - jewel_r, cx + jewel_r, (cy - int(size * 0.06)) + jewel_r],
        fill=(254, 243, 199, 255),
        outline=(217, 119, 6, 255),
        width=int(size * 0.005)
    )

    try:
        font = ImageFont.truetype("arial.ttf", int(size * 0.07))
    except Exception:
        font = ImageFont.load_default()

    text = "ATELIER"
    bbox = draw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    draw.text((cx - w // 2, cy + int(size * 0.22)), text, fill=(254, 243, 199, 255), font=font)

    return img

def create_adaptive_background(size=512):
    img = Image.new("RGBA", (size, size), (10, 13, 20, 255))
    draw = ImageDraw.Draw(img)
    cx = size // 2
    cy = size // 2
    # Subtle radial glow
    for r in range(size // 2, 0, -4):
        alpha = int(255 * (1 - (r / (size // 2)) * 0.35))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(22, 28, 42, alpha))
    return img

def main():
    print("Generating Atelier Habesha Luxury App Icons...")
    icon_1024 = create_luxury_icon(1024)
    icon_1024.save(os.path.join(ASSETS_DIR, "icon.png"), "PNG")
    print("Saved icon.png (1024x1024)")

    fg_512 = create_adaptive_foreground(512)
    fg_512.save(os.path.join(ASSETS_DIR, "android-icon-foreground.png"), "PNG")
    print("Saved android-icon-foreground.png (512x512)")

    bg_512 = create_adaptive_background(512)
    bg_512.save(os.path.join(ASSETS_DIR, "android-icon-background.png"), "PNG")
    print("Saved android-icon-background.png (512x512)")

    # Monochrome icon for Android 13+ themed icons
    mono = fg_512.copy().convert("L").convert("RGBA")
    mono.save(os.path.join(ASSETS_DIR, "android-icon-monochrome.png"), "PNG")
    print("Saved android-icon-monochrome.png (512x512)")

    # Splash icon
    splash = create_adaptive_foreground(512)
    splash.save(os.path.join(ASSETS_DIR, "splash-icon.png"), "PNG")
    print("Saved splash-icon.png (512x512)")

    # Favicon
    fav = icon_1024.resize((48, 48), Image.Resampling.LANCZOS)
    fav.save(os.path.join(ASSETS_DIR, "favicon.png"), "PNG")
    print("Saved favicon.png (48x48)")
    print("All luxury icons successfully generated!")

if __name__ == "__main__":
    main()
