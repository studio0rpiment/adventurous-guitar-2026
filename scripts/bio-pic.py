#!/usr/bin/env python3
"""
Turn a camera-original bio photo into the small square the cards actually use.

The participant cards render a 3.25rem (52 px) thumbnail, so a 12 MB stage
shot is ~700x more pixels than anyone will ever see, and everything under
public/ ships verbatim in the build. This takes originals from
assets-source/bioPics/, crops them square around a named focus point, and
writes 512x512 WebP into public/img/bioPics/.

Crop settings live in assets-source/bioPics/crops.json, not in anyone's head:

    {
      "KellyDoyle.jpg": { "out": "kelly-doyle", "focus": [0.44, 0.50], "zoom": 0.45 }
    }

  focus  fraction of (width, height) the crop centres on. [0.5, 0.5] is dead
         centre; portraits usually want y nearer 0.4 so the head isn't cut.
  zoom   side length of the crop as a fraction of the shorter edge. 1.0 is the
         biggest square that fits; 0.45 pulls in tight on a full-body shot.

Run with no arguments to rebuild everything in the manifest:

    python3 scripts/bio-pic.py

Add a filename to rebuild just that one:

    python3 scripts/bio-pic.py KellyDoyle.jpg
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "assets-source" / "bioPics"
OUT_DIR = ROOT / "public" / "img" / "bioPics"
MANIFEST = SRC_DIR / "crops.json"

SIZE = 512
QUALITY = 82


def build(filename: str, spec: dict) -> None:
    src = SRC_DIR / filename
    if not src.exists():
        print(f"  ! {filename} — not in assets-source/bioPics/, skipped")
        return

    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    w, h = im.size

    fx, fy = spec.get("focus", [0.5, 0.45])
    side = int(min(w, h) * spec.get("zoom", 1.0))

    # Centre the square on the focus point, then slide it back inside the frame
    # rather than clipping — a crop that runs off the edge should shift, not
    # shrink, or the subject drifts out of the middle.
    left = min(max(int(w * fx) - side // 2, 0), w - side)
    top = min(max(int(h * fy) - side // 2, 0), h - side)

    out = OUT_DIR / f"{spec['out']}.webp"
    (im.crop((left, top, left + side, top + side))
       .resize((SIZE, SIZE), Image.LANCZOS)
       .save(out, "WEBP", quality=QUALITY, method=6))

    print(f"  {filename} ({src.stat().st_size // 1024} kB)"
          f" -> {out.name} ({out.stat().st_size // 1024} kB)")


def main() -> int:
    if not MANIFEST.exists():
        print(f"No manifest at {MANIFEST}")
        return 1

    crops = json.loads(MANIFEST.read_text())
    wanted = sys.argv[1:] or list(crops)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename in wanted:
        if filename not in crops:
            print(f"  ! {filename} — no entry in crops.json, skipped")
            continue
        build(filename, crops[filename])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
