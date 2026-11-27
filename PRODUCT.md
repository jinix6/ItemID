# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Free Fire players and collectors who need to identify an item from its ID, name, rarity, or description. They are usually on a phone, often mid-trade or mid-browse, and want an exact answer without digging through game menus or spreadsheets. Creators and resource users may use the raw asset mode, but they are not the primary audience.

## Product Purpose

FF Archive is a searchable, static catalogue of Free Fire items. It turns shipped item data into a fast lookup surface: type an ID, name, rarity, or phrase, narrow with filters, and inspect the matching item's artwork, ID, icon name, and rarity. Success means the right item is found in seconds and can be inspected, shared, or opened in Google Lens without leaving the archive.

## Positioning

A single static archive that combines exact item-ID lookup, boolean field search, and transparent raw-icon access. Neighboring fan wikis focus on prose; asset repositories focus on files. FF Archive keeps the item record and the source of its artwork in the same lookup flow, with no backend or account.

## Operating Context

Used on phones and desktops against a static GitHub Pages deployment. The shipped JSON datasets and icon CDNs are the only sources; there is no server, login, database, or write path. Players consult it during trading, collection tracking, and general browsing. The raw asset mode exists for users who need the underlying PNG list rather than the item record.

## Capabilities and Constraints

- Search across item ID, name, description, and other item fields, with `&&` (OR), `&` (AND), and `field:value` exact matching.
- Autocomplete with keyboard navigation and `/` focus shortcut.
- Data-derived rarity, type, and collection filters plus removable filter chips.
- Gallery feed and adaptive list-detail layout; selected item can be shared to Telegram or opened in Google Lens.
- Raw asset mode over the PNG list; three icon sources (cdn.json, ff-resources PNGs, ASTC WASM decode) with load timings, cache clearing, and source settings.
- Light/dark themes and reduced-motion support.
- Static public hosting only: plain HTML/CSS/ES modules, no backend, no build server required.
- Must stay light enough for low-end phones and constrained data connections.
- All existing features, state, hooks, API calls, and data flows must be preserved.
- The archive is unofficial and not affiliated with Garena; Free Fire and related marks belong to Garena.

## Brand Commitments

The product name is "FF Archive" (the page title also uses "Item archive"). It is an unofficial, non-commercial fan archive. The existing Garena disclaimer and the "not affiliated" position must remain. No new brand claims, endorsements, or official status may be invented.

## Evidence on Hand

- `assets/data/itemData.json`: shipped item records.
- `assets/data/cdn.json` and `assets/data/pngs.json`: icon source inventories.
- `assets/vendor/astc_decode_bg.wasm` and `src/vendor/astc-decode.js`: ASTC decoding path.
- `README.md`: feature and behavior inventory.
- No testimonials, benchmarks, usage metrics, or official Garena assets beyond the item data/icons are on hand; future work must not fabricate them.

## Product Principles

1. Lookup first: the fastest path from a remembered ID, name, or phrase to the exact item is the product's main job.
2. Show the record and its provenance: item facts and icon-source transparency belong together.
3. Stay static and light: every addition must survive GitHub Pages and low-end mobile use.
4. Preserve behavior: the redesign changes the look, not the features, state, or data flow.
5. Stay honestly unofficial: no invented affiliation, metrics, or official claims.

## Accessibility & Inclusion

Existing keyboard support (autocomplete navigation, focus-visible states) and `prefers-reduced-motion` behavior must be preserved. No formal accessibility standard was confirmed; future work should not regress these behaviors.
