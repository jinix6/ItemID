import { FF_PNG_BASE } from "../config.js";
import { formatEnumLabel } from "../utils/format.js";
import { getDominantColor } from "../utils/color.js";
import { ICON_UNKNOWN_URL } from "../data/icon-source.js";
import { isEnabled } from "../data/settings.js";
import { animateIn } from "./motion.js";

const SOURCE_LABELS = {
  cdn: "CDN",
  pngs: "PNGs",
  astc: "ASTC",
  unknown: "Unknown",
};

function sourceFromUrl(src) {
  if (!src) return "";
  if (src === ICON_UNKNOWN_URL) return "unknown";
  if (src.startsWith("blob:") || src.startsWith("data:")) return "astc";
  if (src.startsWith(FF_PNG_BASE)) return "pngs";
  return "cdn";
}

function titleSize(text) {
  const length = String(text).length;
  if (length > 100) return "1.05rem";
  if (length > 70) return "1.2rem";
  if (length > 45) return "1.4rem";
  return "1.6rem";
}

export function createDetailView(container, { onClose }) {
  const root = document.createElement("div");
  root.className = "detail";

  const art = document.createElement("div");
  art.className = "detail__art";
  const image = document.createElement("img");
  image.alt = "Item artwork";
  const reveal = () => image.classList.remove("detail__img--loading");
  image.addEventListener("load", reveal);
  image.addEventListener("error", reveal);
  image.src = ICON_UNKNOWN_URL;
  art.append(image);

  const info = document.createElement("div");
  info.className = "detail__info";
  const tags = document.createElement("div");
  tags.className = "detail__tags";
  const chip = document.createElement("span");
  chip.className = "detail__chip";
  chip.hidden = true;
  const typeTag = document.createElement("span");
  typeTag.className = "detail__tag mono";
  typeTag.hidden = true;
  const collectionTag = document.createElement("span");
  collectionTag.className = "detail__tag mono";
  collectionTag.hidden = true;
  const sourceTag = document.createElement("span");
  sourceTag.className = "detail__tag mono";
  sourceTag.hidden = true;
  tags.append(chip, typeTag, collectionTag, sourceTag);
  const title = document.createElement("h2");
  title.className = "detail__title";
  const id = document.createElement("p");
  id.className = "detail__id mono";
  const icon = document.createElement("p");
  icon.className = "detail__icon mono";

  const actions = document.createElement("div");
  actions.className = "detail__actions";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "btn btn--filled";
  close.textContent = "Close";
  close.addEventListener("click", onClose);
  const share = document.createElement("button");
  share.type = "button";
  share.className = "btn btn--icon";
  share.dataset.action = "share";
  share.setAttribute("aria-label", "Share to Telegram");
  share.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>';
  const lens = document.createElement("button");
  lens.type = "button";
  lens.className = "btn btn--icon";
  lens.dataset.action = "lens";
  lens.setAttribute("aria-label", "Search image in Google Lens");
  lens.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
  const placeholder = document.createElement("p");
  placeholder.className = "detail__empty";
  placeholder.textContent = "Select an item to see its details";

  actions.append(close, share, lens);
  info.append(tags, title, id, icon, actions);
  root.append(art, info);
  container.replaceChildren(root, placeholder);

  function setImage(src) {
    const next = src || ICON_UNKNOWN_URL;
    if (image.getAttribute("src") === next) {
      image.classList.toggle("detail__img--loading", !image.complete);
      return;
    }
    image.classList.add("detail__img--loading");
    image.src = next;
    if (image.complete) image.classList.remove("detail__img--loading");
  }

  function render(item, src, sourceImg) {
    root.hidden = false;
    placeholder.hidden = true;
    setImage(src);
    const description =
      [item.description, item.description2].filter(Boolean).join(" - ") || item.icon || "Item";
    title.textContent = description;
    title.style.setProperty("--title-size", titleSize(description));
    id.textContent = item.itemID == null ? "" : `ID ${item.itemID}`;
    icon.textContent = item.icon ? `Icon ${item.icon}` : "";
    const hasRarity = item.Rare && item.Rare !== "NONE";
    chip.hidden = !hasRarity;
    chip.textContent = hasRarity ? formatEnumLabel(item.Rare) : "";
    chip.dataset.rarity = hasRarity ? item.Rare : "";
    typeTag.hidden = !item.itemType;
    typeTag.textContent = item.itemType ? `Type: ${formatEnumLabel(item.itemType)}` : "";
    const hasCollection = item.collectionType && item.collectionType !== "NONE";
    collectionTag.hidden = !hasCollection;
    collectionTag.textContent = hasCollection
      ? `Collection: ${formatEnumLabel(item.collectionType)}`
      : "";
    const source = sourceImg?.dataset.iconSource || sourceFromUrl(src);
    sourceTag.hidden = !source;
    sourceTag.textContent = source ? `Source: ${SOURCE_LABELS[source] || source}` : "";

    if (isEnabled("option.tint")) {
      const dominant = getDominantColor(sourceImg);
      art.style.setProperty("--art", dominant ? `${dominant.r} ${dominant.g} ${dominant.b}` : "none");
    } else {
      art.style.setProperty("--art", "none");
    }

    animateIn(info, {
      duration: 300,
      delay: 90,
      from: { opacity: 0, transform: "translateY(10px)" },
    });
  }

  function empty(message) {
    placeholder.textContent = message;
    placeholder.hidden = false;
    root.hidden = true;
  }

  return { root, art, image, render, empty, actionButtons: [share, lens] };
}
