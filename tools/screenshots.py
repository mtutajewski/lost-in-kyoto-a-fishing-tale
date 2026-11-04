"""Regenerate the README screenshots in images/ (run with: python run.py screenshots)."""
from pathlib import Path

from playwright.sync_api import sync_playwright


def capture(root: Path) -> None:
    out = root / "images"
    out.mkdir(exist_ok=True)
    url = (root / "index.html").as_uri() + "?test"

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        page.goto(url)
        page.wait_for_function("window.LIK !== undefined")
        page.wait_for_timeout(1200)  # web font + a few frames
        page.screenshot(path=out / "title.png")

        page.click("text=New Journey")
        page.click("#go")
        page.evaluate("LIK.set({time: 0.30})")
        page.wait_for_timeout(4500)
        page.evaluate("document.getElementById('toasts').innerHTML = ''")  # hide tutorial tips
        page.screenshot(path=out / "gameplay.png")

        # reeling minigame
        page.keyboard.down("Space")
        page.wait_for_timeout(700)
        page.keyboard.up("Space")
        page.wait_for_function("LIK.G.state === 'waiting'")
        page.evaluate("LIK.G.waitTot = 0.05")
        page.wait_for_function("LIK.G.state === 'bite'")
        page.keyboard.press("Space")
        page.evaluate("LIK.G.species = 'koi'; LIK.startReel(); LIK.G.M.prog = 0.62")
        page.wait_for_timeout(600)
        page.screenshot(path=out / "reeling.png")

        # catch inspection card for the legendary fish
        page.evaluate("LIK.G.state = 'idle'; LIK.openInspect(LIK.makeInst('kinryu'), true)")
        page.wait_for_timeout(1800)
        page.screenshot(path=out / "catch_card.png")
        page.click("#ibtns .btn")

        # night scene + panels with some progress
        page.evaluate("""() => { const S = LIK.S; S.time = 0.78; S.coins = 640;
            for (const id of ['ayu', 'ayu', 'yamame', 'koi', 'fugu']) S.basket.push(LIK.makeInst(id));
            S.zukan = {ayu: {n: 6, best: 23.4}, yamame: {n: 2, best: 27.1}, koi: {n: 1, best: 44.0}}; }""")
        page.wait_for_timeout(1500)
        page.screenshot(path=out / "night.png")
        page.click("[data-p=zukan]")
        page.wait_for_timeout(400)
        page.screenshot(path=out / "zukan.png")
        page.click("#px")
        page.click("[data-p=market]")
        page.click(".tab[data-t=buy]")
        page.wait_for_timeout(400)
        page.screenshot(path=out / "market.png")
        browser.close()

    for f in sorted(out.glob("*.png")):
        print(f"  images/{f.name}")
