import os
import re

out_dir = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public"

with open(os.path.join(out_dir, "temp_navy.svg"), "r", encoding="utf-8") as f:
    navy_svg = f.read()

with open(os.path.join(out_dir, "temp_red.svg"), "r", encoding="utf-8") as f:
    red_svg = f.read()

# Extract paths from navy SVG (skip the background rect/path)
# In binary vtracer, the first path is usually the full canvas or white background, then the black artwork path
navy_paths = re.findall(r'<path[^>]+>', navy_svg)
print("Navy path count:", len(navy_paths))
# Find paths that have fill="#000000" or are the artwork
navy_art_paths = [p for p in navy_paths if 'fill="#000000"' in p or 'fill="#000"' in p]
print("Navy art paths:", len(navy_art_paths))

red_paths = re.findall(r'<path[^>]+>', red_svg)
print("Red path count:", len(red_paths))
red_art_paths = [p for p in red_paths if 'fill="#000000"' in p or 'fill="#000"' in p]
print("Red art paths:", len(red_art_paths))

# Assemble master clean SVG
# Width: 920, Height: 1024, ViewBox: 0 0 920 1024
# Navy color: #0f2042
# Red color:  #ce1126
# White slats: #ffffff

# Replace fill color in navy art paths with #0f2042
clean_navy_paths = [re.sub(r'fill="[^"]+"', 'fill="#0f2042"', p) for p in navy_art_paths]
clean_red_paths = [re.sub(r'fill="[^"]+"', 'fill="#ce1126"', p) for p in red_art_paths]

master_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 1024" width="100%" height="100%">
  <!-- PressTonik Official Vector Logo -->
  <g id="navy-elements">
    {''.join(clean_navy_paths)}
  </g>
  <g id="red-elements">
    {''.join(clean_red_paths)}
  </g>
</svg>
'''

master_path = os.path.join(out_dir, "logo-presstonik.svg")
with open(master_path, "w", encoding="utf-8") as f:
    f.write(master_svg)

print(f"Master SVG assembled at: {master_path}")
print(f"File size: {os.path.getsize(master_path)} bytes")
