"""Convert PowerPoint files to images with friendly error handling."""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from typing import Sequence


class PPTXConversionError(RuntimeError):
    """Raised when a PowerPoint presentation cannot be converted."""


def convert_pptx_to_images(
    pptx_path: str,
    output_dir: str,
    *,
    converter: str = "libreoffice",
) -> str:
    """Convert a PPTX file to PNG images using LibreOffice.

    Args:
        pptx_path: Path to the PowerPoint presentation.
        output_dir: Directory where the images should be written.
        converter: Name or path of the conversion executable.

    Returns:
        Combined output from the converter process.

    Raises:
        PPTXConversionError: If the conversion fails for any reason.
    """

    if not pptx_path:
        raise PPTXConversionError("No PowerPoint file was provided.")

    if not os.path.isfile(pptx_path):
        raise PPTXConversionError(f"The PowerPoint file '{pptx_path}' was not found.")

    if not output_dir:
        raise PPTXConversionError("No output directory was provided.")

    try:
        os.makedirs(output_dir, exist_ok=True)
    except OSError as exc:
        raise PPTXConversionError(
            f"Failed to create output directory '{output_dir}': {exc}"
        ) from exc

    command = [
        converter,
        "--headless",
        "--convert-to",
        "png",
        "--outdir",
        output_dir,
        pptx_path,
    ]

    try:
        completed = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError as exc:
        raise PPTXConversionError(
            f"The converter '{converter}' could not be found. Install LibreOffice to continue."
        ) from exc
    except subprocess.CalledProcessError as exc:
        message = exc.stderr.strip() or exc.stdout.strip() or "Unknown error"
        raise PPTXConversionError(
            f"Failed to convert '{pptx_path}' to images: {message}"
        ) from exc
    except Exception as exc:  # pragma: no cover - defensive
        raise PPTXConversionError(
            f"Unexpected error while converting '{pptx_path}': {exc}"
        ) from exc

    combined_output = "\n".join(
        part for part in (completed.stdout.strip(), completed.stderr.strip()) if part
    )
    return combined_output


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Convert a PowerPoint presentation into PNG images using LibreOffice.",
    )
    parser.add_argument("pptx", help="Path to the PowerPoint presentation to convert.")
    parser.add_argument(
        "output",
        help="Directory where the generated images should be written.",
    )
    parser.add_argument(
        "--converter",
        default="libreoffice",
        help="Path to the LibreOffice executable (default: libreoffice)",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    try:
        convert_pptx_to_images(args.pptx, args.output, converter=args.converter)
    except PPTXConversionError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:  # pragma: no cover - defensive
        print(f"Unexpected error: {exc}", file=sys.stderr)
        return 1

    print(f"Images created in '{args.output}'.")
    return 0


if __name__ == "__main__":  # pragma: no cover - manual execution
    sys.exit(main())
