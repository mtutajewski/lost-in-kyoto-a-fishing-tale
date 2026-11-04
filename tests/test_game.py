"""Automated browser tests for Lost in Kyoto (pytest + Playwright, headless Chromium)."""
import pytest

FISH_IDS = ["ayu", "yamame", "koi", "fugu", "kinryu"]


# ---------------------------------------------------------------- loading & art

def test_game_loads_without_errors(open_game):
    page = open_game()
    page.wait_for_timeout(500)  # let a few frames render
    assert page.errors == []
    assert page.is_visible("text=New Journey")


def test_built_single_file_runs(open_game):
    from run import build

    dist = build()
    page = open_game(dist.as_uri() + "?test")
    page.wait_for_timeout(500)
    assert page.errors == []
    html = dist.read_text(encoding="utf-8")
    assert '<script src="' not in html and 'href="css/' not in html, "bundle should be self-contained"


def test_all_five_fish_have_pixel_art(open_game):
    stats = open_game().evaluate("LIK.spriteStats()")
    assert [s["id"] for s in stats] == FISH_IDS
    for s in stats:
        # each sprite is a real drawing, not an empty canvas
        assert s["pixels"] > 0.3 * s["w"] * s["h"], s


def test_fish_data_is_consistent(open_game):
    fish = open_game().evaluate("LIK.FISH.map(f => ({id: f.id, r: f.r, base: f.base, jp: f.jp, size: f.size}))")
    assert [f["r"] for f in fish] == [0, 1, 2, 3, 4], "one fish per rarity tier"
    assert [f["base"] for f in fish] == sorted(f["base"] for f in fish), "rarer fish are worth more"
    for f in fish:
        assert f["size"][0] < f["size"][1]
        assert f["jp"], "every fish has a Japanese name"


# ---------------------------------------------------------------- core loop

def cast_and_hook(page):
    page.keyboard.down("Space")
    page.wait_for_timeout(400)
    page.keyboard.up("Space")
    page.wait_for_function("LIK.G.state === 'waiting'")
    page.evaluate("LIK.G.waitTot = 0.05")  # skip the wait for a bite
    page.wait_for_function("LIK.G.state === 'bite'")
    page.keyboard.press("Space")
    page.wait_for_function("LIK.G.state === 'reeling'")


def test_full_catch_flow(game):
    cast_and_hook(game)
    game.evaluate("LIK.G.M.prog = 0.999; LIK.G.M.fy = LIK.G.M.zy + 4")  # fish inside the net
    game.wait_for_selector("#inspect.show", timeout=5000)
    caught = game.evaluate("LIK.G.inst.id")
    assert game.evaluate(f"LIK.S.zukan['{caught}'].n") == 1
    assert game.is_visible("#hanko"), "first catch of a species is stamped NEW"

    game.click("#ibtns .btn")  # Keep
    assert game.evaluate("LIK.S.basket.length") == 1
    assert game.evaluate("LIK.G.state") == "idle"
    assert game.errors == []


def test_fish_escapes_when_progress_runs_out(game):
    cast_and_hook(game)
    game.evaluate("LIK.G.M.prog = 0.001; LIK.G.M.fy = 75; LIK.G.M.zy = 0")
    game.wait_for_function("LIK.G.state === 'escaped' || LIK.G.state === 'idle'")
    assert game.evaluate("LIK.S.basket.length") == 0


def test_pressing_too_early_reels_in(game):
    game.keyboard.down("Space")
    game.wait_for_timeout(300)
    game.keyboard.up("Space")
    game.wait_for_function("LIK.G.state === 'waiting'")
    game.evaluate("LIK.G.waitTot = 99")
    game.keyboard.press("Space")
    game.wait_for_function("LIK.G.state === 'escaped' || LIK.G.state === 'idle'")


# ---------------------------------------------------------------- economy

def test_market_sells_fish_and_buys_upgrades(game):
    game.evaluate("""() => { const S = LIK.S;
        S.coins = 0; S.basket = [LIK.makeInst('ayu'), LIK.makeInst('koi')]; }""")
    value = game.evaluate("LIK.S.basket.reduce((a, f) => a + f.val, 0)")
    game.click("[data-p=market]")
    game.click("text=Sell everything")
    assert game.evaluate("LIK.S.basket.length") == 0
    assert game.evaluate("LIK.S.coins") == value

    game.evaluate("LIK.S.coins = 1000")
    game.click(".tab[data-t=buy]")
    game.click("[data-buy='0']")  # Urushi-zao, the second rod
    assert game.evaluate("LIK.S.rod") == 1
    assert game.evaluate("LIK.S.coins") == 1000 - game.evaluate("LIK.RODS[1].price")


def test_cannot_buy_without_enough_coins(game):
    game.evaluate("LIK.S.coins = 5")
    game.click("[data-p=market]")
    game.click(".tab[data-t=buy]")
    assert game.is_disabled("[data-buy='0']")


def test_trade_with_jiro(game):
    game.evaluate("LIK.S.basket = [LIK.makeInst('ayu'), LIK.makeInst('ayu'), LIK.makeInst('ayu')]")
    game.click("[data-p=trade]")
    game.click("[data-tr='0']")  # 3 Ayu -> 1 Yamame
    game.wait_for_selector("#inspect.show")
    assert game.evaluate("LIK.S.basket.length") == 0
    assert "Yamame" in game.inner_text("#iname")
    assert game.evaluate("LIK.S.zukan.yamame.n") == 1


def test_basket_capacity_is_enforced(game):
    game.evaluate("""() => { const S = LIK.S; S.basket = [];
        for (let i = 0; i < S.cap; i++) S.basket.push(LIK.makeInst('ayu'));
        LIK.openInspect(LIK.makeInst('ayu'), true); }""")
    assert game.is_disabled("#ibtns .btn >> nth=0"), "Keep is disabled when the basket is full"


# ---------------------------------------------------------------- progress

def test_progress_is_saved_and_restored(game, open_game):
    game.evaluate("LIK.S.coins = 777; LIK.S.zukan = {ayu: {n: 2, best: 20.5}};")
    game.click("[data-p=zukan]")
    game.click("#px")  # closing a panel saves
    game.reload()
    game.wait_for_function("window.LIK !== undefined")
    game.click("text=Continue")
    assert game.evaluate("LIK.S.coins") == 777
    assert game.evaluate("LIK.S.zukan.ayu.best") == 20.5


def test_completing_the_zukan_triggers_the_ending(game):
    game.evaluate("""() => { const S = LIK.S;
        for (const id of ['ayu', 'yamame', 'koi', 'fugu']) S.zukan[id] = {n: 1, best: 1};
        LIK.openInspect(LIK.makeInst('kinryu'), true); }""")
    game.click("#ibtns .btn")  # Keep
    game.wait_for_selector("text=You were never really lost", timeout=3000)
    assert game.evaluate("LIK.S.done") is True


# ---------------------------------------------------------------- difficulty

SIMULATE = """([species, rod, lagFrames, noise, runs]) => {
  const G = LIK.G; let wins = 0;
  for (let n = 0; n < runs; n++) {
    LIK.set({rod}); G.species = species; G.bob.x = 250; G.shadow = {x: 250, y: 150, dir: 1};
    LIK.startReel();
    const seen = []; let t = 0;
    while (t < 60 && G.state === 'reeling') {          // a simulated player who reacts late
      const M = G.M; seen.push(M.fy);
      const fishY = seen[Math.max(0, seen.length - 1 - lagFrames)];
      G.holding = fishY + 3 > M.zy + M.Z / 2 + (Math.random() * 2 - 1) * noise;
      G.t += 1 / 60; LIK.updReel(1 / 60); t += 1 / 60;
    }
    if (G.state !== 'escaped') wins++;
    document.querySelectorAll('.overlay').forEach(o => o.classList.remove('show'));
    G.state = 'idle'; G.leap = null; G.holding = false;
  }
  return wins / runs;
}"""


@pytest.mark.parametrize("species", ["ayu", "yamame", "koi"])
def test_common_fish_are_easy_with_the_starter_rod(game, species):
    # 0.35 s reaction delay and imprecise holding
    assert game.evaluate(SIMULATE, [species, 0, 21, 8, 40]) >= 0.95


def test_legendary_is_reliable_with_the_best_rod(game):
    assert game.evaluate(SIMULATE, ["kinryu", 2, 21, 8, 40]) >= 0.9


def test_better_rods_never_make_it_harder(game):
    starter = game.evaluate(SIMULATE, ["kinryu", 0, 45, 18, 60])
    best = game.evaluate(SIMULATE, ["kinryu", 2, 45, 18, 60])
    assert best >= starter
