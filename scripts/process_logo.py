import os
from PIL import Image
import numpy as np
from collections import deque

src_path = r"C:\Users\bless\.gemini\antigravity\brain\516b8e1c-9478-4f79-b84a-f5e64f281064\.user_uploaded\media_1793350358045_cb32def4.jpg"
out_dir = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public"

img = Image.open(src_path).convert("RGB")
w, h = img.size
arr = np.array(img, dtype=np.float32)

# Distance of each pixel to the grey background [210.5, 210.5, 210.5]
bg_ref = np.array([210.5, 210.5, 210.5], dtype=np.float32)
dist = np.sqrt(np.sum((arr - bg_ref)**2, axis=2))

# Background mask initialized with flood fill from all 4 borders
is_bg = np.zeros((h, w), dtype=bool)

# Queue for BFS flood fill
q = deque()

# Add all 4 boundaries where pixel is close to background (dist < 18)
for x in range(w):
    if dist[0, x] < 20 and not is_bg[0, x]:
        is_bg[0, x] = True
        q.append((0, x))
    if dist[h-1, x] < 20 and not is_bg[h-1, x]:
        is_bg[h-1, x] = True
        q.append((h-1, x))

for y in range(h):
    if dist[y, 0] < 20 and not is_bg[y, 0]:
        is_bg[y, 0] = True
        q.append((y, 0))
    if dist[y, w-1] < 20 and not is_bg[y, w-1]:
        is_bg[y, w-1] = True
        q.append((y, w-1))

# Also inside enclosed letters like e, o, a, P, etc., we can check connected components with dist < 20
# But first let's flood fill the outer background
while q:
    y, x = q.popleft()
    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w:
            if not is_bg[ny, nx] and dist[ny, nx] < 22:
                is_bg[ny, nx] = True
                q.append((ny, nx))

# Also flood fill any inner letter holes if they match background color
# Any region where dist < 12 and not white
inner_bg = (dist < 14) & (arr[:, :, 0] < 225) & (arr[:, :, 1] < 225) & (arr[:, :, 2] < 225)
all_bg = is_bg | inner_bg

# Create transparent RGBA image
rgba = np.zeros((h, w, 4), dtype=np.uint8)
rgba[:, :, :3] = img

# Alpha channel: smooth antialiasing around edges
# Where all_bg is True, alpha is 0
# For transition pixels (dist between 15 and 35), interpolate alpha smoothly
alpha = np.clip((dist - 12.0) / 18.0 * 255.0, 0, 255).astype(np.uint8)
# If it's pure background, force 0
alpha[all_bg & (dist < 16)] = 0
# If dist >= 30, force 255
alpha[dist >= 35] = 255

rgba[:, :, 3] = alpha

result_img = Image.fromarray(rgba, mode="RGBA")

# Crop to bounding box of non-transparent content
bbox = result_img.getbbox()
print("Bounding box:", bbox)
cropped = result_img.crop(bbox)

# Add 20px padding around
pad = 20
padded = Image.new("RGBA", (cropped.width + 2*pad, cropped.height + 2*pad), (0, 0, 0, 0))
padded.paste(cropped, (pad, pad))

# Save high-res PNG
png_path = os.path.join(out_dir, "logo-presstonik.png")
padded.save(png_path, "PNG", optimize=True)
print(f"Saved {png_path} ({padded.width}x{padded.height})")

# Also save 192x192 and 512x512 icons for PWA & favicon
# Feather quill only for app icon
quill_bbox = (bbox[0], bbox[1], bbox[2], int(bbox[3] * 0.72))
quill_img = result_img.crop(quill_bbox)
# Center quill in square
max_dim = max(quill_img.width, quill_img.height) + 30
square_icon = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
square_icon.paste(quill_img, ((max_dim - quill_img.width)//2, (max_dim - quill_img.height)//2))

icon_512 = square_icon.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save(os.path.join(out_dir, "icon-512x512.png"), "PNG", optimize=True)

icon_192 = square_icon.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save(os.path.join(out_dir, "icon-192x192.png"), "PNG", optimize=True)

# Favicon.ico
square_icon.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "favicon.ico"), format="ICO")
print("Saved icons (512x512, 192x192, favicon.ico)")
