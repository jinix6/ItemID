# Free Fire Items Database

A comprehensive, open-source searchable database for all Garena Free Fire game items, find item IDs, names, rarities, types, images, and detailed descriptions. Built for the Free Fire community, modders, and collectors!

## Demo

[Live Site](https://0xme.github.io/ItemID2/)

## Features

- 🔍 **Search:** Find items by keyword, item ID, or description.
- 🎨 **Filter:** Refine results by rarity, item type, and collection category.
- 📦 **Gallery:** Beautiful, paginated gallery of in-game items.
- 🗑️ **Trash Mode:** Quickly browse all known item icons.
- 🌗 **Theme Switcher:** Toggle between light and dark mode.
- 🚀 **Cache Manager:** Manage your browser cache storage.
- 📤 **Share:** Instantly share item details via Telegram.
- 🖼️ **Google Lens Integration:** Search images directly in Google Lens.
- 🛠️ **Live Repo Updates:** View latest GitHub commits from within the app.

## Tech Stack

- **HTML/CSS/JS:** Modern, responsive web app.
- **IBM Plex Mono:** For clean, readable typography.
- **[chroma.js](https://github.com/gka/chroma.js):** Smart color contrast and extraction.
- **[GSAP](https://greensock.com/gsap/):** Smooth UI animations.
- **Free Fire Resources:** Item images and metadata from [ff-resources](https://github.com/0xme/ff-resources).

## Getting Started

1. **Clone the repo:**
   ```sh
   git clone https://github.com/0xMe/ItemID2.git
   cd ItemID2
   ```
2. **Serve locally:**  
   You can use any static file server (e.g. [serve](https://github.com/vercel/serve), python's `http.server`, etc.)
   ```sh
   npx serve .
   # or
   python3 -m http.server
   ```
3. **Open in browser:**  
   Visit `http://localhost:5000/` (or the port you choose).

## Data Sources

- `/assets/itemData.json` – Main item database
- `/assets/cdn.json` – CDN image mappings
- `/pngs/300x300/list.json` – List of available item icons

> All images are fetched from the [ff-resources](https://github.com/0xme/ff-resources) repo via CDN.

## Usage

- **Search:** Type a keyword, item ID, or any part of the description.
- **Filter:** Use dropdowns to refine results by rarity, item type, or collection.
- **Trash Mode:** Browse raw icons and assets (for modders/collectors).
- **Share/Google Lens:** Click on any item for details and sharing options.
- **Theme:** Toggle light/dark mode from Settings.

## Roadmap

- [ ] Advanced search (multi-keyword, fuzzy)
- [ ] Desktop optimizations
- [ ] Community contributions: add new items, translations

## Contributing

Pull requests, bug reports, and ideas are welcome!

1. Fork the repo.
2. Make your changes.
3. Submit a PR with a clear description.

## License

[MIT](https://opensource.org/licenses/MIT)

## Credits

- Built by [0xMe](https://github.com/0xMe)
- Free Fire resources & assets © Garena

---

> **Note:** This project is not affiliated with Garena or Free Fire. All assets are for educational and non-commercial use.
