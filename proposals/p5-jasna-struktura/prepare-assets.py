"""Create ordinary responsive photographs from the supplied originals.

Uses the existing Pillow installation. No downloads or remote assets.
"""
from base64 import b64encode
import json
from pathlib import Path

from PIL import Image, ImageOps

root = Path(__file__).resolve().parent
source = root.parent.parent
assets = root / "assets"
assets.mkdir(exist_ok=True)

photographs = {
    "namotaji-transformatora": "1793837756519.jpg",
    "aktivni-deo-transformatora": "1793837755965.jpg",
    "terensko-ispitivanje": "1793836992772.jpg",
    "dostava-zamenskog-transformatora": "1793836622709.jpg",
}
gallery = json.loads((root / "copy/gallery.json").read_text(encoding="utf-8"))
for section in gallery:
    for item in section["items"]:
        photographs[item["asset"]] = item["source"]

for name, original in photographs.items():
    with Image.open(source / original) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        for width in (480, 800, 1600):
            height = round(image.height * width / image.width)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            resized.save(assets / f"{name}-{width}.webp", quality=82, method=6)
        if name == "namotaji-transformatora":
            image.resize((1600, 1200), Image.Resampling.LANCZOS).save(
                assets / "share.jpg", quality=85, optimize=True
            )

# The circular mark occupies the first 80 pixels of the supplied 276 x 80 logo.
# Clip the original artwork rather than redraw or distort it for the browser tab.
logo = b64encode((assets / "logo-original.png").read_bytes()).decode("ascii")
(assets / "favicon.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 84 84">'
    '<defs><clipPath id="mark"><rect width="80" height="80"/></clipPath></defs>'
    f'<image width="276" height="80" clip-path="url(#mark)" href="data:image/png;base64,{logo}"/>'
    '</svg>\n', encoding="utf-8"
)

print(f"Prepared {len(photographs) * 3} responsive WebP photographs, sharing image and circular-logo favicon.")
