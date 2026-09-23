"""Build dist/ from src/: inlines the sample-data generator into the app shell."""
from pathlib import Path
root = Path(__file__).parent
app = (root / "src/app.html").read_text(encoding="utf-8")
gen = (root / "src/sample-data.js").read_text(encoding="utf-8")
page = app.replace("/*GEN*/", gen)
(root / "dist").mkdir(exist_ok=True)
(root / "dist/artifact.html").write_text(page, encoding="utf-8")
(root / "dist/index.html").write_text(
    '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    "</head><body>\n" + page + "\n</body></html>\n", encoding="utf-8")
print("Built dist/index.html and dist/artifact.html")
