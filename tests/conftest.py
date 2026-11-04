"""Shared fixtures: one headless Chromium for the whole run, a fresh page (and empty save) per test."""
from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
GAME_URL = (ROOT / "index.html").as_uri() + "?test"


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch()
        yield b
        b.close()


@pytest.fixture
def open_game(browser):
    """Return a function that opens the game and collects JavaScript errors."""
    contexts = []

    def _open(url: str = GAME_URL, **kwargs):
        ctx = browser.new_context(viewport={"width": 1280, "height": 720}, **kwargs)
        # Fonts come from Google Fonts; block them so tests are fast and work offline.
        ctx.route("https://fonts.googleapis.com/**", lambda route: route.abort())
        ctx.route("https://fonts.gstatic.com/**", lambda route: route.abort())
        contexts.append(ctx)
        page = ctx.new_page()
        page.errors = []
        page.on("pageerror", lambda e: page.errors.append(str(e)))
        page.goto(url)
        page.wait_for_function("window.LIK !== undefined")
        return page

    yield _open
    for ctx in contexts:
        ctx.close()


@pytest.fixture
def game(open_game):
    """A game that has passed the title and story screens and is ready to fish."""
    page = open_game()
    page.click("text=New Journey")
    page.click("#go")
    page.wait_for_function("LIK.G.state === 'idle'")
    return page
