export function renderPagination(dom, totalPages, currentPage, onGo) {
  if (totalPages <= 1) {
    dom.paginationWrap.hidden = true;
    dom.pagination.replaceChildren();
    return;
  }

  dom.paginationWrap.hidden = false;
  const pages = new Set([1, totalPages]);
  for (let offset = -2; offset <= 2; offset += 1) {
    const page = currentPage + offset;
    if (page >= 1 && page <= totalPages) pages.add(page);
  }

  const fragment = document.createDocumentFragment();
  let previous = 0;
  for (const page of [...pages].sort((a, b) => a - b)) {
    if (previous && page - previous > 1) {
      const gap = document.createElement("span");
      gap.className = "pagination__gap";
      gap.textContent = "…";
      fragment.append(gap);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = page;
    button.setAttribute("aria-label", `Page ${page}`);
    if (page === currentPage) button.setAttribute("aria-current", "page");
    button.addEventListener("click", () => onGo(page));
    fragment.append(button);
    previous = page;
  }

  dom.pagination.replaceChildren(fragment);
}
