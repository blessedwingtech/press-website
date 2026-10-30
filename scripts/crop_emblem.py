import os
from PIL import Image

src_path = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public\logo-presstonik.png"
out_dir = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public"

img = Image.open(src_path).convert("RGBA")
w, h = img.size
print("Logo size:", w, h)

# 1. Feather Emblem Only (quill part without text)
# In our 896x899 image:
# The feather quill spans from roughly top down to the nib
# Text "PressTonik" starts around y = 630-650
# Let's inspect where the text starts
import numpy as np
arr = np.array(img)
alpha = arr[:, :, 3]

# Row-wise sum of non-transparent pixels
row_sum = np.sum(alpha > 10, axis=1)

# Feather is the upper component
# Let's crop the feather only
# Top to where the nib ends (around row 720)
# We can find the nib tip by looking at the lowest red pixel
red_pixels = (arr[:, :, 0] > 160) & (arr[:, :, 1] < 70) & (arr[:, :, 2] < 80) & (alpha > 100)
red_rows, red_cols = np.where(red_pixels)
print("Red rows min/max:", red_rows.min(), red_rows.max())
print("Red cols min/max:", red_cols.min(), red_cols.max())

# In the logo, the pen nib at the bottom-left is red!
# The text "Tonik" is also red.
# Pen nib has x < 200, whereas "Tonik" has x > 500
nib_mask = red_pixels & (np.arange(w) < 300)
nib_rows, nib_cols = np.where(nib_mask)
print("Nib rows min/max:", nib_rows.min(), nib_rows.max())
print("Nib cols min/max:", nib_cols.min(), nib_cols.max())

nib_bottom = nib_rows.max() + 10
feather_crop = img.crop((0, 0, w, nib_bottom))
feather_bbox = feather_crop.getbbox()
feather_only = feather_crop.crop(feather_bbox)

# Add square padding for app icon and favicon
dim = max(feather_only.width, feather_only.height) + 40
sq_icon = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
sq_icon.paste(feather_only, ((dim - feather_only.width) // 2, (dim - feather_only.height) // 2))

# Save feather emblem
feather_path = os.path.join(out_dir, "logo-emblem.png")
feather_only.save(feather_path, "PNG", optimize=True)

# Save icons
sq_icon.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "icon-512x512.png"), "PNG", optimize=True)
sq_icon.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "icon-192x192.png"), "PNG", optimize=True)
sq_icon.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "favicon.ico"), format="ICO")
print("Emblem and icons generated successfully!")
