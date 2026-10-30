import os
from PIL import Image
import numpy as np

orig_src = r"C:\Users\bless\.gemini\antigravity\brain\516b8e1c-9478-4f79-b84a-f5e64f281064\.user_uploaded\media_1793350358045_cb32def4.jpg"
out_dir = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public"

# Upscale x2 using high-quality Lanczos for crisp 2K resolution (1840x2048)
img = Image.open(orig_src).convert("RGB")
img_2k = img.resize((img.width * 2, img.height * 2), Image.Resampling.LANCZOS)
w, h = img_2k.size
arr = np.array(img_2k, dtype=np.float32)

# Distance to background [211, 211, 211]
bg_ref = np.array([211.0, 211.0, 211.0], dtype=np.float32)
dist = np.sqrt(np.sum((arr - bg_ref)**2, axis=2))

# Compute alpha: where dist is high (> 35), alpha is 255.
# Smooth linear ramp between dist 14 and dist 35 for ultra-clean subpixel antialiasing
alpha = np.clip((dist - 14.0) / (32.0 - 14.0), 0.0, 1.0)
alpha = (alpha * 255.0).astype(np.uint8)

# Flood fill to eliminate any grey area in outer borders
from collections import deque
is_outer_bg = np.zeros((h, w), dtype=bool)
q = deque()
for x in range(w):
    if dist[0, x] < 22:
        is_outer_bg[0, x] = True
        q.append((0, x))
    if dist[h-1, x] < 22:
        is_outer_bg[h-1, x] = True
        q.append((h-1, x))
for y in range(h):
    if dist[y, 0] < 22:
        is_outer_bg[y, 0] = True
        q.append((y, 0))
    if dist[y, w-1] < 22:
        is_outer_bg[y, w-1] = True
        q.append((y, w-1))

while q:
    y, x = q.popleft()
    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w:
            if not is_outer_bg[ny, nx] and dist[ny, nx] < 22:
                is_outer_bg[ny, nx] = True
                q.append((ny, nx))

# Set outer background alpha directly to 0
alpha[is_outer_bg] = 0

# Construct clean RGBA 2K image
rgba = np.zeros((h, w, 4), dtype=np.uint8)
rgba[:, :, :3] = img_2k
rgba[:, :, 3] = alpha

hq_img = Image.fromarray(rgba, mode="RGBA")
bbox = hq_img.getbbox()
cropped = hq_img.crop(bbox)

# Add 30px padding
pad = 30
padded = Image.new("RGBA", (cropped.width + 2*pad, cropped.height + 2*pad), (0, 0, 0, 0))
padded.paste(cropped, (pad, pad))

# Save 2K Master PNG
hq_png_path = os.path.join(out_dir, "logo-presstonik.png")
padded.save(hq_png_path, "PNG", optimize=True)
print(f"2K Master PNG saved: {padded.width}x{padded.height} at {hq_png_path}")

# Crop Feather Emblem in high resolution
# The nib is in the lower-left, text is in lower-right
feather_h = int(padded.height * 0.77)
feather_crop = padded.crop((0, 0, padded.width, feather_h))
feather_bbox = feather_crop.getbbox()
feather_only = feather_crop.crop(feather_bbox)

feather_path = os.path.join(out_dir, "logo-emblem.png")
feather_only.save(feather_path, "PNG", optimize=True)
print(f"Feather Emblem saved: {feather_only.width}x{feather_only.height} at {feather_path}")

# Generate square app icons with crisp Lanczos downsampling
dim = max(feather_only.width, feather_only.height) + 60
sq = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
sq.paste(feather_only, ((dim - feather_only.width)//2, (dim - feather_only.height)//2))

# 512x512
sq.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "icon-512x512.png"), "PNG", optimize=True)
# 192x192
sq.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "icon-192x192.png"), "PNG", optimize=True)
# Favicon
sq.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "favicon.ico"), format="ICO")

print("All HD icons and PNGs regenerated at flawless quality!")
