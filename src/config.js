export const CONFIG = {
  perPageLimitItem: 80,
  perPageLimitAsset: 200,
  autocompleteLimit: 10,
};

export const FF_PNG_BASE =
  "https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300/";

export const ENUM_FIELDS = ["Rare", "itemType", "collectionType"];

export const SOURCE_OPTIONS = [
  { id: "cdn", label: "CDN mapping", detail: "assets/data/cdn.json", key: "source.cdn" },
  { id: "pngs", label: "Icon list", detail: "ff-resources pngs list", key: "source.pngs" },
  { id: "astc", label: "ASTC fallback", detail: "live CDN textures", key: "source.astc" },
];

export const DISPLAY_OPTIONS = [
  { id: "lazy", label: "Lazy load images", detail: "Load icons as they scroll", key: "option.lazy" },
  { id: "tint", label: "Tint detail artwork", detail: "Use dominant icon colour", key: "option.tint" },
];

export const FALLBACK_ENUMS = {
  Rare: ["WHITE", "GREEN", "BLUE", "PURPLE", "ORANGE", "RED", "CARD", "PURPLE_PLUS", "ORANGE_PLUS", "NONE"],
  itemType: ["AVATAR", "CLOTHES", "COLLECTION", "TREASUREBOX", "BUNDLE", "DEBRIS", "PET", "VIRTUAL", "STICKER", "NONE"],
  collectionType: ["BANNER", "HEADPIC", "LOOTBOX", "WEAPON_SKIN", "VEHICLE_SKIN", "EMOTE", "QUICK_CHAT", "GAMEBAG", "NONE"],
};

export const state = {
  displayMode: 2,
  currentPage: 1,
  selected: null,
  selectedSrc: "",
  selectedImg: null,
  selectedCard: null,
};

export const store = {
  items: [],
  currentItems: [],
  pngsList: [],
  pngsSet: new Set(),
  cdnMap: new Map(),
  activeFilters: { Rare: "", itemType: "", collectionType: "" },
};

export function isExpanded() {
  return typeof matchMedia === "function" && matchMedia("(min-width: 840px)").matches;
}
