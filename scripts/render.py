#!/usr/bin/env python3
"""Render SVG → PNG using headless Chromium via Playwright.

This is the preferred render pipeline — cairosvg mangles Devanagari
conjuncts (श्री), but Chromium's HarfBuzz shaper handles them correctly.

Usage:
  python3 scripts/render.py <input.svg> <output.png> [width]

If no args given, renders all SVGs in output/ to PNGs.

The script reads the SVG's width/height attributes to determine the
correct viewport dimensions, so non-square formats (9:16, 16:9, 2:3)
render at their proper aspect ratios.
"""

import sys
import os
import re
import glob
import shutil
import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "output"

DEFAULT_SIZE = 1080


def find_chromium():
    """Locate system Chromium/Chrome executable."""
    candidates = [
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
        "/snap/bin/chromium",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
    ]
    for c in candidates:
        if os.path.isfile(c):
            return c
    for name in ["chromium-browser", "chromium", "google-chrome"]:
        found = shutil.which(name)
        if found:
            return found
    return None


def get_svg_dimensions(svg_content: str):
    """Extract width and height from SVG content."""
    w_match = re.search(r'width="(\d+)"', svg_content)
    h_match = re.search(r'height="(\d+)"', svg_content)
    if w_match and h_match:
        return int(w_match.group(1)), int(h_match.group(1))
    return DEFAULT_SIZE, DEFAULT_SIZE


def render_svg(svg_path: str, png_path: str, size: int | None = None):
    """Render a single SVG to PNG using headless Chromium."""
    from playwright.sync_api import sync_playwright

    chromium_path = find_chromium()

    # Read the SVG content and base64-encode it for inline embedding
    svg_content = Path(svg_path).read_text()
    svg_b64 = base64.b64encode(svg_content.encode("utf-8")).decode("ascii")

    # Get actual SVG dimensions for proper viewport
    svg_w, svg_h = get_svg_dimensions(svg_content)
    if size:
        # Scale proportionally to fit within 'size' on the longest edge
        scale = size / max(svg_w, svg_h)
        render_w = int(svg_w * scale)
        render_h = int(svg_h * scale)
    else:
        render_w = svg_w
        render_h = svg_h

    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=chromium_path,
            args=["--no-sandbox", "--disable-gpu"],
        )
        page = browser.new_page(viewport={"width": render_w, "height": render_h})

        # Build HTML with inline SVG via data URI
        html = f"""<!DOCTYPE html>
<html lang="sa">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Hind:wght@700&display=swap" rel="stylesheet">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ width: {render_w}px; height: {render_h}px; overflow: hidden; background: white; }}
  img {{ width: {render_w}px; height: {render_h}px; display: block; }}
</style>
</head>
<body>
<img src="data:image/svg+xml;base64,{svg_b64}" width="{render_w}" height="{render_h}" />
</body>
</html>"""

        page.set_content(html)
        # Wait for Google Font to load and SVG to render
        page.wait_for_timeout(2500)

        page.screenshot(path=png_path, full_page=False, clip={"x": 0, "y": 0, "width": render_w, "height": render_h})
        browser.close()

    return png_path, render_w, render_h


def main():
    if len(sys.argv) >= 3:
        svg_path = sys.argv[1]
        png_path = sys.argv[2]
        size = int(sys.argv[3]) if len(sys.argv) > 3 else None
        result_path, w, h = render_svg(svg_path, png_path, size)
        fsize = os.path.getsize(png_path)
        print(f"Rendered: {png_path} ({fsize:,} bytes, {w}×{h})")
    else:
        svgs = sorted(glob.glob(str(OUTPUT_DIR / "*.svg")))
        if not svgs:
            print("No SVGs found in output/")
            sys.exit(1)

        for svg_path in svgs:
            png_path = svg_path.replace(".svg", ".png")
            result_path, w, h = render_svg(svg_path, png_path)
            fsize = os.path.getsize(png_path)
            print(f"Rendered: {os.path.basename(png_path)} ({fsize:,} bytes, {w}×{h})")

        print(f"\nDone! Rendered {len(svgs)} SVGs → PNGs.")


if __name__ == "__main__":
    main()
