#!/usr/bin/env python3
"""Build the production Realrank logo and favicon kit from the approved PNG."""

from __future__ import annotations

import argparse
import base64
import io
import json
import math
from pathlib import Path
from typing import Iterable, Sequence

import numpy as np
from PIL import Image, ImageDraw, ImageFont


CHARCOAL = (32, 32, 30)
TERRACOTTA = (198, 93, 46)
CREAM = (247, 245, 240)
INK = (23, 26, 24)
WHITE = (255, 255, 255)
FONT = Path("/Users/mohit-15993/Library/Fonts/inter-tight-v7-latin-700.ttf")


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG", optimize=True, compress_level=9)


def contain(image: Image.Image, size: tuple[int, int], pad_ratio: float = 0.08) -> Image.Image:
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    max_w = max(1, int(size[0] * (1 - pad_ratio * 2)))
    max_h = max(1, int(size[1] * (1 - pad_ratio * 2)))
    copy = image.copy()
    copy.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    x = (size[0] - copy.width) // 2
    y = (size[1] - copy.height) // 2
    canvas.alpha_composite(copy, (x, y))
    return canvas


def flatten_master(source: Path, size: int = 1024) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    array = np.asarray(image).copy()
    alpha = array[:, :, 3]
    visible = alpha > 8

    rgb = array[:, :, :3].astype(np.int32)
    brand = np.array(CHARCOAL, dtype=np.int32)
    orange = np.array(TERRACOTTA, dtype=np.int32)
    brand_distance = np.sum((rgb - brand) ** 2, axis=2)
    orange_distance = np.sum((rgb - orange) ** 2, axis=2)
    orange_pixels = visible & (orange_distance < brand_distance)
    brand_pixels = visible & ~orange_pixels

    result = np.zeros_like(array)
    result[brand_pixels, :3] = CHARCOAL
    result[orange_pixels, :3] = TERRACOTTA

    # Make interiors fully opaque while preserving the antialiased edge ramp.
    cleaned_alpha = alpha.copy()
    cleaned_alpha[cleaned_alpha >= 180] = 255
    cleaned_alpha[cleaned_alpha <= 8] = 0
    result[:, :, 3] = cleaned_alpha

    flat = Image.fromarray(result, "RGBA")
    bbox = flat.getchannel("A").point(lambda value: 255 if value > 8 else 0).getbbox()
    if not bbox:
        raise RuntimeError("The transparent source did not contain a visible logo.")
    flat = flat.crop(bbox)
    return contain(flat, (size, size), pad_ratio=0.075)


def recolor(image: Image.Image, color: tuple[int, int, int]) -> Image.Image:
    array = np.asarray(image.convert("RGBA")).copy()
    visible = array[:, :, 3] > 0
    array[visible, :3] = color
    return Image.fromarray(array, "RGBA")


def remove_small_brand_islands(image: Image.Image, max_area: int = 1000) -> Image.Image:
    """Remove tiny isolated charcoal window islands for favicon-scale clarity."""
    array = np.asarray(image.convert("RGBA")).copy()
    alpha = array[:, :, 3]
    rgb = array[:, :, :3].astype(np.int32)
    brand_distance = np.sum((rgb - np.array(CHARCOAL, dtype=np.int32)) ** 2, axis=2)
    orange_distance = np.sum((rgb - np.array(TERRACOTTA, dtype=np.int32)) ** 2, axis=2)
    mask = (alpha > 128) & (brand_distance < orange_distance)
    height, width = mask.shape
    visited = np.zeros_like(mask, dtype=bool)

    for y in range(height):
        for x in range(width):
            if not mask[y, x] or visited[y, x]:
                continue
            stack = [(x, y)]
            visited[y, x] = True
            component: list[tuple[int, int]] = []
            while stack:
                current_x, current_y = stack.pop()
                component.append((current_x, current_y))
                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    if (
                        0 <= next_x < width
                        and 0 <= next_y < height
                        and mask[next_y, next_x]
                        and not visited[next_y, next_x]
                    ):
                        visited[next_y, next_x] = True
                        stack.append((next_x, next_y))
            if len(component) <= max_area:
                for component_x, component_y in component:
                    array[component_y, component_x] = (0, 0, 0, 0)
    return Image.fromarray(array, "RGBA")


def trim(image: Image.Image, alpha_cutoff: int = 8) -> Image.Image:
    bbox = image.getchannel("A").point(lambda value: 255 if value > alpha_cutoff else 0).getbbox()
    return image.crop(bbox) if bbox else image


def font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT), size=size)


def horizontal_lockup(icon: Image.Image, width: int, height: int, variant: str) -> Image.Image:
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    icon_size = int(height * 0.78)
    icon_variant = icon
    text_color = CHARCOAL
    if variant == "white":
        icon_variant = recolor(icon, WHITE)
        text_color = WHITE
    elif variant == "mono-dark":
        icon_variant = recolor(icon, INK)
        text_color = INK

    icon_render = contain(trim(icon_variant), (icon_size, icon_size), pad_ratio=0.015)
    left = int(height * 0.08)
    top = (height - icon_size) // 2
    canvas.alpha_composite(icon_render, (left, top))

    face = font(int(height * 0.355))
    draw = ImageDraw.Draw(canvas)
    word = "Realrank"
    bbox = draw.textbbox((0, 0), word, font=face)
    text_h = bbox[3] - bbox[1]
    text_x = left + icon_size + int(height * 0.10)
    text_y = (height - text_h) // 2 - bbox[1]
    draw.text((text_x, text_y), word, font=face, fill=(*text_color, 255))
    return canvas


def stacked_lockup(icon: Image.Image, size: int, variant: str = "primary") -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    icon_variant = icon
    text_color = CHARCOAL
    if variant == "white":
        icon_variant = recolor(icon, WHITE)
        text_color = WHITE
    elif variant == "mono-dark":
        icon_variant = recolor(icon, INK)
        text_color = INK

    icon_box = int(size * 0.68)
    icon_render = contain(trim(icon_variant), (icon_box, icon_box), pad_ratio=0.02)
    canvas.alpha_composite(icon_render, ((size - icon_box) // 2, int(size * 0.035)))

    draw = ImageDraw.Draw(canvas)
    face = font(int(size * 0.142))
    word = "Realrank"
    bbox = draw.textbbox((0, 0), word, font=face)
    text_w = bbox[2] - bbox[0]
    text_y = int(size * 0.78) - bbox[1]
    draw.text(((size - text_w) // 2, text_y), word, font=face, fill=(*text_color, 255))
    return canvas


def wordmark_only(width: int, height: int, variant: str = "primary") -> Image.Image:
    canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    text_color = CHARCOAL
    if variant == "white":
        text_color = WHITE
    elif variant == "mono-dark":
        text_color = INK
    draw = ImageDraw.Draw(canvas)
    face = font(int(height * 0.62))
    word = "Realrank"
    bbox = draw.textbbox((0, 0), word, font=face)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    draw.text(
        ((width - text_width) // 2, (height - text_height) // 2 - bbox[1]),
        word,
        font=face,
        fill=(*text_color, 255),
    )
    return canvas


def make_background_icon(icon: Image.Image, size: int, background: tuple[int, int, int], safe_ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (*background, 255))
    icon_size = int(size * safe_ratio)
    render = contain(trim(icon), (icon_size, icon_size), pad_ratio=0.015)
    canvas.alpha_composite(render, ((size - icon_size) // 2, (size - icon_size) // 2))
    return canvas


def simplify_points(points: Sequence[tuple[float, float]], tolerance: float) -> list[tuple[float, float]]:
    if len(points) < 3:
        return list(points)

    def distance(point: tuple[float, float], start: tuple[float, float], end: tuple[float, float]) -> float:
        x, y = point
        x1, y1 = start
        x2, y2 = end
        dx, dy = x2 - x1, y2 - y1
        if dx == 0 and dy == 0:
            return math.hypot(x - x1, y - y1)
        return abs(dy * x - dx * y + x2 * y1 - y2 * x1) / math.hypot(dx, dy)

    first, last = points[0], points[-1]
    max_distance = 0.0
    index = 0
    for idx in range(1, len(points) - 1):
        current = distance(points[idx], first, last)
        if current > max_distance:
            max_distance = current
            index = idx
    if max_distance > tolerance:
        left = simplify_points(points[: index + 1], tolerance)
        right = simplify_points(points[index:], tolerance)
        return left[:-1] + right
    return [first, last]


def mask_contours(mask: np.ndarray) -> list[list[tuple[float, float]]]:
    # Marching-squares edge table, clockwise corner bits TL/TR/BR/BL = 8/4/2/1.
    segments = {
        1: (("l", "b"),), 2: (("b", "r"),), 3: (("l", "r"),),
        4: (("r", "t"),), 5: (("t", "l"), ("r", "b")),
        6: (("t", "b"),), 7: (("l", "t"),), 8: (("t", "l"),),
        9: (("t", "b"),), 10: (("t", "r"), ("b", "l")),
        11: (("t", "r"),), 12: (("l", "r"),), 13: (("r", "b"),),
        14: (("b", "l"),),
    }

    padded = np.pad(mask.astype(np.uint8), 1)
    edges: list[tuple[tuple[int, int], tuple[int, int]]] = []
    h, w = padded.shape

    def point(edge: str, x: int, y: int) -> tuple[int, int]:
        # Coordinates use a doubled grid so edge midpoints remain integral.
        return {
            "t": (2 * x + 1, 2 * y),
            "r": (2 * x + 2, 2 * y + 1),
            "b": (2 * x + 1, 2 * y + 2),
            "l": (2 * x, 2 * y + 1),
        }[edge]

    for y in range(h - 1):
        for x in range(w - 1):
            case = int(padded[y, x]) * 8 + int(padded[y, x + 1]) * 4 + int(padded[y + 1, x + 1]) * 2 + int(padded[y + 1, x])
            for first, second in segments.get(case, ()): 
                edges.append((point(first, x, y), point(second, x, y)))

    adjacency: dict[tuple[int, int], list[tuple[int, int]]] = {}
    for a, b in edges:
        adjacency.setdefault(a, []).append(b)
        adjacency.setdefault(b, []).append(a)

    unused = {frozenset((a, b)) for a, b in edges}
    contours: list[list[tuple[float, float]]] = []
    while unused:
        edge = next(iter(unused))
        start, current = tuple(edge)
        path = [start, current]
        unused.discard(frozenset((start, current)))
        previous = start
        while current != start:
            candidates = [candidate for candidate in adjacency.get(current, []) if candidate != previous and frozenset((current, candidate)) in unused]
            if not candidates:
                candidates = [candidate for candidate in adjacency.get(current, []) if frozenset((current, candidate)) in unused]
            if not candidates:
                break
            following = candidates[0]
            unused.discard(frozenset((current, following)))
            path.append(following)
            previous, current = current, following
        if len(path) >= 5 and path[-1] == start:
            converted = [((x / 2) - 1, (y / 2) - 1) for x, y in path]
            contours.append(converted)
    return contours


def svg_path_for_mask(mask: np.ndarray, tolerance: float = 1.2) -> str:
    commands: list[str] = []
    for contour in mask_contours(mask):
        if len(contour) < 5:
            continue
        # Simplify an open copy, then explicitly close it.
        simplified = simplify_points(contour[:-1], tolerance)
        if len(simplified) < 3:
            continue
        commands.append(f"M {simplified[0][0]:.2f} {simplified[0][1]:.2f}")
        commands.extend(f"L {x:.2f} {y:.2f}" for x, y in simplified[1:])
        commands.append("Z")
    return " ".join(commands)


def svg_icon(master: Image.Image, brand: str, orange: str) -> str:
    array = np.asarray(master.convert("RGBA"))
    visible = array[:, :, 3] > 128
    rgb = array[:, :, :3].astype(np.int32)
    brand_distance = np.sum((rgb - np.array(CHARCOAL, dtype=np.int32)) ** 2, axis=2)
    orange_distance = np.sum((rgb - np.array(TERRACOTTA, dtype=np.int32)) ** 2, axis=2)
    orange_mask = visible & (orange_distance < brand_distance)
    brand_mask = visible & ~orange_mask
    brand_path = svg_path_for_mask(brand_mask)
    orange_path = svg_path_for_mask(orange_mask)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-labelledby="title desc">\n'
        '  <title id="title">Realrank logo icon</title>\n'
        '  <desc id="desc">An abstract R formed by ranked property parcels and an ascending skyline.</desc>\n'
        f'  <path fill="{brand}" fill-rule="evenodd" d="{brand_path}"/>\n'
        f'  <path fill="{orange}" fill-rule="evenodd" d="{orange_path}"/>\n'
        '</svg>\n'
    )


def svg_lockup(icon_svg: str, orientation: str, variant: str) -> str:
    brand = "#20201E"
    orange = "#C65D2E"
    text_color = brand
    if variant == "white":
        brand = orange = text_color = "#FFFFFF"
    elif variant == "mono-dark":
        brand = orange = text_color = "#171A18"

    # Rebuild the icon with variant colors and extract the path nodes.
    colored = icon_svg.replace("#20201E", brand).replace("#C65D2E", orange)
    path_lines = "\n".join(line for line in colored.splitlines() if "<path " in line)
    if orientation == "horizontal":
        return (
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 400" role="img" aria-labelledby="title desc">\n'
            '  <title id="title">Realrank horizontal logo</title>\n'
            '  <desc id="desc">Realrank icon and wordmark.</desc>\n'
            f'  <g transform="translate(32 32) scale(.328125)">{path_lines}</g>\n'
            f'  <text x="420" y="258" fill="{text_color}" font-family="Inter Tight, Inter, Arial, sans-serif" font-size="172" font-weight="700" letter-spacing="-6">Realrank</text>\n'
            '</svg>\n'
        )
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-labelledby="title desc">\n'
        '  <title id="title">Realrank stacked logo</title>\n'
        '  <desc id="desc">Realrank icon above the wordmark.</desc>\n'
        f'  <g transform="translate(174 36) scale(.66)">{path_lines}</g>\n'
        f'  <text x="512" y="918" text-anchor="middle" fill="{text_color}" font-family="Inter Tight, Inter, Arial, sans-serif" font-size="146" font-weight="700" letter-spacing="-5">Realrank</text>\n'
        '</svg>\n'
    )


def svg_wordmark(variant: str) -> str:
    color = "#20201E"
    if variant == "white":
        color = "#FFFFFF"
    elif variant == "mono-dark":
        color = "#171A18"
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" role="img" aria-labelledby="title">\n'
        '  <title id="title">Realrank wordmark</title>\n'
        f'  <text x="600" y="212" text-anchor="middle" fill="{color}" font-family="Inter Tight, Inter, Arial, sans-serif" font-size="190" font-weight="700" letter-spacing="-7">Realrank</text>\n'
        '</svg>\n'
    )


def make_preview(icon: Image.Image, micro: Image.Image, horizontal: Image.Image, stacked: Image.Image) -> Image.Image:
    width, height = 1600, 1050
    canvas = Image.new("RGB", (width, height), CREAM)
    draw = ImageDraw.Draw(canvas)
    heading = font(62)
    label = font(28)
    draw.text((76, 58), "Realrank brand export kit", font=heading, fill=INK)
    draw.text((78, 136), "Primary · responsive sizes · dark-background proof", font=label, fill=(92, 87, 78))

    primary_panel = Image.new("RGBA", (700, 370), (255, 255, 255, 255))
    primary_panel.alpha_composite(contain(trim(horizontal), (640, 300), pad_ratio=0.03), (30, 34))
    canvas.paste(primary_panel.convert("RGB"), (70, 210))

    dark_panel = Image.new("RGBA", (700, 370), (*CHARCOAL, 255))
    white_horizontal = horizontal_lockup(icon, 1200, 300, "white")
    dark_panel.alpha_composite(contain(trim(white_horizontal), (640, 300), pad_ratio=0.03), (30, 34))
    canvas.paste(dark_panel.convert("RGB"), (830, 210))

    sizes = [128, 64, 48, 32, 16]
    x = 92
    for size in sizes:
        display = max(64, size)
        responsive_icon = micro if size <= 32 else icon
        sample = contain(trim(responsive_icon), (size, size), pad_ratio=0.02).resize((display, display), Image.Resampling.NEAREST)
        canvas.paste(sample, (x, 690), sample)
        draw.text((x, 690 + display + 18), f"{size}px", font=font(24), fill=INK)
        x += display + 84

    stack_thumb = contain(trim(stacked), (440, 440), pad_ratio=0.02)
    canvas.paste(stack_thumb, (1050, 600), stack_thumb)
    return canvas


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    output = args.output
    png_dir = output / "png"
    svg_dir = output / "svg"
    favicon_dir = output / "favicon"
    web_dir = output / "web"
    for directory in (png_dir, svg_dir, favicon_dir, web_dir):
        directory.mkdir(parents=True, exist_ok=True)

    master = flatten_master(args.source, 1024)
    micro = remove_small_brand_islands(master)
    save_png(master, png_dir / "realrank-icon-master-1024.png")
    save_png(micro, png_dir / "realrank-icon-micro-1024.png")

    for size in (512, 256, 128, 64, 48, 32, 16):
        responsive_icon = micro if size <= 32 else master
        resized = contain(trim(responsive_icon), (size, size), pad_ratio=0.075 if size >= 64 else 0.04)
        save_png(resized, png_dir / f"realrank-icon-{size}.png")

    mono_dark = recolor(master, INK)
    mono_white = recolor(master, WHITE)
    save_png(mono_dark, png_dir / "realrank-icon-mono-dark-1024.png")
    save_png(mono_white, png_dir / "realrank-icon-mono-white-1024.png")

    horizontal_primary = horizontal_lockup(master, 1600, 400, "primary")
    horizontal_dark = horizontal_lockup(master, 1600, 400, "mono-dark")
    horizontal_white = horizontal_lockup(master, 1600, 400, "white")
    stacked_primary = stacked_lockup(master, 1024, "primary")
    stacked_white = stacked_lockup(master, 1024, "white")
    wordmark_primary = wordmark_only(1200, 300, "primary")
    wordmark_dark = wordmark_only(1200, 300, "mono-dark")
    wordmark_white = wordmark_only(1200, 300, "white")
    for name, image in (
        ("realrank-logo-horizontal-1600.png", horizontal_primary),
        ("realrank-logo-horizontal-mono-dark-1600.png", horizontal_dark),
        ("realrank-logo-horizontal-white-1600.png", horizontal_white),
        ("realrank-logo-stacked-1024.png", stacked_primary),
        ("realrank-logo-stacked-white-1024.png", stacked_white),
        ("realrank-wordmark-1200.png", wordmark_primary),
        ("realrank-wordmark-mono-dark-1200.png", wordmark_dark),
        ("realrank-wordmark-white-1200.png", wordmark_white),
    ):
        save_png(image, png_dir / name)
    save_png(horizontal_primary.resize((800, 200), Image.Resampling.LANCZOS), png_dir / "realrank-logo-horizontal-800.png")
    save_png(stacked_primary.resize((512, 512), Image.Resampling.LANCZOS), png_dir / "realrank-logo-stacked-512.png")

    icon_svg = svg_icon(master, "#20201E", "#C65D2E")
    icon_micro_svg = svg_icon(micro, "#20201E", "#C65D2E")
    icon_mono_svg = svg_icon(master, "#171A18", "#171A18")
    icon_white_svg = svg_icon(master, "#FFFFFF", "#FFFFFF")
    (svg_dir / "realrank-icon.svg").write_text(icon_svg, encoding="utf-8")
    (svg_dir / "realrank-icon-micro.svg").write_text(icon_micro_svg, encoding="utf-8")
    (svg_dir / "realrank-icon-mono-dark.svg").write_text(icon_mono_svg, encoding="utf-8")
    (svg_dir / "realrank-icon-white.svg").write_text(icon_white_svg, encoding="utf-8")
    for orientation in ("horizontal", "stacked"):
        for variant in ("primary", "mono-dark", "white"):
            suffix = "" if variant == "primary" else f"-{variant}"
            path = svg_dir / f"realrank-logo-{orientation}{suffix}.svg"
            path.write_text(svg_lockup(icon_svg, orientation, variant), encoding="utf-8")
    for variant in ("primary", "mono-dark", "white"):
        suffix = "" if variant == "primary" else f"-{variant}"
        (svg_dir / f"realrank-wordmark{suffix}.svg").write_text(svg_wordmark(variant), encoding="utf-8")

    # Favicons and platform icons.
    favicon_16 = contain(trim(micro), (16, 16), pad_ratio=0.02)
    favicon_32 = contain(trim(micro), (32, 32), pad_ratio=0.025)
    favicon_48 = contain(trim(master), (48, 48), pad_ratio=0.04)
    save_png(favicon_16, favicon_dir / "favicon-16x16.png")
    save_png(favicon_32, favicon_dir / "favicon-32x32.png")
    save_png(favicon_48, favicon_dir / "favicon-48x48.png")
    micro.save(favicon_dir / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

    apple_transparent = contain(trim(master), (180, 180), pad_ratio=0.10)
    apple_standard = make_background_icon(master, 180, CREAM, safe_ratio=0.76)
    android_192 = contain(trim(master), (192, 192), pad_ratio=0.08)
    android_512 = contain(trim(master), (512, 512), pad_ratio=0.08)
    maskable = make_background_icon(master, 512, CREAM, safe_ratio=0.66)
    save_png(apple_transparent, favicon_dir / "apple-touch-icon-transparent.png")
    save_png(apple_standard, favicon_dir / "apple-touch-icon.png")
    save_png(android_192, favicon_dir / "android-chrome-192x192.png")
    save_png(android_512, favicon_dir / "android-chrome-512x512.png")
    save_png(maskable, favicon_dir / "maskable-icon-512x512.png")
    (favicon_dir / "safari-pinned-tab.svg").write_text(icon_mono_svg, encoding="utf-8")

    manifest = {
        "name": "Realrank",
        "short_name": "Realrank",
        "icons": [
            {"src": "android-chrome-192x192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "android-chrome-512x512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "maskable-icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
        "theme_color": "#20201E",
        "background_color": "#F7F5F0",
        "display": "standalone",
    }
    (favicon_dir / "site.webmanifest").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    # Optimized web derivatives.
    master.resize((512, 512), Image.Resampling.LANCZOS).save(web_dir / "realrank-icon-512.webp", "WEBP", lossless=True, method=6)
    horizontal_primary.resize((1200, 300), Image.Resampling.LANCZOS).save(web_dir / "realrank-logo-horizontal-1200.webp", "WEBP", quality=92, method=6)

    preview = make_preview(master, micro, horizontal_primary, stacked_primary)
    save_png(preview, output / "realrank-brand-kit-preview.png")

    print(f"Built Realrank brand kit in {output}")


if __name__ == "__main__":
    main()
