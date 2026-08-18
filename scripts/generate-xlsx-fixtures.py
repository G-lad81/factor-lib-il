"""Generate tiny XLSX files used to exercise the real workbook parser in tests."""

import re
import tempfile
import zipfile
from datetime import datetime
from pathlib import Path

from openpyxl import Workbook


TARGET = Path(__file__).parents[1] / "tests" / "fixtures"
TARGET.mkdir(parents=True, exist_ok=True)


def workbook(name: str, rows: list[list[object]], second_sheet: bool = False) -> None:
    book = Workbook()
    sheet = book.active
    sheet.title = "Portfolio"
    for row in rows:
        sheet.append(row)
    if second_sheet:
        book.create_sheet("Notes").append(["not allowed"])
    book.properties.created = datetime(2025, 1, 1)
    book.properties.modified = datetime(2025, 1, 1)
    target = TARGET / name
    book.save(target)
    with tempfile.NamedTemporaryFile(delete=False) as temporary:
        temporary_path = Path(temporary.name)
    try:
        with zipfile.ZipFile(target, "r") as source, zipfile.ZipFile(
            temporary_path, "w", compression=zipfile.ZIP_DEFLATED
        ) as destination:
            for entry in sorted(source.infolist(), key=lambda item: item.filename):
                normalized = zipfile.ZipInfo(entry.filename, date_time=(2025, 1, 1, 0, 0, 0))
                normalized.compress_type = zipfile.ZIP_DEFLATED
                normalized.external_attr = entry.external_attr
                content = source.read(entry.filename)
                if entry.filename == "docProps/core.xml":
                    content = re.sub(
                        rb"<dcterms:modified[^>]*>.*?</dcterms:modified>",
                        (
                            b'<dcterms:modified xsi:type="dcterms:W3CDTF">'
                            b"2025-01-01T00:00:00Z</dcterms:modified>"
                        ),
                        content,
                    )
                destination.writestr(normalized, content)
        temporary_path.replace(target)
    finally:
        temporary_path.unlink(missing_ok=True)


workbook(
    "portfolio-valid.xlsx",
    [["date", "nav"], [datetime(2025, 1, 30), 100], [datetime(2025, 2, 27), 101.5]],
)
workbook(
    "portfolio-blank-row.xlsx",
    [["date", "nav"], [datetime(2025, 1, 30), 100], [None, None], [datetime(2025, 2, 27), 101.5]],
)
workbook(
    "portfolio-multiple-sheets.xlsx",
    [["date", "nav"], [datetime(2025, 1, 30), 100]],
    second_sheet=True,
)
