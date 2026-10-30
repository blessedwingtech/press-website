import os
import vtracer
import re

out_dir = r"c:\Users\bless\Downloads\ben_pro\news-platform-1\public"

# Trace Navy layer
navy_svg_path = os.path.join(out_dir, "temp_navy.svg")
vtracer.convert_image_to_svg_py(
    os.path.join(out_dir, "temp_navy.png"),
    navy_svg_path,
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

# Trace Red layer
red_svg_path = os.path.join(out_dir, "temp_red.svg")
vtracer.convert_image_to_svg_py(
    os.path.join(out_dir, "temp_red.png"),
    red_svg_path,
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

print("Binary traces completed!")
