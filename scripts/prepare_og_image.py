import os
from PIL import Image, ImageOps

src_path = r'C:\Users\bless\.gemini\antigravity\brain\516b8e1c-9478-4f79-b84a-f5e64f281064\.user_uploaded\media_1793702984141_a0d8a115.jpg'
orig = Image.open(src_path).convert('RGB')
w, h = orig.size

# 1. Create 1200 x 630 (Standard 1.91:1 OpenGraph Banner)
bg_color = (212, 212, 212)
og_1200 = Image.new('RGB', (1200, 630), bg_color)

# Scale down original so its height fits comfortably with padding (e.g. 560px height)
target_h = 560
scale = target_h / h
target_w = int(w * scale)
scaled_orig = orig.resize((target_w, target_h), Image.Resampling.LANCZOS)

# Paste centered
paste_x = (1200 - target_w) // 2
paste_y = (630 - target_h) // 2
og_1200.paste(scaled_orig, (paste_x, paste_y))

# Save og-image.jpg (high quality, optimized < 200KB)
og_1200.save('public/og-image.jpg', 'JPEG', quality=90, optimize=True)
print('Saved public/og-image.jpg - Size:', os.path.getsize('public/og-image.jpg'), 'bytes')

# 2. Create 800 x 800 (Square Social Thumbnail)
square = Image.new('RGB', (800, 800), bg_color)
sq_target_h = 740
sq_scale = sq_target_h / h
sq_target_w = int(w * sq_scale)
sq_scaled = orig.resize((sq_target_w, sq_target_h), Image.Resampling.LANCZOS)
sq_paste_x = (800 - sq_target_w) // 2
sq_paste_y = (800 - sq_target_h) // 2
square.paste(sq_scaled, (sq_paste_x, sq_paste_y))
square.save('public/logo-share.jpg', 'JPEG', quality=90, optimize=True)
print('Saved public/logo-share.jpg - Size:', os.path.getsize('public/logo-share.jpg'), 'bytes')

# Also save a png version in case requested
orig.save('public/logo-full.jpg', 'JPEG', quality=92, optimize=True)
print('Saved public/logo-full.jpg')
