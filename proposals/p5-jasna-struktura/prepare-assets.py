"""Create ordinary responsive photographs from the supplied originals.

Uses the existing Pillow installation. No downloads or remote assets.
"""
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

print("Prepared 12 responsive WebP photographs and sharing image. Tracked logo and vCard are unchanged.")
