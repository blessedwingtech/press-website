import re
import os

svg_path = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public\logo-presstonik.svg"

with open(svg_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's inspect the first 2000 chars of the SVG
print(content[:2000])

# Find the main colors in the SVG paths
fills = re.findall(r'fill="([^"]+)"', content)
from collections import Counter
c = Counter(fills)
print("Color counts in SVG:")
for color, count in c.most_common(10):
    print(f"  {color}: {count}")
