export function renderStats(container, rows) {
  const table = document.createElement("table");
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const label of ["Source", "Count", "Avg", "Min", "P95", "Max"]) {
    const th = document.createElement("th");
    th.textContent = label;
    headRow.append(th);
  }
  head.append(headRow);

  const body = document.createElement("tbody");
  for (const row of rows) {
    const tr = document.createElement("tr");
    const cells = [
      [row.source, ""],
      [row.count, ""],
      [row.avgMs, "ms"],
      [row.minMs, "ms"],
      [row.p95Ms, "ms"],
      [row.maxMs, "ms"],
    ];
    for (const [value, unit] of cells) {
      const td = document.createElement("td");
      td.textContent = unit && typeof value === "number" ? `${value} ${unit}` : value;
      tr.append(td);
    }
    body.append(tr);
  }

  table.append(head, body);
  container.replaceChildren(table);
}
