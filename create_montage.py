"""Utility for building image montages with friendly error handling."""
from __future__ import annotations

import argparse
import math
import os
import sys
from dataclasses import dataclass
from typing import Iterable, Sequence, Tuple


class MontageError(RuntimeError):
    """Raised when the montage cannot be created."""


@dataclass
class MontageOptions:
    """Configuration for the montage layout."""

    columns: int = 3
    tile_size: Tuple[int, int] = (200, 200)
    spacing: int = 10


def _load_pillow():
    """Return the :mod:`PIL.Image` module or raise a :class:`MontageError`."""

    try:
        from PIL import Image  # type: ignore import-not-found
    except ImportError as exc:  # pragma: no cover - platform dependent
        raise MontageError(
            "Pillow is required to create montages. Install it with 'pip install Pillow'."
        ) from exc
    return Image


def _validate_inputs(image_paths: Iterable[str], options: MontageOptions) -> Tuple[str, ...]:
    """Validate the provided image paths and montage options.

    Args:
        image_paths: Sequence of paths to individual image files.
        options: Layout options for the montage.

    Returns:
        A tuple containing normalised image paths.

    Raises:
        MontageError: If validation fails.
    """

    paths = tuple(os.fspath(path) for path in image_paths)
    if not paths:
        raise MontageError("No input images were provided.")

    missing = [path for path in paths if not os.path.isfile(path)]
    if missing:
        missing_str = ", ".join(sorted(missing))
        raise MontageError(f"The following image files were not found: {missing_str}")

    if options.columns <= 0:
        raise MontageError("The number of columns must be greater than zero.")

    width, height = options.tile_size
    if width <= 0 or height <= 0:
        raise MontageError("Tile width and height must be greater than zero.")

    if options.spacing < 0:
        raise MontageError("Spacing between images cannot be negative.")

    return paths


def create_montage(
    image_paths: Sequence[str],
    output_path: str,
    *,
    columns: int = 3,
    tile_size: Tuple[int, int] = (200, 200),
    spacing: int = 10,
) -> str:
    """Create a montage of the provided images.

    Args:
        image_paths: Paths to the images that should be combined.
        output_path: Path where the montage will be saved.
        columns: Number of columns used in the montage grid.
        tile_size: Size each image will be resized to before pasting.
        spacing: Space, in pixels, between images.

    Returns:
        The path to the generated montage file.

    Raises:
        MontageError: If any validation or processing step fails.
    """

    options = MontageOptions(columns=columns, tile_size=tile_size, spacing=spacing)
    normalised_paths = _validate_inputs(image_paths, options)
    Image = _load_pillow()

    processed_images = []
    for path in normalised_paths:
        try:
            with Image.open(path) as img:
                processed_images.append(img.copy())
        except FileNotFoundError:
            raise MontageError(
                f"Image file '{path}' disappeared before it could be processed."
            )
        except OSError as exc:
            raise MontageError(f"Image file '{path}' could not be opened: {exc}") from exc
        except Exception as exc:  # pragma: no cover - defensive
            raise MontageError(
                f"Unexpected error while opening '{path}': {exc}"
            ) from exc

    if not processed_images:
        raise MontageError("No valid images were provided.")

    tile_width, tile_height = options.tile_size
    rows = math.ceil(len(processed_images) / options.columns)
    canvas_width = options.columns * tile_width + options.spacing * (options.columns - 1)
    canvas_height = rows * tile_height + options.spacing * (rows - 1)

    montage = Image.new("RGB", (canvas_width, canvas_height), color=(255, 255, 255))

    for index, image in enumerate(processed_images):
        try:
            image.thumbnail(options.tile_size)
            row, col = divmod(index, options.columns)
            x = col * (tile_width + options.spacing)
            y = row * (tile_height + options.spacing)
            montage.paste(image, (x, y))
        except Exception as exc:  # pragma: no cover - defensive
            raise MontageError(f"Failed to place image '{normalised_paths[index]}': {exc}") from exc

    try:
        montage.save(output_path)
    except FileNotFoundError as exc:
        raise MontageError(
            f"The directory for '{output_path}' does not exist."
        ) from exc
    except OSError as exc:
        raise MontageError(f"Failed to save montage to '{output_path}': {exc}") from exc

    return output_path


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Create a montage from image files.")
    parser.add_argument("output", help="Path where the montage should be saved.")
    parser.add_argument("images", nargs="+", help="Paths to the input images.")
    parser.add_argument(
        "--columns",
        type=int,
        default=3,
        help="Number of columns in the montage grid (default: 3)",
    )
    parser.add_argument(
        "--tile-width",
        type=int,
        default=200,
        help="Width of each tile in pixels (default: 200)",
    )
    parser.add_argument(
        "--tile-height",
        type=int,
        default=200,
        help="Height of each tile in pixels (default: 200)",
    )
    parser.add_argument(
        "--spacing",
        type=int,
        default=10,
        help="Spacing between images in pixels (default: 10)",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)
    options = dict(
        columns=args.columns,
        tile_size=(args.tile_width, args.tile_height),
        spacing=args.spacing,
    )

    try:
        create_montage(args.images, args.output, **options)
    except MontageError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:  # pragma: no cover - defensive
        print(f"Unexpected error: {exc}", file=sys.stderr)
        return 1

    print(f"Montage created at '{args.output}'.")
    return 0


if __name__ == "__main__":  # pragma: no cover - manual execution
    sys.exit(main())
