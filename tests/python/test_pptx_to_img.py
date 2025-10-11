from pathlib import Path

import json
import pytest

from scripts import pptx_to_img


@pytest.fixture
def slide_spec(tmp_path: Path) -> Path:
    spec = {
        "defaults": {"width": 1920, "height": 1080},
        "slides": [
            {
                "elements": [
                    {"name": "title", "x": 100, "y": 100, "width": 400, "height": 150},
                    {"name": "body", "x": 200, "y": 300, "width": 800, "height": 400},
                ]
            },
            {
                "width": 1280,
                "height": 720,
                "elements": [
                    {"name": "footer", "x": 10, "y": 650, "width": 1260, "height": 60}
                ],
            },
        ],
    }
    spec_path = tmp_path / "slides.json"
    spec_path.write_text(json.dumps(spec))
    return spec_path


def test_detect_overflow_identifies_out_of_bounds_elements():
    elements = [
        pptx_to_img.SlideElement(name="ok", x=10, y=10, width=100, height=100),
        pptx_to_img.SlideElement(name="overflow", x=1800, y=1000, width=200, height=200),
        pptx_to_img.SlideElement(name="negative", x=-10, y=5, width=20, height=20),
    ]
    overflows = pptx_to_img.detect_overflow(elements, slide_width=1920, slide_height=1080)

    assert {entry["name"] for entry in overflows} == {"overflow", "negative"}
    reasons = {entry["name"]: set(entry["reasons"]) for entry in overflows}
    assert reasons["overflow"] == {"right", "bottom"}
    assert reasons["negative"] == {"left"}


def test_export_slide_images_creates_placeholder_files(slide_spec: Path, tmp_path: Path):
    slides = pptx_to_img.load_slide_spec(slide_spec)
    output_dir = tmp_path / "output"

    generated = pptx_to_img.export_slide_images(slides, output_dir)

    assert len(generated) == 2
    for path in generated:
        assert path.exists()
        assert path.read_bytes().startswith(b"\x89PNG")


def test_export_slide_images_raises_on_overflow(tmp_path: Path):
    slides = [
        pptx_to_img.Slide(
            width=100,
            height=100,
            elements=[
                pptx_to_img.SlideElement(
                    name="too big",
                    x=0,
                    y=0,
                    width=150,
                    height=20,
                )
            ],
        )
    ]

    with pytest.raises(OverflowError):
        pptx_to_img.export_slide_images(slides, tmp_path)


def test_main_generates_files(slide_spec: Path, tmp_path: Path):
    output_dir = tmp_path / "images"
    result = pptx_to_img.main([str(slide_spec), str(output_dir)])

    assert result == 0
    exported = sorted(output_dir.glob("*.png"))
    assert len(exported) == 2
