#!/usr/bin/env python3
"""Render SVG → PNG using headless Chromium via Playwright."""
import sys, os, json, glob, time
from playwright.sync_api import sync_playwright

INPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'output')
SCALE = 2  # 2x for retina quality

def render_svg(svg_path, output_path=None, width=None, height=None):
    """Render an SVG file to PNG using headless Chromium."""
    if output_path is None:
        output_path = svg_path.replace('.svg', '.png')
    
    abs_svg = os.path.abspath(svg_path)
    file_url = f'file://{abs_svg}'
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path='/usr/bin/chromium-browser',
            args=['--no-sandbox', '--disable-gpu']
        )
        page = browser.new_page()
        page.goto(file_url)
        time.sleep(2)  # Wait for font load
        
        if width and height:
            page.set_viewport_size({'width': width, height: height})
        
        page.screenshot(path=output_path, full_page=True, scale='css')
        browser.close()
    
    size = os.path.getsize(output_path)
    print(f"Rendered: {os.path.basename(output_path)} ({size:,} bytes)")
    return output_path

if __name__ == '__main__':
    svg_files = sys.argv[1:] or glob.glob(os.path.join(INPUT_DIR, '*.svg'))
    
    for svg_file in svg_files:
        render_svg(svg_file)
    
    print(f"\nDone! Rendered {len(svg_files)} SVGs to PNG.")
