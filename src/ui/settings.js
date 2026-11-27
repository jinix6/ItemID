import { SOURCE_OPTIONS, DISPLAY_OPTIONS } from "../config.js";
import { settings, setSetting } from "../data/settings.js";
import { clearIconCache } from "../data/icon-source.js";
import { clearSiteCache } from "../data/cache.js";
import { animateIn, animateOut, clearAnimations, slideIn, slideOut } from "./motion.js";

export function createSettings({ dom, onChange }) {
  let commitsLoaded = false;
  let closeRequest = 0;

  function renderOptions() {
    const fragment = document.createDocumentFragment();
    for (const option of [...SOURCE_OPTIONS, ...DISPLAY_OPTIONS]) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "switch-row";
      row.setAttribute("role", "switch");
      row.setAttribute("aria-checked", String(settings[option.key]));
      row.dataset.key = option.key;

      const label = document.createElement("span");
      const title = document.createElement("span");
      title.textContent = option.label;
      const detail = document.createElement("span");
      detail.className = "switch-row__detail";
      detail.textContent = option.detail;
      label.append(title, detail);

      const track = document.createElement("span");
      track.className = "switch";
      track.setAttribute("aria-hidden", "true");
      const knob = document.createElement("span");
      knob.className = "switch__knob";
      track.append(knob);

      row.append(label, track);
      row.addEventListener("click", () => {
        const next = !settings[option.key];
        setSetting(option.key, next);
        row.setAttribute("aria-checked", String(next));
        onChange();
      });
      fragment.append(row);
    }
    dom.sourceSettings.replaceChildren(fragment);
  }

  function open() {
    closeRequest += 1;
    renderOptions();
    dom.settings.hidden = false;
    dom.scrim.hidden = false;
    dom.settingsOpen.setAttribute("aria-expanded", "true");
    animateIn(dom.scrim, { duration: 120, from: { opacity: 0 }, to: { opacity: 1 } });
    slideIn(dom.settings);
    dom.settingsClose.focus();
    fetchCommits();
  }

  function close() {
    if (dom.settings.hidden) return;
    const request = ++closeRequest;
    const finish = () => {
      if (request !== closeRequest) return;
      dom.settings.hidden = true;
      dom.scrim.hidden = true;
      clearAnimations(dom.settings);
      clearAnimations(dom.scrim);
      dom.settingsOpen.setAttribute("aria-expanded", "false");
      dom.settingsOpen.focus();
    };
    const animation = slideOut(dom.settings);
    animateOut(dom.scrim, { duration: 120, to: { opacity: 0 } });
    if (animation?.finished) animation.finished.then(finish).catch(finish);
    else finish();
  }

  async function fetchCommits() {
    if (commitsLoaded) return;
    commitsLoaded = true;
    dom.commitList.textContent = "Loading commits…";

    try {
      const response = await fetch(
        "https://api.github.com/repos/0xMe/ItemID2/commits?per_page=5",
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const commits = await response.json();

      const list = document.createElement("ul");
      for (const commit of commits) {
        const item = document.createElement("li");
        const code = document.createElement("code");
        code.textContent = commit.sha.slice(0, 7);
        const meta = document.createElement("span");
        meta.className = "commit__meta";
        const author = commit.author?.login || commit.commit?.author?.name || "unknown";
        const date = commit.commit?.author?.date
          ? new Date(commit.commit.author.date).toLocaleDateString()
          : "";
        meta.textContent = `${author}${date ? ` · ${date}` : ""}`;
        const message = document.createElement("span");
        message.className = "commit__message";
        message.textContent = commit.commit?.message || "";
        item.append(code, meta, message);
        list.append(item);
      }
      dom.commitList.replaceChildren(list);
    } catch {
      commitsLoaded = false;
      dom.commitList.textContent = "Could not load commits.";
    }
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || dom.settings.hidden) return;
    const focusable = [
      ...dom.settings.querySelectorAll(
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

  function bind() {
    dom.settingsOpen.addEventListener("click", open);
    dom.settingsClose.addEventListener("click", close);
    dom.scrim.addEventListener("click", close);
    dom.clearCache.addEventListener("click", async () => {
      await clearSiteCache().catch(() => {});
      clearIconCache();
      onChange();
    });
    document.addEventListener("keydown", trapFocus);
  }

  return { open, close, bind, isOpen: () => !dom.settings.hidden };
}
