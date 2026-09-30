# MyJellyFix — Netflix Skin for Jellyfin

A **JellyFrame client mod** that reskins the Jellyfin web UI to look like
Netflix: dark background, red accent, Netflix-style font stack, card hover
zoom, and an opt-in hero banner on the home page.

- **Client-only** — no `serverJs`, no `.NET` plugin, no changes to your
  Jellyfin data or auth.
- **Version-resilient** — uses the safe, stable class selectors documented
  in the JellyFrame CSS guide and a `MutationObserver` so it works across
  Jellyfin 10.10+ (including 12.x).
- **Distributed** via any public HTTPS host with CORS `*` (jsDelivr,
  Cloudflare Pages, Netlify, or a self-hosted Caddy/Nginx block).

## Files

| Path | Purpose |
| --- | --- |
| `mods.json` | JellyFrame manifest. Contains `id`, `version`, asset URLs, and the 4 user-configurable vars. |
| `assets/netflix.css` | All styling. Uses `{{VAR}}` placeholders that JellyFrame substitutes server-side. |
| `assets/netflix.js` | Small DOM enhancer. Idempotent. Adds `nf-hero` class when the hero var is on. |

## Vars

| Key | Type | Default | What it does |
| --- | --- | --- | --- |
| `NF_ACCENT` | color | `#E50914` | Buttons, links, selected nav. Netflix red by default. |
| `NF_BG` | color | `#141414` | Main background. Netflix near-black by default. |
| `NF_CARD_RADIUS` | number | `4` | Card corner radius in px. |
| `NF_HERO` | boolean | `0` | Turn on a full-width hero banner on the home page. |

## Install

### 1. Host the assets

Any public HTTPS location works. The easiest paths:

- **jsDelivr** (recommended): put this repo on a **public** GitHub (or use
  a separate public mirror), tag a release `v0.1.0`, and use:
  `https://cdn.jsdelivr.net/gh/<user>/<repo>@v0.1.0/assets/netflix.css`
- **Cloudflare Pages / Netlify**: deploy the `assets/` folder, add a
  `_headers` file with `Access-Control-Allow-Origin: *`.
- **Self-host via Caddy/Nginx**: serve the `assets/` directory with the
  CORS header. Example Caddy block:

  ```caddy
  @nf path /jellyframe/*
  header @nf Access-Control-Allow-Origin *
  respond @nf /jellyframe/netflix.css "TODO"
  # or a file_server from a mapped dir:
  handle /jellyframe/* {
      header Access-Control-Allow-Origin *
      root * /var/www/myjellyfix
      file_server
  }
  ```

  (Adjust `root` to wherever you place the `assets/` files; rename them
  without the `nf-` prefix or point the manifest at the right path.)

### 2. Point `mods.json` at your hosted URLs

Replace the two `TODO_HOSTED_URL` placeholders in `mods.json` with your
real asset URLs.

### 3. Load the manifest into JellyFrame

In your Jellyfin dashboard: **JellyFrame → Mods → Marketplace** → paste the
URL where you host `mods.json` (same rules: public HTTPS, CORS `*`) →
**Load Mods** → find **MyJellyFix — Netflix Skin** → **Enable** → configure
the 4 vars in the dialog that opens → **Save & Apply**.

### 4. Hard refresh

`Ctrl+Shift+R` in the browser. You should see the Netflix look on the
home page.

## Uninstall

JellyFrame → Mods → Marketplace → disable the mod → **Purge** its cache
(Settings tab). The CSS/JS are not written to disk by Jellyfin — they are
injected per-request, so removing the mod fully reverts the UI.

## Known limitations

- **Native TV apps** (e.g. the official Jellyfin Android TV client) render
  their own UI and do **not** use the web client, so this mod only affects
  browsers, Jellyfin Media Player, and any client that embeds the web UI.
- **Hero banner** is heuristic: it picks the first reasonably-sized card
  that has a backdrop image on the home page. If your home page layout
  changes, the hero may land on a different card.
- **Caching**: JellyFrame caches compiled assets by `{id}__{version}__…`.
  To force a re-download after editing, either bump `version` in
  `mods.json` or use Settings → Theme Cache → Purge.
- **Fidelity**: this is a reskin, not a rewrite. The underlying layout is
  still Jellyfin's; we change colors, fonts, card rounding, hover, and add
  a hero. If you want a *pixel-perfect* Netflix clone, that is a separate,
  much larger project (a custom web client that talks to the Jellyfin API).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Mod doesn't appear in Marketplace | The manifest URL must be public HTTPS with CORS `*`. Check in browser: it should return valid JSON. |
| CSS/JS not applying after edit | Bump `version` in `mods.json`, or purge the JellyFrame cache. Hard refresh. |
| Jellyfin UI looks broken | Disable the mod. Check the browser console for errors in `netflix.js`. The CSS only touches safe selectors; a broken UI means a selector drifted — open an issue. |
| Hero not showing | Make sure `NF_HERO` is on (value `1`) and you're on the home page. |

## Versioning

`version` is a plain string. Bump it on every content change — it busts
the server-side cache. Use SemVer (`0.1.0`, `0.2.0`, …).

## License

TODO — pick one (MIT is the default for Jellyfin ecosystem mods).
