import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_dark_svg():
    with open('public/logo-presstonik.svg', 'r', encoding='utf-8') as f:
        svg_content = f.read()

    # The feather body in dark mode: a vibrant bright cyan/sky blue (#38bdf8)
    # matching the "Press" text in dark mode!
    # Also adjust red to bright scarlet rose (#f43f5e)
    dark_svg = svg_content.replace('fill="#0f2042"', 'fill="#38bdf8"').replace('fill="#ce1126"', 'fill="#f43f5e"')
    with open('public/logo-presstonik-dark.svg', 'w', encoding='utf-8') as f:
        f.write(dark_svg)
    print("Created public/logo-presstonik-dark.svg")

def create_fallback_card():
    # 1200 x 675 (16:9 standard editorial card)
    w, h = 1200, 675
    img = Image.new('RGBA', (w, h), (10, 15, 30, 255))
    draw = ImageDraw.Draw(img)

    # 1. Background Gradient (deep navy slate to pitch black)
    for y in range(h):
        ratio = y / h
        r = int(10 * (1 - ratio) + 2 * ratio)
        g = int(18 * (1 - ratio) + 6 * ratio)
        b = int(35 * (1 - ratio) + 15 * ratio)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # 2. Subtle radial glow in the center
    # Create radial glow layer
    glow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    cx, cy = w // 2, h // 2 - 20
    for radius in range(350, 0, -5):
        alpha = int(45 * (1 - radius / 350))
        glow_draw.ellipse(
            [cx - radius, cy - radius, cx + radius, cy + radius],
            fill=(14, 116, 144, alpha) # cyan / deep teal subtle glow
        )
    glow = glow.filter(ImageFilter.GaussianBlur(30))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)

    # 3. Subtle grid lines / watermark lines for modern newsroom feel
    for x in range(0, w, 80):
        draw.line([(x, 0), (x, h)], fill=(255, 255, 255, 8), width=1)
    for y in range(0, h, 60):
        draw.line([(0, y), (w, y)], fill=(255, 255, 255, 8), width=1)

    # 4. Border card accent
    draw.rectangle([20, 20, w - 21, h - 21], outline=(56, 189, 248, 40), width=1)
    draw.rectangle([24, 24, w - 25, h - 25], outline=(255, 255, 255, 15), width=1)

    # 5. Load and paste the emblem logo
    # Try icon-512x512.png
    if os.path.exists('public/icon-512x512.png'):
        emblem = Image.open('public/icon-512x512.png').convert('RGBA')
        emblem_size = 200
        emblem = emblem.resize((emblem_size, emblem_size), Image.Resampling.LANCZOS)
        
        # Position emblem centered horizontally
        ex = cx - emblem_size // 2
        ey = cy - 130
        img.paste(emblem, (ex, ey), emblem)

    # 6. Typography
    # Let's try system fonts or standard sans-serif
    font_title = None
    font_slogan = None
    font_badge = None
    
    font_candidates = [
        "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\georgia.ttf"
    ]
    for fc in font_candidates:
        if os.path.exists(fc):
            try:
                font_title = ImageFont.truetype(fc, 64)
                font_slogan = ImageFont.truetype(fc, 24)
                font_badge = ImageFont.truetype(fc, 16)
                break
            except Exception:
                pass
                
    if not font_title:
        font_title = ImageFont.load_default()
        font_slogan = font_title
        font_badge = font_title

    # Draw "Press" in Sky Blue (#38bdf8) and "Tonik" in Scarlet Red (#ef4444)
    press_text = "Press"
    tonik_text = "Tonik"
    
    # Measure text width
    try:
        p_bbox = draw.textbbox((0, 0), press_text, font=font_title)
        p_w = p_bbox[2] - p_bbox[0]
        t_bbox = draw.textbbox((0, 0), tonik_text, font=font_title)
        t_w = t_bbox[2] - t_bbox[0]
        total_w = p_w + t_w
    except Exception:
        total_w = 340
        p_w = 170

    tx_start = cx - total_w // 2
    ty = cy + 90
    draw.text((tx_start, ty), press_text, fill=(56, 189, 248, 255), font=font_title)
    draw.text((tx_start + p_w, ty), tonik_text, fill=(239, 68, 68, 255), font=font_title)

    # Slogan: "L'Actualité Avec Dynamisme"
    slogan = "L ' A C T U A L I T É   A V E C   D Y N A M I S M E"
    try:
        s_bbox = draw.textbbox((0, 0), slogan, font=font_slogan)
        s_w = s_bbox[2] - s_bbox[0]
    except Exception:
        s_w = 300
    draw.text((cx - s_w // 2, ty + 78), slogan, fill=(148, 163, 184, 230), font=font_slogan)

    # Top Pill Badge: "PRESSTONIK • COUVERTURE & INVESTIGATION"
    badge_text = "PRESSTONIK • COUVERTURE & INVESTIGATION"
    try:
        b_bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
        bw = b_bbox[2] - b_bbox[0]
        bh = b_bbox[3] - b_bbox[1]
    except Exception:
        bw, bh = 260, 20
        
    badge_x = cx - bw // 2
    badge_y = 60
    # Pill bg
    draw.rounded_rectangle([badge_x - 18, badge_y - 8, badge_x + bw + 18, badge_y + bh + 8], radius=16, fill=(15, 23, 42, 220), outline=(56, 189, 248, 120), width=1)
    draw.text((badge_x, badge_y), badge_text, fill=(186, 230, 253, 240), font=font_badge)

    # Bottom Copyright / Origin Tag
    bottom_text = "HAÏTI & INTERNATIONAL • PRESSTONIK.COM"
    try:
        bot_bbox = draw.textbbox((0, 0), bottom_text, font=font_badge)
        bot_w = bot_bbox[2] - bot_bbox[0]
    except Exception:
        bot_w = 200
    draw.text((cx - bot_w // 2, h - 60), bottom_text, fill=(100, 116, 139, 180), font=font_badge)

    # Save to public/fallback.png
    img.save('public/fallback.png', 'PNG', optimize=True)
    print("Successfully created public/fallback.png (1200x675)")

if __name__ == '__main__':
    create_dark_svg()
    create_fallback_card()
