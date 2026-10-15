"""
Generate the 4 image variants used for an industry sector.

Usage (from the repo root, needs Pillow: pip install pillow):
    python scripts/resize_industry_images.py                        # every image in scripts/industry-sources/
    python scripts/resize_industry_images.py path/to/folder         # every image in a folder
    python scripts/resize_industry_images.py path/to/file.jpg       # specific files

For each source image the output filename stem is the lowercased input stem,
which must match the sector `code` in content/[id/]industries/_index.md.

Writes to static/assets/images/industries/:
    <code>.webp, <code>.jpg                 1280x720  (desktop)
    <code>-mobile.webp, <code>-mobile.jpg   640x360   (mobile and cards)

Sources that are not 16:9 are center-cropped to 16:9 first.
Folders are scanned for .jpg/.jpeg/.png/.webp. 
Files ending in -mobile and files that are already the generated outputs are skipped.
"""
import sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "static" / "assets" / "images" / "industries"
DEFAULT_SRC = Path(__file__).resolve().parent / "industry-sources"
SIZES = {"": (1280, 720), "-mobile": (640, 360)}
EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def collect(args):
    """Expand folders into image files; keep 1 file per lowercase stem."""
    files = []
    for a in map(Path, args):
        if a.is_dir():
            files += sorted(f for f in a.iterdir() if f.suffix.lower() in EXTS)
        elif a.is_file():
            files.append(a)
        else:
            sys.exit(f"Not found: {a}")
    seen, result = {}, []
    for f in files:
        stem = f.stem.lower()
        if stem.endswith("-mobile") or f.resolve().parent == OUT_DIR.resolve():
            print(f"skip {f.name} (already a generated variant)")
            continue
        if stem in seen:
            print(f"skip {f.name} (same name as {seen[stem].name})")
            continue
        seen[stem] = f
        result.append(f)
    return result


def main(args):
    if not args:
        if not DEFAULT_SRC.is_dir():
            sys.exit(f"No arguments given and {DEFAULT_SRC} does not exist.\n\n{__doc__}")
        args = [DEFAULT_SRC]
    files = collect(args)
    if not files:
        sys.exit("No source images found.")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for p in files:
        code = p.stem.lower()
        src = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
        for suffix, size in SIZES.items():
            im = ImageOps.fit(src, size, Image.LANCZOS, centering=(0.5, 0.5))
            im.save(OUT_DIR / f"{code}{suffix}.webp", "WEBP", quality=75, method=6)
            im.save(OUT_DIR / f"{code}{suffix}.jpg", "JPEG", quality=78, optimize=True, progressive=True)
            print(f"{code}{suffix}: {size[0]}x{size[1]}")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ("-h", "--help"):
        sys.exit(__doc__)
    main(sys.argv[1:])
