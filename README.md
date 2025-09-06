# Free Fire Items Database

A comprehensive, open-source searchable database for all Garena Free Fire game items—find item IDs, names, rarities, types, images, and detailed descriptions. Built for the Free Fire community, modders, and collectors!

## Demo

[Live Site](https://0xme.github.io/ItemID2/)

## Features

- 🔍 **Search:** Find items by keyword, item ID, or description, with advanced boolean syntax.
- 🎨 **Filter:** Refine results by rarity, item type, and collection category using dropdowns.
- 📦 **Gallery:** Beautiful, paginated gallery of in-game items with lazy-loading for performance.
- 🗑️ **Trash Mode:** Instantly browse raw item icons/assets (great for modders/collectors).
- 🌗 **Theme Switcher:** Toggle between light and dark mode.
- 🚀 **Cache Manager:** Manage and inspect your browser cache storage.
- 📤 **Share:** Instantly share item details via Telegram.
- 🖼️ **Google Lens Integration:** Search for item images directly in Google Lens.
- 🛠️ **Live Repo Updates:** View latest GitHub commits from within the app.
- 🧠 **Autocomplete:** Get fast, relevant search suggestions as you type.
- ♿ **Accessible:** Keyboard navigation, ARIA labels, and screen reader support.

## Tech Stack

- **HTML/CSS/JS:** Modern, responsive, no-build static web app.
- **IBM Plex Mono:** Clean, readable typography.
- **[chroma.js](https://github.com/gka/chroma.js):** Smart color contrast and extraction.
- **[GSAP](https://greensock.com/gsap/):** Fast, smooth UI animations.
- **Free Fire Resources:** Item images and metadata from [ff-resources](https://github.com/0xme/ff-resources).

## Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/0xMe/ItemID2.git
   cd ItemID2
   ```
2. **Serve locally:**  
   Use any static file server (e.g. [serve](https://github.com/vercel/serve), Python's `http.server`, etc.)
   ```sh
   npx serve .
   # or
   python3 -m http.server
   ```
3. **Open in browser:**  
   Visit `http://localhost:5000/` (or your chosen port).

## Data Sources

- `/assets/itemData.json` – Main item database
- `/assets/cdn.json` – CDN image mappings for missing images
- `/pngs/300x300/list.json` – List of available item icons

> All images are fetched from the [ff-resources](https://github.com/0xme/ff-resources) repo via CDN.

## Usage

- **Search:** Type a keyword, item ID, or any part of the description. Supports advanced boolean search:
  - Use `&&` for OR, `&` for AND, and `field:value` for field-specific queries (e.g. `itemType:WEAPON&Rare:ORANGE`).
- **Filter:** Use dropdowns to refine results by rarity, item type, or collection.
- **Trash Mode:** Browse all raw icons and assets.
- **Share/Google Lens:** Click any item for a popup with sharing/search options.
- **Theme:** Toggle light/dark mode from Settings.
- **Cache & Repo:** Use Settings to clear cache or view live repo commits.

## Roadmap

- [x] Advanced search (multi-keyword, boolean, fielded)
- [ ] Desktop and mobile responsive design
- [ ] Community contributions: add new items, translations
- [ ] Admin UI for updating data
- [ ] Export item lists (CSV, JSON)
- [ ] More integrations (Discord, WhatsApp sharing)

## Contributing

Pull requests, bug reports, and feature ideas are welcome!

1. Fork the repo.
2. Make your changes.
3. Submit a PR with a clear description.

## License

[MIT](https://opensource.org/licenses/MIT)

## Credits

- Built by [0xMe](https://github.com/0xMe)
- Free Fire resources & assets © Garena

---

> **Note:** This project is not affiliated with Garena or Free Fire. All assets are for educational and non-commercial use only.
