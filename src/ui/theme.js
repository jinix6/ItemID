export function createTheme({ toggle, meta }) {
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    toggle.setAttribute("aria-checked", String(theme === "light"));
    if (meta) meta.content = theme === "light" ? "#f4efe4" : "#171410";
  }

  function stored() {
    const value = localStorage.getItem("theme");
    if (value === "light" || value === "dark") return value;
    return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function flip() {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    apply(next);
  }

  function bind() {
    toggle.addEventListener("click", flip);
    const scheme = matchMedia("(prefers-color-scheme: light)");
    scheme.addEventListener?.("change", () => {
      if (localStorage.getItem("theme")) return;
      apply(scheme.matches ? "light" : "dark");
    });
  }

  return { init: () => apply(stored()), bind };
}
