import os
from PIL import Image
import numpy as np
from collections import deque
import vtracer

src_path = r"C:\Users\bless\.gemini\antigravity\brain\516b8e1c-9478-4f79-b84a-f5e64f281064\.user_uploaded\media_1793350358045_cb32def4.jpg"
out_dir = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public"

img = Image.open(src_path).convert("RGB")
w, h = img.size
print(f"Input image: {w}x{h}")

arr = np.array(img, dtype=np.float32)

# Distance to background [211, 211, 211]
bg_ref = np.array([211.0, 211.0, 211.0], dtype=np.float32)
dist = np.sqrt(np.sum((arr - bg_ref)**2, axis=2))

# 1. Flood fill from borders to identify outer background cleanly
is_bg = np.zeros((h, w), dtype=bool)
q = deque()

for x in range(w):
    if dist[0, x] < 22:
        is_bg[0, x] = True
        q.append((0, x))
    if dist[h-1, x] < 22:
        is_bg[h-1, x] = True
        q.append((h-1, x))

for y in range(h):
    if dist[y, 0] < 22:
        is_bg[y, 0] = True
        q.append((y, 0))
    if dist[y, w-1] < 22:
        is_bg[y, w-1] = True
        q.append((y, w-1))

while q:
    y, x = q.popleft()
    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w:
            if not is_bg[ny, nx] and dist[ny, nx] < 22:
                is_bg[ny, nx] = True
                q.append((ny, nx))

# 2. Also letters inner holes (P, e, o, a, d) that are close to background color
inner_holes = (dist < 16) & (arr[:, :, 0] < 225) & (arr[:, :, 1] < 225) & (arr[:, :, 2] < 225)
full_bg = is_bg | inner_holes

# We will create an ultra-clean version with pure transparent background,
# and also a version on pure white #FFFFFF for vtracer vectorization so edges are crisp.
clean_white = arr.copy()
clean_white[full_bg] = [255.0, 255.0, 255.0]

# Boost contrast of artwork:
# Navy: darken slightly if needed
# Red: keep vibrant
clean_white_img = Image.fromarray(clean_white.astype(np.uint8))
temp_white_path = os.path.join(out_dir, "temp_clean_logo.png")
clean_white_img.save(temp_white_path)
print("Saved temporary clean image for vectorization")

# Convert to TRUE vector SVG using vtracer!
svg_out_path = os.path.join(out_dir, "logo-presstonik.svg")

vtracer.convert_image_to_svg_py(
    temp_white_path,
    svg_out_path,
    colormode="color",        # "color" mode
    hierarchical="stacked",   # "stacked" for clean layered SVG
    mode="spline",            # "spline" for smooth curves!
    filter_speckle=4,         # eliminate tiny noise
    color_precision=8,        # precise colors
    layer_difference=16,
    corner_threshold=60,
    length_threshold=4.0,
    max_iterations=10,
    splice_threshold=45,
    path_precision=3
)

print(f"True vector SVG generated at: {svg_out_path}")

# Check SVG size
svg_size = os.path.getsize(svg_out_path)
print(f"SVG file size: {svg_size} bytes")
