import os
import re

out_dir = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public"

with open(os.path.join(out_dir, "logo-presstonik.svg"), "r", encoding="utf-8") as f:
    full_svg = f.read()

# In the full SVG (viewBox 0 0 920 1024), the feather spans from x ≈ 60 to 700, y ≈ 120 to 800
# The text "PressTonik" starts at y ≈ 670 and x ≈ 300 to 860
# Let's inspect where paths are located by parsing translate coordinates in the paths
# Paths look like: <path d="..." transform="translate(X,Y)"/>

paths = re.findall(r'<path[^>]+transform="translate\(([^,]+),([^)]+)\)"[^>]*>', full_svg)
print("Total paths found:", len(paths))

# Separate feather paths vs text paths based on their translate Y and X
# Text "PressTonik" is in the lower right (Y > 670, X > 280)
# Tagline "L'Actualité Avec Dynamisme" is at Y > 770, X > 280

feather_navy_paths = []
text_navy_paths = []

for match in re.finditer(r'<path d="([^"]+)" fill="([^"]+)" transform="translate\(([^,]+),([^)]+)\)"\s*/>', full_svg):
    d, fill, tx, ty = match.groups()
    x = float(tx)
    y = float(ty)
    path_tag = match.group(0)
    
    # Is it part of text or feather?
    if y > 660 and x > 280:
        text_navy_paths.append(path_tag)
    else:
        feather_navy_paths.append(path_tag)

print(f"Feather paths: {len(feather_navy_paths)}, Text paths: {len(text_navy_paths)}")

# Feather bounding box in viewBox coordinates:
# Roughly x: 50 to 650, y: 120 to 800
# Width: 600, Height: 700
# Let's build a tight viewBox for the feather emblem alone: "50 120 620 700"
feather_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="50 120 620 700" width="100%" height="100%">
  <!-- PressTonik Feather Emblem Vector -->
  <g id="feather-artwork">
    {''.join(feather_navy_paths)}
  </g>
</svg>
'''

with open(os.path.join(out_dir, "feather-emblem.svg"), "w", encoding="utf-8") as f:
    f.write(feather_svg)

print("Saved feather-emblem.svg successfully!")
