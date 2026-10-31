# Merge game brief (for Miles)

## The game
- Merge game: drag two matching items together and they become one item of the next tier.
- Merging earns coins. Higher tiers pay more.
- A shop sells things for coins: new item spawns, boosts, board upgrades, cosmetics.
- Coins are pretend, in-game only. No real money, no ads, no accounts, no data collection.
- Plays in a browser (desktop and tablet touch). Saves progress in the browser (localStorage).

## First playable (v0)
1. 6x6 board, one item family with 8 tiers, a spawn button.
2. Merge = same item + same tier -> next tier, plus coins.
3. Shop with 3 items. Coin counter. Save/load.
4. A tiny tune-up table (tier coin values, shop prices) in one file so Miles can change numbers.
Done means: it runs, a screenshot shows a merge happening, the coin count goes up, and a shop purchase works.

## Stack and skills (scouted 2026-10-30)
- Phaser 4 + TypeScript + Vite. Game rules live outside Phaser scenes (plain TS), scenes only draw.
- gamedev-skills/awesome-gamedev-agent-skills (router + phaser-core, phaser-arcade-physics, game-feel, asset workflow): `npx skills add gamedev-skills/awesome-gamedev-agent-skills`
- openai/plugins game-studio `phaser-2d-game` skill (thin scenes, state outside Phaser, DOM HUD for shop/coins).
- Phaser's official Phaser 4 skills for scenes, input, tweens, particles.
- Art: Game Art Director template on the Grok Bot marketplace (style guide, palettes, sprite sheets) if Miles wants custom art; otherwise simple generated sprites.

## Rules
- Repo work runs on a Cursor cloud agent, not a local clone on Matt's Mac.
- Ask Matt before: creating or pushing to a GitHub repo, publishing the game anywhere public.
- Every build update comes with a screenshot. Never say it works without having run it.
