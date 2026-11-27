import { debounce } from "../utils/format.js";
import { animateIn, animateOut, clearAnimations } from "./motion.js";

export function createAutocomplete({ input, getItems, limit, onChoose }) {
  const dropdown = document.createElement("div");
  dropdown.className = "autocomplete";
  dropdown.id = "autocomplete-dropdown";
  dropdown.hidden = true;
  input.closest(".controls").append(dropdown);

  let matches = [];
  let activeIndex = -1;
  let hideRequest = 0;

  function hide() {
    matches = [];
    activeIndex = -1;
    if (dropdown.hidden) return;
    hideRequest += 1;
    const request = hideRequest;
    const animation = animateOut(dropdown, {
      duration: 120,
      to: { opacity: 0, transform: "translateY(-4px)" },
    });
    const finish = () => {
      if (request !== hideRequest) return;
      dropdown.hidden = true;
      clearAnimations(dropdown);
    };
    if (animation?.finished) animation.finished.then(finish).catch(finish);
    else finish();
  }

  function choose(text) {
    input.value = text;
    hide();
    onChoose();
  }

  function setActive(index) {
    activeIndex = index;
    for (const row of dropdown.children) {
      row.setAttribute("aria-selected", String(Number(row.dataset.index) === index));
    }
  }

  function highlight(text, words) {
    const fragment = document.createDocumentFragment();
    const lowered = text.toLowerCase();
    const ranges = [];

    for (const word of words) {
      let cursor = 0;
      while (cursor < text.length) {
        const index = lowered.indexOf(word, cursor);
        if (index === -1) break;
        ranges.push([index, index + word.length]);
        cursor = index + word.length;
      }
    }
    ranges.sort((a, b) => a[0] - b[0]);

    let position = 0;
    for (const [start, end] of ranges) {
      if (start < position) continue;
      fragment.append(document.createTextNode(text.slice(position, start)));
      const mark = document.createElement("mark");
      mark.textContent = text.slice(start, end);
      fragment.append(mark);
      position = end;
    }
    fragment.append(document.createTextNode(text.slice(position)));
    return fragment;
  }

  const suggest = debounce(() => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) return hide();
    const words = query.split(/\s+/);
    matches = [];

    for (const item of getItems()) {
      if (matches.length >= limit) break;
      for (const field of [item.icon, item.description, item.description2, item.itemID]) {
        if (field == null) continue;
        const text = String(field);
        if (words.every((word) => text.toLowerCase().includes(word))) {
          if (!matches.includes(text)) matches.push(text);
          break;
        }
      }
    }

    if (!matches.length) return hide();
    activeIndex = -1;

    const fragment = document.createDocumentFragment();
    matches.forEach((text, index) => {
      const row = document.createElement("div");
      row.className = "autocomplete__item";
      row.setAttribute("role", "option");
      row.dataset.index = index;
      row.append(highlight(text, words));
      row.addEventListener("click", () => choose(text));
      fragment.append(row);
    });
    dropdown.replaceChildren(fragment);
    hideRequest += 1;
    dropdown.hidden = false;
    animateIn(dropdown, {
      duration: 150,
      from: { opacity: 0, transform: "translateY(-4px)" },
    });
  }, 100);

  input.addEventListener("input", suggest);
  document.addEventListener("click", (event) => {
    if (!input.parentElement.contains(event.target)) hide();
  });

  function handleKeydown(event) {
    if (dropdown.hidden) return false;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((activeIndex + 1) % matches.length);
      return true;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((activeIndex - 1 + matches.length) % matches.length);
      return true;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      choose(matches[activeIndex]);
      return true;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      hide();
      return true;
    }
    return false;
  }

  return { hide, handleKeydown, get element() { return dropdown; } };
}
