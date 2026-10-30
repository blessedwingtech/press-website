import os
from PIL import Image
import numpy as np
import vtracer
import re

orig_src = r"C:\Users\bless\.gemini\antigravity\brain\516b8e1c-9478-4f79-b84a-f5e64f281064\.user_uploaded\media_1793350358045_cb32def4.jpg"
out_dir = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public"

img = Image.open(orig_src).convert("RGB")
w, h = img.size
arr = np.array(img, dtype=np.float32)

# Red mask
is_red = (arr[:, :, 0] > 130) & (arr[:, :, 1] < 75) & (arr[:, :, 2] < 85)
# Navy mask
is_navy = (arr[:, :, 0] < 70) & (arr[:, :, 1] < 85) & (arr[:, :, 2] > 40) & ~is_red

# Exclude text area: text is strictly Y > 650 AND X > 280
y_coords, x_coords = np.indices((h, w))
text_area = (y_coords > 650) & (x_coords > 280)

# Feather-only masks
feather_navy = is_navy & ~text_area
feather_red = is_red & ~text_area

# Save binary black-on-white images for vtracer
temp_navy_png = os.path.join(out_dir, "temp_feather_navy.png")
temp_red_png = os.path.join(out_dir, "temp_feather_red.png")

navy_img = np.full((h, w), 255, dtype=np.uint8)
navy_img[feather_navy] = 0
Image.fromarray(navy_img).save(temp_navy_png)

red_img = np.full((h, w), 255, dtype=np.uint8)
red_img[feather_red] = 0
Image.fromarray(red_img).save(temp_red_png)

temp_navy_svg = os.path.join(out_dir, "temp_feather_navy.svg")
temp_red_svg = os.path.join(out_dir, "temp_feather_red.svg")

# Trace Navy Feather
vtracer.convert_image_to_svg_py(
    temp_navy_png,
    temp_navy_svg,
    colormode="binary",
    hierarchical="stacked",
    mode="spline",
    filter_speckle=4,
    color_precision=8,
    corner_threshold=50,
    length_threshold=3.5,
    max_iterations=10,
    splice_threshold=45,
    path_precision=3
)

# Trace Red Quill & Nib
vtracer.convert_image_to_svg_py(
    temp_red_png,
    temp_red_svg,
    colormode="binary",
    hierarchical="stacked",
    mode="spline",
    filter_speckle=4,
    color_precision=8,
    corner_threshold=50,
    length_threshold=3.5,
    max_iterations=10,
    splice_threshold=45,
    path_precision=3
)

with open(temp_navy_svg, "r", encoding="utf-8") as f:
    navy_svg_content = f.read()

with open(temp_red_svg, "r", encoding="utf-8") as f:
    red_svg_content = f.read()

# Collect only art paths (where fill is black)
navy_paths = []
for match in re.finditer(r'<path d="([^"]+)" fill="([^"]+)" transform="translate\(([^,]+),([^)]+)\)"\s*/>', navy_svg_content):
    if 'fill="#FEFEFE"' in match.group(0) or 'fill="#FFFFFF"' in match.group(0):
        continue
    cleaned = re.sub(r'fill="[^"]+"', 'fill="#0f2042"', match.group(0))
    navy_paths.append(cleaned)

red_paths = []
for match in re.finditer(r'<path d="([^"]+)" fill="([^"]+)" transform="translate\(([^,]+),([^)]+)\)"\s*/>', red_svg_content):
    if 'fill="#FEFEFE"' in match.group(0) or 'fill="#FFFFFF"' in match.group(0):
        continue
    cleaned = re.sub(r'fill="[^"]+"', 'fill="#ce1126"', match.group(0))
    red_paths.append(cleaned)

# Clean up temp files
for p in [temp_navy_png, temp_red_png, temp_navy_svg, temp_red_svg]:
    if os.path.exists(p):
        os.remove(p)

# Find bounding box coordinates from feather masks
feather_any = feather_navy | feather_red
rows, cols = np.where(feather_any)
min_y, max_y = rows.min() - 10, rows.max() + 10
min_x, max_x = cols.min() - 10, cols.max() + 10
width = max_x - min_x
height = max_y - min_y

print(f"Feather Bounding Box: min_x={min_x}, min_y={min_y}, width={width}, height={height}")

# Build Pure Feather SVG: NO white background, NO text, 100% vector curves
pure_feather_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{min_x} {min_y} {width} {height}" width="100%" height="100%">
  <!-- PressTonik Feather Emblem (Pure Vector, Transparent Background, Zero Text) -->
  <g id="feather-navy">
    {''.join(navy_paths)}
  </g>
  <g id="feather-red-quill">
    {''.join(red_paths)}
  </g>
</svg>
'''

with open(os.path.join(out_dir, "logo-presstonik.svg"), "w", encoding="utf-8") as f:
    f.write(pure_feather_svg)

with open(os.path.join(out_dir, "feather-emblem.svg"), "w", encoding="utf-8") as f:
    f.write(pure_feather_svg)

with open(os.path.join(out_dir, "icon.svg"), "w", encoding="utf-8") as f:
    f.write(pure_feather_svg)

with open(os.path.join(out_dir, "logo-press-tonik.svg"), "w", encoding="utf-8") as f:
    f.write(pure_feather_svg)

print("Generated all 4 pure SVG files!")

# Also generate the PNG emblem without white background or text
feather_rgba = np.zeros((h, w, 4), dtype=np.uint8)
feather_rgba[feather_navy] = [15, 32, 66, 255]
feather_rgba[feather_red] = [206, 17, 38, 255]

# Crop directly to bounding box
feather_crop_png = Image.fromarray(feather_rgba).crop((min_x, min_y, max_x, max_y))
feather_crop_png.save(os.path.join(out_dir, "logo-emblem.png"), "PNG", optimize=True)
feather_crop_png.save(os.path.join(out_dir, "logo-presstonik.png"), "PNG", optimize=True)

# Generate square app icons
dim = max(width, height) + 40
sq = Image.new("RGBA", (dim, dim), (0, 0, 0, 0))
sq.paste(feather_crop_png, ((dim - width)//2, (dim - height)//2))

sq.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "icon-512x512.png"), "PNG", optimize=True)
sq.resize((192, 192), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "icon-192x192.png"), "PNG", optimize=True)
sq.resize((64, 64), Image.Resampling.LANCZOS).save(os.path.join(out_dir, "favicon.ico"), format="ICO")

print("All PNG, ICO, and SVG files updated without background or text!")
