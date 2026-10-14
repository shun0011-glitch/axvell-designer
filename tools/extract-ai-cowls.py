"""Extract the uploaded Illustrator mask, including paths outside its artboard.

Usage: python tools/extract-ai-cowls.py path/to/mask.ai
Requires pypdf, PyMuPDF and zstandard. The original AI is only read.
"""
import argparse
import io
import json
import re
from pathlib import Path

import fitz
import zstandard
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent


def extract(source):
    reader = PdfReader(source)
    private = reader.pages[0]['/PieceInfo']['/Illustrator']['/Private'].get_object()
    keys = sorted((key for key in private if key.startswith('/AIPrivateData')),
                  key=lambda key: int(key[len('/AIPrivateData'):]))
    data = b''.join(private[key].get_object().get_data() for key in keys)
    magic = data.index(b'\x28\xb5\x2f\xfd')
    with zstandard.ZstdDecompressor().stream_reader(io.BytesIO(data[magic:])) as stream:
        native = stream.read().decode('latin1')
    # Ignore Illustrator's brush/swatch definitions and embedded raster bytes.
    artwork = native[native.rfind('%AI5_EndRaster'):]
    document = fitz.open(source)
    page = document[0]
    image = page.get_images(full=True)[0]
    bounds = page.get_image_rects(image[0])[0]
    width, height = image[2:4]

    def point(value):
        x = (value[0] - bounds.x0) * width / bounds.width
        y = (-value[1] - bounds.y0) * height / bounds.height
        return f'{x:.4f},{y:.4f}'

    paths, chunks, current = [], [], None
    for line in artwork.splitlines():
        line = line.strip()
        if re.fullmatch(r'[-+0-9.eE ]+ [mlcvy]', line):
            tokens = line.split()
            command = tokens.pop()
            values = list(map(float, tokens))
            points = list(zip(values[::2], values[1::2]))
            if command == 'v':
                points, command = [current, *points], 'c'
            elif command == 'y':
                points, command = [*points, points[-1]], 'c'
            chunks.append(command.upper() + ' '.join(point(p) for p in points))
            current = points[-1]
        elif line in ('s', 'S', 'b', 'B', 'f', 'F') and chunks:
            if line not in ('s', 'b', 'f'):
                raise ValueError('Mask contours must be closed')
            paths.append(' '.join([*chunks, 'Z']))
            chunks, current = [], None
    if len(paths) != 15 or (width, height) != (1448, 1086):
        raise ValueError('Expected the approved 15-contour, 1448 × 1086 reference')
    specifications = [
        ('tail', 'リア・シート下カウル', 0, []),
        ('tank', 'タンク', 1, []),
        ('nose', 'フロントカウル', 10, [8, 9]),
        ('upper', 'サイド上部', 2, []),
        ('side', 'サイドカウル', 3, [5, 7]),
        ('under', 'サイド下部・アンダー', 4, [6]),
        ('fender', 'フロントフェンダー', 11, [12, 13, 14]),
    ]
    return {
        'view': 'frontA', 'width': width, 'height': height,
        'contours': len(paths),
        'parts': {pid: {'name': name, 'exterior': paths[outer],
                        'holes': [paths[index] for index in holes]}
                  for pid, name, outer, holes in specifications},
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--output', type=Path,
                        default=ROOT / 'tools/ai-reference-front-a.json')
    args = parser.parse_args()
    reference = extract(args.source)
    args.output.write_text(json.dumps(reference, ensure_ascii=False, indent=2) + '\n')
    print(f"Extracted {reference['contours']} contours into {len(reference['parts'])} physical cowls")
