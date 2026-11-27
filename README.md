# FF Archive

A compact editorial archive of Free Fire item IDs, names, rarities and descriptions. Built for the community, modders and collectors.

## Demo

[Live site](https://0xme.github.io/ItemID2/)

## What it does

- Search by keyword, item ID or description, with boolean syntax (`&&` for OR, `&` for AND, `field:value` for exact fields).
- Autocomplete suggestions with keyboard navigation and `/` to focus search.
- Rarity, item type and collection filters, generated from the shipped data.
- Gallery feed with four cards per row on tablet and desktop.
- Adaptive list-detail: a fixed detail pane on large screens, an animated dialog on phones.
- Raw asset mode for browsing every packaged icon.
- Three switchable icon sources: `cdn.json`, the ff-resources PNG list, and locally decoded ASTC textures from the live CDN.
- Icon source timings, cache clearing, Telegram sharing and Google Lens lookup.
- Editorial light and dark schemes with Web Animations motion and reduced-motion support.

## Run locally

```sh
git clone https://github.com/0xMe/ItemID2.git
cd ItemID2
python3 -m http.server 8000
```

Open `http://localhost:8000/`. A static server is required because the app uses ES modules and `fetch`.

## Structure

```text
assets/
  data/       itemData.json, cdn.json, pngs.json
  vendor/     astc_decode_bg.wasm
src/
  app.js                    entry point, state and wiring
  config.js                 constants, source/option definitions
  data/                     repository, cache, icon sources, settings
  ui/                       feed, detail, controls, motion, settings, theme, stats
  utils/                    search, formatting, colour
  styles/                   tokens, base, components, responsive
  vendor/astc-decode.js     local ASTC/WASM decoder
```

Icon lookup order: `assets/data/cdn.json` → ff-resources PNG list → ASTC decode. Any source can be disabled in Settings. Astc decoding loads the vendored WASM from `assets/vendor/astc_decode_bg.wasm`.

## Design

The Accession Catalogue: a restrained editorial treatment with a compact type scale, ruled surfaces, and quiet motion that respects reduced-motion preferences.

## Credits

Built by [0xMe](https://github.com/0xMe). Free Fire resources and assets © Garena. Not affiliated with Garena or Free Fire; assets are provided for educational and non-commercial use only.
