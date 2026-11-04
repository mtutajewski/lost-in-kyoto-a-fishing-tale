"""Single entry point for all workflows.

    python run.py play          # serve the game locally and open it in your browser
    python run.py build         # bundle everything into one file: dist/lost-in-kyoto.html
    python run.py test          # run the automated browser tests (pytest + Playwright)
    python run.py screenshots   # regenerate the README screenshots in images/
    python run.py check         # what CI runs: build, then test
"""
import http.server
import re
import socketserver
import subprocess
import sys
import threading
import webbrowser
from functools import partial
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist" / "lost-in-kyoto.html"


def play(port: int = 8000) -> None:
    """Serve the project folder and open the game. (Double-clicking index.html also works.)"""
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    with socketserver.TCPServer(("127.0.0.1", port), handler) as httpd:
        url = f"http://127.0.0.1:{port}/index.html"
        print(f"Lost in Kyoto is running at {url}  (Ctrl+C to stop)")
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


def build() -> Path:
    """Inline the stylesheet and every script into one self-contained HTML file."""
    html = (ROOT / "index.html").read_text(encoding="utf-8")

    def inline_css(m: re.Match) -> str:
        css = (ROOT / m.group(1)).read_text(encoding="utf-8")
        return f"<style>\n{css}</style>"

    def inline_js(m: re.Match) -> str:
        js = (ROOT / m.group(1)).read_text(encoding="utf-8")
        if "</script" in js:
            raise ValueError(f"{m.group(1)} contains '</script' and cannot be inlined")
        return f"<script>\n{js}</script>"

    html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">', inline_css, html)
    html = re.sub(r'<script src="(js/[^"]+)"></script>', inline_js, html)
    DIST.parent.mkdir(exist_ok=True)
    DIST.write_text(html, encoding="utf-8")
    print(f"Built {DIST.relative_to(ROOT)} ({DIST.stat().st_size / 1024:.0f} KB)")
    return DIST


def test() -> int:
    return subprocess.call([sys.executable, "-m", "pytest", "-q", str(ROOT / "tests")])


def screenshots() -> None:
    from tools.screenshots import capture

    capture(ROOT)


def check() -> int:
    build()
    return test()


COMMANDS = {"play": play, "build": build, "test": test, "screenshots": screenshots, "check": check}

if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in COMMANDS:
        print(__doc__)
        sys.exit(1)
    result = COMMANDS[sys.argv[1]]()
    sys.exit(result if isinstance(result, int) else 0)
