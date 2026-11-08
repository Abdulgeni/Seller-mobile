import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Color Palette: Deep Royal Emerald & 24K Sovereign Gold
EMERALD_DEEP = (2, 36, 28)       # #02241C
EMERALD_RICH = (4, 60, 46)       # #043C2E
EMERALD_GLOW = (6, 78, 59)       # #064E3B
EMERALD_LIGHT = (16, 185, 129)   # #10B981

GOLD_BRIGHT = (252, 211, 77)     # #FCD34D
GOLD_MAIN = (245, 158, 11)       # #F59E0B
GOLD_DEEP = (217, 119, 6)        # #D97706
GOLD_SHADOW = (180, 83, 9)       # #B45309
GOLD_PALE = (254, 243, 199)      # #FEF3C7

def draw_radial_gradient(draw, size, center, inner_color, outer_color):
    cx, cy = center
    max_radius = math.hypot(cx, cy)
    for r in range(int(max_radius), 0, -2):
        t = r / max_radius
        # Non-linear curve for richer center glow
        t_curved = t ** 1.4
        red = int(inner_color[0] * (1 - t_curved) + outer_color[0] * t_curved)
        green = int(inner_color[1] * (1 - t_curved) + outer_color[1] * t_curved)
        blue = int(inner_color[2] * (1 - t_curved) + outer_color[2] * t_curved)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(red, green, blue))

def draw_rub_el_hizb(draw, cx, cy, radius, fill_color, outline_color, outline_width=6):
    """Draws an 8-pointed Islamic Star (Rub el Hizb) formed by two overlapping squares at 45 deg."""
    # First square at 0 degrees
    s = radius
    pts1 = [
        (cx - s, cy - s),
        (cx + s, cy - s),
        (cx + s, cy + s),
        (cx - s, cy + s),
    ]
    # Second square at 45 degrees
    s45 = radius * math.sqrt(2) / 1.0 # adjusted so vertices reach the same radius
    # In Rub el Hizb, vertices lie on circle of radius R.
    # A square inscribed in circle of radius R has vertices at (R*cos(a), R*sin(a))
    pts_sq1 = []
    for deg in [45, 135, 225, 315]:
        rad = math.radians(deg)
        pts_sq1.append((cx + radius * math.cos(rad), cy + radius * math.sin(rad)))

    pts_sq2 = []
    for deg in [0, 90, 180, 270]:
        rad = math.radians(deg)
        pts_sq2.append((cx + radius * math.cos(rad), cy + radius * math.sin(rad)))

    # Draw both polygons
    if fill_color:
        draw.polygon(pts_sq1, fill=fill_color)
        draw.polygon(pts_sq2, fill=fill_color)
    if outline_color:
        draw.polygon(pts_sq1, outline=outline_color, width=outline_width)
        draw.polygon(pts_sq2, outline=outline_color, width=outline_width)

def draw_crescent_and_star(draw, cx, cy, moon_radius, star_radius, color):
    """Draws a refined Islamic Crescent Moon & 8-point Morning Star."""
    # Outer circle for crescent
    # To make a smooth crescent in PIL:
    # We can draw the outer circle, then an offset inner circle with background color,
    # OR we compute the polygon points.
    steps = 100
    outer_pts = []
    inner_pts = []
    
    # Crescent opens towards top-right (e.g. angle -40 to 140 deg)
    # Let's orient crescent opening towards the right
    r_out = moon_radius
    r_in = moon_radius * 0.82
    offset_x = moon_radius * 0.38
    offset_y = 0

    # Outer arc from -80 deg to 80 deg (the back of crescent is on left)
    for i in range(steps + 1):
        angle = math.radians(80 + (280 * i / steps))
        x = cx + r_out * math.cos(angle)
        y = cy + r_out * math.sin(angle)
        outer_pts.append((x, y))

    # Inner arc cutting into the moon
    for i in range(steps + 1):
        angle = math.radians(360 - (280 * i / steps))
        x = cx + offset_x + r_in * math.cos(angle)
        y = cy + offset_y + r_in * math.sin(angle)
        inner_pts.append((x, y))

    crescent_poly = outer_pts + inner_pts
    draw.polygon(crescent_poly, fill=color)

    # 8-point star placed inside the crescent cradle
    star_cx = cx + offset_x + star_radius * 0.4
    star_cy = cy
    draw_8point_star(draw, star_cx, star_cy, star_radius, star_radius * 0.45, color)

def draw_8point_star(draw, cx, cy, r_outer, r_inner, color):
    pts = []
    for i in range(16):
        r = r_outer if i % 2 == 0 else r_inner
        ang = math.radians(i * (360 / 16) - 90)
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    draw.polygon(pts, fill=color)

def draw_ornate_border(draw, width, height, inset, color, line_width=4):
    """Draws luxury border with arabesque corner notches."""
    x0, y0 = inset, inset
    x1, y1 = width - inset, height - inset
    corner_cut = 36

    # Poly with cut corners
    pts = [
        (x0 + corner_cut, y0),
        (x1 - corner_cut, y0),
        (x1, y0 + corner_cut),
        (x1, y1 - corner_cut),
        (x1 - corner_cut, y1),
        (x0 + corner_cut, y1),
        (x0, y1 - corner_cut),
        (x0, y0 + corner_cut),
    ]
    draw.polygon(pts, outline=color, width=line_width)

    # Corner diamond ornaments
    diag = corner_cut * 0.6
    for cx, cy in [(x0 + corner_cut, y0 + corner_cut),
                   (x1 - corner_cut, y0 + corner_cut),
                   (x1 - corner_cut, y1 - corner_cut),
                   (x0 + corner_cut, y1 - corner_cut)]:
        draw_8point_star(draw, cx, cy, diag, diag * 0.4, color)

def generate_halal_market_icons():
    # Render at 2x resolution: 2048x2048, then downscale to 1024x1024 for pristine antialiasing
    w2, h2 = 2048, 2048
    img2 = Image.new("RGBA", (w2, h2), (0, 0, 0, 0))
    draw2 = ImageDraw.Draw(img2)

    # 1. Background radial gradient: Deep Emerald Obsidian
    draw_radial_gradient(draw2, (w2, h2), (w2 // 2, h2 // 2 - 80), EMERALD_GLOW, EMERALD_DEEP)

    # 2. Ornate outer border
    draw_ornate_border(draw2, w2, h2, inset=90, color=GOLD_MAIN, line_width=8)
    draw_ornate_border(draw2, w2, h2, inset=120, color=GOLD_BRIGHT, line_width=3)

    # 3. Outer concentric geometric halo
    cx, cy = w2 // 2, h2 // 2 - 120
    # Outer delicate gold ring
    draw2.ellipse([cx - 520, cy - 520, cx + 520, cy + 520], outline=GOLD_DEEP, width=3)
    draw2.ellipse([cx - 490, cy - 490, cx + 490, cy + 490], outline=GOLD_BRIGHT, width=5)

    # 4. Large Rub el Hizb Star (8-pointed) with layered emerald fill and gold relief
    draw_rub_el_hizb(draw2, cx, cy, radius=460, fill_color=(4, 48, 38, 240), outline_color=GOLD_MAIN, outline_width=10)
    draw_rub_el_hizb(draw2, cx, cy, radius=420, fill_color=(6, 68, 52, 220), outline_color=GOLD_BRIGHT, outline_width=4)

    # Inner concentric 16-point petal rosette
    draw_8point_star(draw2, cx, cy, r_outer=340, r_inner=240, color=GOLD_DEEP)
    draw_8point_star(draw2, cx, cy, r_outer=310, r_inner=210, color=(3, 40, 32))

    # 5. Golden Crescent & Star at the heart of the emblem
    # Crescent and morning star
    draw_crescent_and_star(draw2, cx - 20, cy, moon_radius=155, star_radius=68, color=GOLD_BRIGHT)

    # 6. Typography
    # Try finding system serif font or render clean vector typography
    try:
        font_brand = ImageFont.truetype("timesbd.ttf", 112)
        font_sub = ImageFont.truetype("arialbd.ttf", 46)
        font_arabic = ImageFont.truetype("arial.ttf", 52)
    except Exception:
        try:
            font_brand = ImageFont.truetype("georgiab.ttf", 112)
            font_sub = ImageFont.truetype("arial.ttf", 46)
            font_arabic = font_sub
        except Exception:
            font_brand = ImageFont.load_default()
            font_sub = font_brand
            font_arabic = font_brand

    brand_text = "HALAL MARKET"
    bbox_b = draw2.textbbox((0, 0), brand_text, font=font_brand)
    bw = bbox_b[2] - bbox_b[0]
    by = cy + 540

    # Subtle drop shadow for brand text
    draw2.text((cx - bw // 2 + 3, by + 3), brand_text, fill=(0, 20, 15, 180), font=font_brand)
    draw2.text((cx - bw // 2, by), brand_text, fill=GOLD_PALE, font=font_brand)

    # Decorative separator wings around subtitle
    sub_text = "CERTIFIED PURE · PREMIUM GOODS"
    bbox_s = draw2.textbbox((0, 0), sub_text, font=font_sub)
    sw = bbox_s[2] - bbox_s[0]
    sy = by + 130

    wing_len = 140
    line_y = sy + 24
    draw2.line([(cx - sw // 2 - wing_len - 30, line_y), (cx - sw // 2 - 30, line_y)], fill=GOLD_MAIN, width=3)
    draw_8point_star(draw2, cx - sw // 2 - 30, line_y, 8, 4, GOLD_BRIGHT)

    draw2.line([(cx + sw // 2 + 30, line_y), (cx + sw // 2 + wing_len + 30, line_y)], fill=GOLD_MAIN, width=3)
    draw_8point_star(draw2, cx + sw // 2 + 30, line_y, 8, 4, GOLD_BRIGHT)

    draw2.text((cx - sw // 2, sy), sub_text, fill=GOLD_MAIN, font=font_sub)

    # Downsample to 1024x1024 for master icon.png
    icon_1024 = img2.resize((1024, 1024), Image.Resampling.LANCZOS)
    icon_1024.save(os.path.join(OUTPUT_DIR, "icon.png"), "PNG")
    print("Generated: icon.png (1024x1024)")

    # ─── ANDROID ADAPTIVE FOREGROUND (512x512, transparent background) ───
    # Android adaptive icons place content within the central 66% (radius ~ 168px out of 256px).
    # We render the central emblem and brand text scaled to fit inside the safe zone.
    fg_canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    fg_draw = ImageDraw.Draw(fg_canvas)

    fg_cx, fg_cy = 512, 470
    # Draw Rub el Hizb and Crescent Star centered for the adaptive mask
    draw_rub_el_hizb(fg_draw, fg_cx, fg_cy, radius=260, fill_color=(4, 48, 38, 255), outline_color=GOLD_MAIN, outline_width=8)
    draw_rub_el_hizb(fg_draw, fg_cx, fg_cy, radius=235, fill_color=(6, 68, 52, 255), outline_color=GOLD_BRIGHT, outline_width=3)
    draw_8point_star(fg_draw, fg_cx, fg_cy, r_outer=190, r_inner=130, color=GOLD_DEEP)
    draw_8point_star(fg_draw, fg_cx, fg_cy, r_outer=170, r_inner=110, color=(3, 40, 32))
    draw_crescent_and_star(fg_draw, fg_cx - 10, fg_cy, moon_radius=90, star_radius=40, color=GOLD_BRIGHT)

    # Wordmark in adaptive foreground
    fg_text = "HALAL MARKET"
    try:
        font_fg = ImageFont.truetype("timesbd.ttf", 60)
    except Exception:
        font_fg = font_brand
    bbox_fg = fg_draw.textbbox((0, 0), fg_text, font=font_fg)
    fg_w = bbox_fg[2] - bbox_fg[0]
    fg_draw.text((fg_cx - fg_w // 2, fg_cy + 300), fg_text, fill=GOLD_PALE, font=font_fg)

    fg_512 = fg_canvas.resize((512, 512), Image.Resampling.LANCZOS)
    fg_512.save(os.path.join(OUTPUT_DIR, "android-icon-foreground.png"), "PNG")
    print("Generated: android-icon-foreground.png (512x512)")

    # ─── ANDROID ADAPTIVE BACKGROUND (512x512) ───
    bg_canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg_canvas)
    draw_radial_gradient(bg_draw, (1024, 1024), (512, 512), EMERALD_GLOW, EMERALD_DEEP)
    # Subtle geometric grid watermark in background
    for r in [200, 350, 480]:
        bg_draw.ellipse([512 - r, 512 - r, 512 + r, 512 + r], outline=(16, 185, 129, 30), width=2)
    bg_512 = bg_canvas.resize((512, 512), Image.Resampling.LANCZOS)
    bg_512.save(os.path.join(OUTPUT_DIR, "android-icon-background.png"), "PNG")
    print("Generated: android-icon-background.png (512x512)")

    # ─── ANDROID MONOCHROME ICON (512x512 transparent, crisp white) ───
    mono_canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    mono_draw = ImageDraw.Draw(mono_canvas)
    WHITE = (255, 255, 255, 255)
    draw_rub_el_hizb(mono_draw, fg_cx, fg_cy, radius=250, fill_color=None, outline_color=WHITE, outline_width=8)
    draw_crescent_and_star(mono_draw, fg_cx - 10, fg_cy, moon_radius=90, star_radius=40, color=WHITE)
    mono_draw.text((fg_cx - fg_w // 2, fg_cy + 300), fg_text, fill=WHITE, font=font_fg)
    mono_512 = mono_canvas.resize((512, 512), Image.Resampling.LANCZOS)
    mono_512.save(os.path.join(OUTPUT_DIR, "android-icon-monochrome.png"), "PNG")
    print("Generated: android-icon-monochrome.png (512x512)")

    # ─── SPLASH ICON (512x512 transparent) ───
    splash_512 = fg_512.copy()
    splash_512.save(os.path.join(OUTPUT_DIR, "splash-icon.png"), "PNG")
    print("Generated: splash-icon.png (512x512)")

    # ─── FAVICON (48x48) ───
    fav_canvas = Image.new("RGBA", (192, 192), EMERALD_DEEP)
    fav_draw = ImageDraw.Draw(fav_canvas)
    draw_rub_el_hizb(fav_draw, 96, 96, radius=76, fill_color=(4, 48, 38), outline_color=GOLD_BRIGHT, outline_width=5)
    draw_crescent_and_star(fav_draw, 96 - 4, 96, moon_radius=32, star_radius=14, color=GOLD_BRIGHT)
    fav_48 = fav_canvas.resize((48, 48), Image.Resampling.LANCZOS)
    fav_48.save(os.path.join(OUTPUT_DIR, "favicon.png"), "PNG")
    print("Generated: favicon.png (48x48)")

if __name__ == "__main__":
    generate_halal_market_icons()
