import {
  CONFIG,
  ENUM_FIELDS,
  FALLBACK_ENUMS,
  isExpanded,
  state,
  store,
} from "./config.js";
import { loadRepository } from "./data/repository.js";
import { getIconSourceStats } from "./data/icon-source.js";
import { loadSettings } from "./data/settings.js";
import { filterItemsBySearch } from "./utils/search.js";
import { debounce, formatCount, formatEnumLabel } from "./utils/format.js";
import { createFeed } from "./ui/feed.js";
import { createDetailView } from "./ui/detail.js";
import { renderPagination } from "./ui/pagination.js";
import { createAutocomplete } from "./ui/autocomplete.js";
import { createSettings } from "./ui/settings.js";
import { createTheme } from "./ui/theme.js";
import { renderStats } from "./ui/stats.js";
import {
  animateIn,
  animateOut,
  cancelMorph,
  clearAnimations,
  morphImage,
  pressFeedback,
  staggerIn,
} from "./ui/motion.js";

const ICON_STROKE =
  'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
const ICON_CLOSE = `<svg viewBox="0 0 24 24" ${ICON_STROKE} aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

const dom = {};
let feed;
let paneDetail;
let dialogDetail;
let settings;
let theme;
let autocomplete;
let historyNavigation = false;
let closeRequest = 0;
let statsOpen = false;
let statsCloseRequest = 0;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheDom();
  loadSettings();
  loadLastUpdated();

  theme = createTheme({ toggle: dom.themeToggle, meta: dom.themeMeta });
  theme.init();
  theme.bind();

  paneDetail = createDetailView(dom.detailPane, { onClose: clearSelection });
  dialogDetail = createDetailView(dom.detailSlot, { onClose: clearSelection });
  for (const view of [paneDetail, dialogDetail]) {
    for (const button of view.actionButtons) {
      button.addEventListener("click", () => {
        if (button.dataset.action === "share") shareToTelegram();
        else openLens();
      });
    }
  }

  feed = createFeed({
    dom,
    onSelect: (item, src, image, card) => selectItem(item, src, image, card),
  });
  autocomplete = createAutocomplete({
    input: dom.search,
    getItems: () => store.items,
    limit: CONFIG.autocompleteLimit,
    onChoose: () => applyView(1),
  });
  settings = createSettings({
    dom,
    onChange: () => applyView(state.currentPage),
  });
  settings.bind();

  bindEvents();
  syncLayout();

  try {
    await loadRepository();
    buildEnums();
    handleDisplayBasedOnURL();
  } catch (error) {
    console.error("Archive failed to load:", error);
    dom.meta.textContent = "Could not load the archive. Reload to retry.";
    dom.gallery.replaceChildren(emptyState("Index unavailable"));
  }
}

const LAST_UPDATED_KEY = "itemid.lastUpdated";

async function loadLastUpdated() {
  if (!dom.lastUpdated) return;
  try {
    const cached = sessionStorage.getItem(LAST_UPDATED_KEY);
    if (cached) {
      showLastUpdated(cached);
      return;
    }
  } catch {}
  try {
    const response = await fetch(
      "https://api.github.com/repos/0xMe/ItemID2/commits?per_page=1",
    );
    if (!response.ok) return;
    const [commit] = await response.json();
    const iso = commit?.commit?.committer?.date || commit?.commit?.author?.date;
    if (!iso) return;
    const date = new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    try {
      sessionStorage.setItem(LAST_UPDATED_KEY, date);
    } catch {}
    showLastUpdated(date);
  } catch {}
}

function showLastUpdated(date) {
  dom.lastUpdated.textContent = `Updated ${date}`;
  dom.lastUpdated.hidden = false;
}

function cacheDom() {
  const ids = {
    search: "search-input",
    clear: "clear_btn",
    meta: "result-meta",
    gallery: "webpGallery",
    pagination: "pagination",
    paginationWrap: "pagi73hd",
    activeFilters: "active-filters",
    statsBtn: "stats-btn",
    stats: "source-stats",
    settingsOpen: "settings-open",
    settingsClose: "settings-close-btn",
    settings: "settings-bg",
    scrim: "drawer-scrim",
    commitList: "commit-list",
    sourceSettings: "source-settings",
    clearCache: "clear-icon-cache",
    themeToggle: "setting-toggle-appearance-autoLanguage",
    overlay: "mainnnnn-bg",
    dialogPanel: "dialog-panel",
    dialogClose: "hide_dialg_btn",
    detailPane: "detail-pane",
    detailSlot: "detail-slot",
    lastUpdated: "last-updated",
  };
  for (const [key, id] of Object.entries(ids)) dom[key] = document.getElementById(id);

  dom.modeButtons = {
    1: document.getElementById("trashItem_btn"),
    2: document.getElementById("AllItem_btn"),
  };
  dom.selects = {
    Rare: document.getElementById("rareTypeSelect"),
    itemType: document.getElementById("itemTypeSelect"),
    collectionType: document.getElementById("collectionTypeSelect"),
  };
  dom.themeMeta = document.querySelector('meta[name="theme-color"]');
}

function bindEvents() {
  const deferredSearch = debounce(() => applyView(1), 140);
  dom.search.addEventListener("input", () => {
    dom.clear.hidden = !dom.search.value;
    deferredSearch();
  });
  dom.search.addEventListener("keydown", (event) => {
    if (autocomplete.handleKeydown(event)) return;
    if (event.key === "Enter") applyView(1);
  });

  dom.clear.addEventListener("click", () => {
    dom.search.value = "";
    dom.clear.hidden = true;
    clearFilters();
    applyView(1);
    dom.search.focus();
  });

  for (const [value, button] of Object.entries(dom.modeButtons)) {
    button.addEventListener("click", () => {
      state.displayMode = Number(value);
      applyView(1);
    });
  }

  for (const [field, select] of Object.entries(dom.selects)) {
    select.addEventListener("change", () => {
      store.activeFilters[field] = select.value;
      renderFilterChips();
      applyView(1);
    });
  }

  dom.statsBtn.addEventListener("click", () => {
    statsCloseRequest += 1;
    const request = statsCloseRequest;
    if (!statsOpen) {
      statsOpen = true;
      dom.stats.hidden = false;
      dom.statsBtn.setAttribute("aria-expanded", "true");
      renderStats(dom.stats, getIconSourceStats());
      animateIn(dom.stats, {
        duration: 320,
        from: { opacity: 0, transform: "translateY(16px)" },
      });
    } else {
      statsOpen = false;
      dom.statsBtn.setAttribute("aria-expanded", "false");
      const animation = animateOut(dom.stats, {
        duration: 180,
        to: { opacity: 0, transform: "translateY(8px)" },
      });
      const finish = () => {
        if (request !== statsCloseRequest) return;
        dom.stats.hidden = true;
        clearAnimations(dom.stats);
      };
      if (animation?.finished) animation.finished.then(finish).catch(finish);
      else finish();
    }
  });

  dom.dialogClose.addEventListener("click", closeDialog);
  dom.overlay.addEventListener("click", (event) => {
    if (event.target === dom.overlay) closeDialog();
  });

  document.addEventListener("pointerdown", (event) => {
    const button = event.target.closest("button");
    if (
      button &&
      !button.disabled &&
      !button.matches(".detail__actions .btn.btn--filled") &&
      !button.matches(".item-card")
    ) {
      pressFeedback(button);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/") {
      const tag = document.activeElement?.tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT") {
        event.preventDefault();
        dom.search.focus();
        return;
      }
    }
    if (event.key !== "Escape") return;
    if (!autocomplete.element.hidden) autocomplete.hide();
    else if (!dom.overlay.hidden) closeDialog();
    else if (!dom.settings.hidden) settings.close();
  });

  document.addEventListener("keydown", trapFocus);

  window.addEventListener("popstate", () => {
    historyNavigation = true;
    try {
      handleDisplayBasedOnURL();
    } finally {
      historyNavigation = false;
    }
  });

  matchMedia("(min-width: 840px)").addEventListener?.("change", syncLayout);
}

function trapFocus(event) {
  if (event.key !== "Tab") return;
  const container = !dom.overlay.hidden
    ? dom.dialogPanel
    : !dom.settings.hidden
      ? dom.settings
      : null;
  if (!container) return;

  const focusable = [
    ...container.querySelectorAll(
      'button:not([disabled]), a[href], input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => element.getClientRects().length > 0);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function buildEnums() {
  for (const field of ENUM_FIELDS) {
    const counts = new Map();
    for (const item of store.items) {
      const value = item[field];
      if (value == null || value === "") continue;
      const key = String(value);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const values = counts.size
      ? [...counts.entries()]
      : FALLBACK_ENUMS[field].map((value) => [value, 0]);
    values.sort((a, b) => a[0].localeCompare(b[0]));

    const fragment = document.createDocumentFragment();
    fragment.append(new Option("All", ""));
    for (const [value, count] of values) {
      const label = count
        ? `${formatEnumLabel(value)} · ${formatCount(count)}`
        : formatEnumLabel(value);
      fragment.append(new Option(label, value));
    }
    dom.selects[field].replaceChildren(fragment);
  }
}

function renderFilterChips() {
  const fragment = document.createDocumentFragment();
  for (const field of ENUM_FIELDS) {
    const value = store.activeFilters[field];
    if (!value) continue;
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = `${field}: ${formatEnumLabel(value)}`;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "chip__remove";
    remove.setAttribute("aria-label", `Remove ${field} filter`);
    remove.innerHTML = ICON_CLOSE;
    remove.addEventListener("click", () => {
      store.activeFilters[field] = "";
      dom.selects[field].value = "";
      renderFilterChips();
      applyView(1);
    });
    chip.append(remove);
    fragment.append(chip);
  }
  dom.activeFilters.replaceChildren(fragment);
}

function clearFilters() {
  for (const field of ENUM_FIELDS) {
    store.activeFilters[field] = "";
    dom.selects[field].value = "";
  }
  renderFilterChips();
}

function buildQuery() {
  const text = dom.search.value.trim();
  const filters = ENUM_FIELDS
    .filter((field) => store.activeFilters[field])
    .map((field) => `${field}:${store.activeFilters[field]}`);
  if (!filters.length) return text;
  if (!text) return filters.join("&");
  return text
    .split("&&")
    .map((group) => `${group.trim()}&${filters.join("&")}`)
    .join("&&");
}

function syncModeButtons() {
  for (const [value, button] of Object.entries(dom.modeButtons)) {
    button.setAttribute("aria-pressed", String(Number(value) === state.displayMode));
  }
}

function applyView(page = 1) {
  state.currentPage = page;
  syncModeButtons();
  renderPage();
}

function renderPage() {
  const isAssetMode = state.displayMode === 1;
  const query = isAssetMode ? dom.search.value.trim() : buildQuery();
  const source = isAssetMode ? store.pngsList : store.currentItems;

  let filtered;
  if (isAssetMode) {
    const needle = query.trim().toLowerCase();
    filtered = needle
      ? source.filter((name) => String(name).toLowerCase().includes(needle))
      : source;
  } else {
    filtered = filterItemsBySearch(source, query);
  }

  const limit = isAssetMode ? CONFIG.perPageLimitAsset : CONFIG.perPageLimitItem;
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  state.currentPage = Math.min(Math.max(1, state.currentPage), totalPages);

  const start = (state.currentPage - 1) * limit;
  feed.render(filtered.slice(start, start + limit), isAssetMode, state.selected);
  staggerIn(dom.gallery.querySelectorAll(".item-card"), { step: 18, limit: 12 });
  renderPagination(dom, totalPages, state.currentPage, applyView);

  dom.meta.textContent = `${formatCount(filtered.length)} results · page ${state.currentPage} of ${totalPages}`;
  updateUrl();
}

function emptyState(message) {
  const p = document.createElement("p");
  p.className = "feed__empty";
  p.textContent = message;
  return p;
}

function selectItem(item, src, image, card) {
  state.selected = item;
  state.selectedSrc = src || "";
  state.selectedImg = image;
  state.selectedCard = card || null;

  for (const card of dom.gallery.querySelectorAll(".item-card")) {
    card.removeAttribute("aria-current");
  }

  if (isExpanded()) {
    if (!dom.overlay.hidden) closeDialog();
    dom.detailPane.hidden = false;
    dom.detailPane.scrollTop = 0;
    paneDetail.render(item, state.selectedSrc, image);
    morphImage(image, paneDetail.image);
  } else {
    closeRequest += 1;
    dom.overlay.hidden = false;
    dom.detailSlot.scrollTop = 0;
    clearAnimations(dialogDetail.image);
    dialogDetail.render(item, state.selectedSrc, image);
    animateIn(dom.overlay, {
      duration: 200,
      from: { opacity: 0 },
      to: { opacity: 1 },
    });
    animateIn(dom.dialogPanel, {
      duration: 320,
      from: { opacity: 0, transform: "translateY(20px) scale(0.96)" },
    });
    animateIn(dialogDetail.art, {
      duration: 280,
      delay: 60,
      from: { opacity: 0, transform: "scale(0.97)" },
    });
    document.getElementById("hide_dialg_btn").focus();
  }
}

function clearSelection() {
  state.selected = null;
  state.selectedSrc = "";
  state.selectedImg = null;
  for (const card of dom.gallery.querySelectorAll(".item-card")) {
    card.removeAttribute("aria-current");
  }
  if (isExpanded()) paneDetail.empty("Select an item to see its details");
  else closeDialog();
}

function closeDialog() {
  if (dom.overlay.hidden) return;
  const request = ++closeRequest;
  const card = state.selectedCard;
  let settled = false;
  cancelMorph();
  clearAnimations(dialogDetail.image);
  clearAnimations(dialogDetail.art);
  clearAnimations(dom.dialogPanel);
  clearAnimations(dom.overlay);
  const finish = () => {
    if (settled) return;
    settled = true;
    if (request !== closeRequest) return;
    dom.overlay.hidden = true;
    cancelMorph();
    clearAnimations(dialogDetail.image);
    clearAnimations(dialogDetail.art);
    clearAnimations(dom.dialogPanel);
    clearAnimations(dom.overlay);
    (card?.isConnected ? card : dom.search).focus();
  };
  const animation = animateOut(dom.dialogPanel, {
    duration: 240,
    to: { opacity: 0, transform: "translateY(12px) scale(0.97)" },
  });
  animateOut(dom.overlay, { duration: 200, to: { opacity: 0 } });
  animateOut(dialogDetail.art, { duration: 180, to: { opacity: 0 } });
  if (!animation) {
    finish();
    return;
  }
  animation.onfinish = finish;
  if (animation.finished) animation.finished.then(finish).catch(() => {});
  window.setTimeout(finish, 320);
}

function syncLayout() {
  const expanded = isExpanded();
  dom.detailPane.hidden = !expanded;
  if (expanded) {
    if (state.selected) paneDetail.render(state.selected, state.selectedSrc, state.selectedImg);
    else paneDetail.empty("Select an item to see its details");
  } else if (!dom.overlay.hidden) {
    dialogDetail.render(state.selected, state.selectedSrc, state.selectedImg);
  }
}

function updateUrl() {
  if (historyNavigation) return;
  const params = new URLSearchParams();
  const query = buildQuery();
  if (query) params.set("q", query);
  if (state.displayMode !== 2) params.set("mode", state.displayMode);
  if (state.currentPage > 1) params.set("page", state.currentPage);
  const search = params.toString();
  const next = `${location.origin}${location.pathname}${search ? `?${search}` : ""}`;
  if (next !== `${location.origin}${location.pathname}${location.search}`) {
    history.pushState(null, "", next);
  }
}

function handleDisplayBasedOnURL() {
  const params = new URLSearchParams(location.search);
  for (const field of ENUM_FIELDS) {
    store.activeFilters[field] = "";
    dom.selects[field].value = "";
  }
  const groups = (params.get("q") || "")
    .split("&&")
    .map((group) => group.trim())
    .filter(Boolean)
    .map((group) => group.split("&").map((part) => part.trim()).filter(Boolean));
  const textGroups = [];
  for (const tokens of groups) {
    const textTokens = [];
    for (const token of tokens) {
      const index = token.indexOf(":");
      const field = index > 0 ? token.slice(0, index) : "";
      if (ENUM_FIELDS.includes(field)) {
        store.activeFilters[field] = token.slice(index + 1);
        dom.selects[field].value = store.activeFilters[field];
      } else {
        textTokens.push(token);
      }
    }
    if (textTokens.length) textGroups.push(textTokens.join("&"));
  }
  dom.search.value = textGroups.join("&&");
  dom.clear.hidden = !dom.search.value;
  state.displayMode = params.get("mode") === "1" ? 1 : 2;
  syncModeButtons();
  state.currentPage = Math.max(1, Number.parseInt(params.get("page"), 10) || 1);
  renderFilterChips();
  renderPage();
}

function shareToTelegram() {
  if (!state.selected) return;
  const item = state.selected;
  const query = [
    item.icon,
    ...ENUM_FIELDS.filter((field) => store.activeFilters[field]).map(
      (field) => `${field}:${store.activeFilters[field]}`,
    ),
  ].filter(Boolean).join("&");
  const url = `${location.origin}${location.pathname}?q=${encodeURIComponent(query)}&mode=${state.displayMode}`;
  const inline = (value) => String(value ?? "—").replace(/`/g, "'");
  const title = [item.description, item.description2].filter(Boolean).join(" - ") || "Item";
  const message = `Title: \`${inline(title)}\`\nID: \`${inline(item.itemID)}\`\nIcon Name: \`${inline(item.icon)}\`\n\nView: ${url}`;
  window.open(`https://t.me/share/url?url=${encodeURIComponent(message)}`, "_blank");
}

function openLens() {
  if (!state.selectedSrc) return;
  window.open(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(state.selectedSrc)}`, "_blank");
}
