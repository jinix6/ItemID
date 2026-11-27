import { FF_PNG_BASE } from "../config.js";
import { resolveItemIcon, trackIconLoad } from "../data/icon-source.js";
import { isEnabled } from "../data/settings.js";

const RARITY_BG = {
  WHITE: "UI_GachaLimit_QualitySlotBg2_01.png",
  GREEN: "UI_GachaLimit_QualitySlotBg2_02.png",
  BLUE: "UI_GachaLimit_QualitySlotBg2_03.png",
  PURPLE: "UI_GachaLimit_QualitySlotBg2_04.png",
  ORANGE: "UI_GachaLimit_QualitySlotBg2_05.png",
  CARD: "UI_GachaLimit_QualitySlotBg2_06.png",
  RED: "UI_GachaLimit_QualitySlotBg2_07.png",
  Red: "UI_GachaLimit_QualitySlotBg2_07.png",
  PURPLE_PLUS: "UI_GachaExtraAward_QualitySlotBg_04.png",
  ORANGE_PLUS: "UI_GachaExtraAward_QualitySlotBg_05.png",
};

export function createFeed({ dom, onSelect }) {
  function createCard({ item, src, rarity, rarityBg, id, name, selected, resolve }) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "item-card";
    card.dataset.rarity = rarity || "NONE";
    card.style.setProperty(
      "--rarity-bg",
      rarityBg ? `url("${FF_PNG_BASE}${rarityBg}")` : "none",
    );
    if (selected) card.setAttribute("aria-current", "true");

    const media = document.createElement("span");
    media.className = "item-card__media";
    const image = document.createElement("img");
    image.alt = "";
    image.loading = isEnabled("option.lazy") ? "lazy" : "eager";
    image.decoding = "async";
    image.crossOrigin = "anonymous";
    if (src) image.src = src;
    if (resolve) {
      image.dataset.iconSource = resolve;
      trackIconLoad(image, performance.now(), resolve);
    }
    media.append(image);

    const meta = document.createElement("span");
    meta.className = "item-card__meta";
    const idEl = document.createElement("span");
    idEl.className = "item-card__id mono";
    idEl.textContent = id;
    const nameEl = document.createElement("span");
    nameEl.className = "item-card__name";
    nameEl.textContent = name;
    meta.append(idEl, nameEl);

    card.append(media, meta);
    card.addEventListener("click", () => onSelect(item, image.src, image, card));
    return card;
  }

  function render(items, isAssetMode, selected) {
    dom.gallery.dataset.mode = isAssetMode ? "assets" : "items";
    const fragment = document.createDocumentFragment();
    if (!items.length) {
      const notFound = document.createElement("h1");
      notFound.className = "feed__not-found";
      notFound.textContent = "NOT FOUND";
      const empty = document.createElement("p");
      empty.className = "feed__empty";
      empty.textContent = "Try different keywords or clear a filter.";
      fragment.append(notFound, empty);
    } else if (isAssetMode) {
      for (const filename of items) {
        const src = `${FF_PNG_BASE}${filename}`;
        fragment.append(
          createCard({
            item: { icon: filename },
            src,
            id: "asset",
            name: String(filename).replace(/\.png$/i, ""),
            selected: selected?.icon === filename,
            resolve: "pngs",
          }),
        );
      }
    } else {
      for (const item of items) {
        const card = createCard({
          item,
          rarity: item.Rare,
          rarityBg: RARITY_BG[item.Rare],
          id: item.itemID == null ? "—" : item.itemID,
          name: item.description || item.icon || "Untitled",
          selected: selected?.itemID === item.itemID,
        });
        resolveItemIcon(item, card.querySelector("img"), (iconSrc) => {
          card.querySelector("img").src = iconSrc;
        });
        fragment.append(card);
      }
    }
    dom.gallery.replaceChildren(fragment);
  }

  return { render };
}
