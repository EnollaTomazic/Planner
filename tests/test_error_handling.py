import subprocess
import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import create_montage
import pptx_to_img


def test_create_montage_missing_image(tmp_path: Path) -> None:
    output = tmp_path / "montage.png"
    missing = tmp_path / "missing.png"

    with pytest.raises(create_montage.MontageError) as excinfo:
        create_montage.create_montage([str(missing)], str(output))

    assert "not found" in str(excinfo.value)


def test_create_montage_without_pillow(monkeypatch, tmp_path: Path) -> None:
    def fake_loader():
        raise create_montage.MontageError("Pillow is required.")

    monkeypatch.setattr(create_montage, "_load_pillow", fake_loader)

    output = tmp_path / "montage.png"
    image_path = tmp_path / "image.png"
    image_path.write_bytes(b"not really an image")

    with pytest.raises(create_montage.MontageError) as excinfo:
        create_montage.create_montage([str(image_path)], str(output))

    assert "Pillow is required" in str(excinfo.value)


def test_create_montage_cli_prints_error(capsys, tmp_path: Path) -> None:
    exit_code = create_montage.main([str(tmp_path / "out.png"), str(tmp_path / "missing.png")])
    captured = capsys.readouterr()

    assert exit_code == 1
    assert "Error:" in captured.err


def test_pptx_to_img_missing_input(tmp_path: Path) -> None:
    pptx_file = tmp_path / "slides.pptx"
    output_dir = tmp_path / "images"

    with pytest.raises(pptx_to_img.PPTXConversionError) as excinfo:
        pptx_to_img.convert_pptx_to_images(str(pptx_file), str(output_dir))

    assert "was not found" in str(excinfo.value)


def test_pptx_to_img_handles_conversion_failure(monkeypatch, tmp_path: Path) -> None:
    pptx_file = tmp_path / "slides.pptx"
    pptx_file.write_bytes(b"")

    def fake_run(*args, **kwargs):
        raise subprocess.CalledProcessError(1, ["libreoffice"], stderr="conversion failed")

    monkeypatch.setattr(subprocess, "run", fake_run)

    with pytest.raises(pptx_to_img.PPTXConversionError) as excinfo:
        pptx_to_img.convert_pptx_to_images(str(pptx_file), str(tmp_path / "output"))

    assert "conversion failed" in str(excinfo.value)


def test_pptx_cli_prints_error(monkeypatch, capsys, tmp_path: Path) -> None:
    pptx_file = tmp_path / "slides.pptx"
    pptx_file.write_bytes(b"")

    def fake_run(*args, **kwargs):
        raise subprocess.CalledProcessError(1, ["libreoffice"], stderr="boom")

    monkeypatch.setattr(subprocess, "run", fake_run)

    exit_code = pptx_to_img.main([str(pptx_file), str(tmp_path / "images")])
    captured = capsys.readouterr()

    assert exit_code == 1
    assert "Error:" in captured.err
