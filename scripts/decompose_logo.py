import os
from PIL import Image
import numpy as np

orig_src = r"C:\Users\bless\.gemini\antigravity\brain\516b8e1c-9478-4f79-b84a-f5e64f281064\.user_uploaded\media_1793350358045_cb32def4.jpg"
out_dir = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public"

img = Image.open(orig_src).convert("RGB")
w, h = img.size
arr = np.array(img, dtype=np.float32)

# Red mask (includes quill nib and "Tonik")
is_red = (arr[:, :, 0] > 130) & (arr[:, :, 1] < 75) & (arr[:, :, 2] < 85)

# Navy mask (includes right feather vane, quill spine, "Press", and tagline)
is_navy = (arr[:, :, 0] < 70) & (arr[:, :, 1] < 85) & (arr[:, :, 2] > 40) & ~is_red

# White feather stripes mask (left feather slats)
is_white = (arr[:, :, 0] > 225) & (arr[:, :, 1] > 225) & (arr[:, :, 2] > 225)

print("Red pixels:", np.sum(is_red))
print("Navy pixels:", np.sum(is_navy))
print("White pixels:", np.sum(is_white))

# 1. Navy layer
navy_img = np.full((h, w), 255, dtype=np.uint8)
navy_img[is_navy] = 0
Image.fromarray(navy_img).save(os.path.join(out_dir, "temp_navy.png"))

# 2. Red layer
red_img = np.full((h, w), 255, dtype=np.uint8)
red_img[is_red] = 0
Image.fromarray(red_img).save(os.path.join(out_dir, "temp_red.png"))

# 3. White layer
white_img = np.full((h, w), 255, dtype=np.uint8)
white_img[is_white] = 0
Image.fromarray(white_img).save(os.path.join(out_dir, "temp_white.png"))

print("Masks successfully generated!")
