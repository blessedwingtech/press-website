import os
from PIL import Image
import numpy as np
from collections import deque

orig_src = r"C:\Users\bless\.gemini\antigravity\brain\516b8e1c-9478-4f79-b84a-f5e64f281064\.user_uploaded\media_1793350358045_cb32def4.jpg"
out_dir = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public"

img = Image.open(orig_src).convert("RGB")
w, h = img.size
arr = np.array(img, dtype=np.float32)

# Distance to grey background [211, 211, 211]
bg_dist = np.sqrt(np.sum((arr - 211.0)**2, axis=2))

# Background flood fill
is_bg = np.zeros((h, w), dtype=bool)
q = deque()
for x in range(w):
    if bg_dist[0, x] < 22:
        is_bg[0, x] = True
        q.append((0, x))
    if bg_dist[h-1, x] < 22:
        is_bg[h-1, x] = True
        q.append((h-1, x))
for y in range(h):
    if bg_dist[y, 0] < 22:
        is_bg[y, 0] = True
        q.append((y, 0))
    if bg_dist[y, w-1] < 22:
        is_bg[y, w-1] = True
        q.append((y, w-1))

while q:
    y, x = q.popleft()
    for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w:
            if not is_bg[ny, nx] and bg_dist[ny, nx] < 22:
                is_bg[ny, nx] = True
                q.append((ny, nx))

# White slat pixels are inside the feather (not background, and bright)
is_white_slats = (~is_bg) & (arr[:, :, 0] > 225) & (arr[:, :, 1] > 225) & (arr[:, :, 2] > 225)
print("White slats count:", np.sum(is_white_slats))

white_img = np.full((h, w), 255, dtype=np.uint8)
white_img[is_white_slats] = 0
Image.fromarray(white_img).save(os.path.join(out_dir, "temp_white.png"))
