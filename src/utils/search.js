function compileQuery(query) {
  return String(query)
    .trim()
    .split("&&")
    .map((group) => group.trim())
    .filter(Boolean)
    .map((group) =>
      group
        .split("&")
        .map((condition) => condition.trim())
        .filter(Boolean)
        .map((condition) => {
          const index = condition.indexOf(":");
          return index > 0
            ? {
                field: condition.slice(0, index).trim(),
                value: condition.slice(index + 1).trim().toLowerCase(),
              }
            : { value: condition.toLowerCase() };
        }),
    );
}

function matchesCondition(item, condition) {
  if (condition.field) {
    if (!Object.prototype.hasOwnProperty.call(item, condition.field)) return false;
    const fieldValue = item[condition.field];
    return fieldValue != null && String(fieldValue).toLowerCase() === condition.value;
  }

  return Object.values(item).some(
    (value) => value != null && String(value).toLowerCase().includes(condition.value),
  );
}

export function filterItemsBySearch(items, query) {
  if (!Array.isArray(items)) return [];
  if (query == null || String(query).trim() === "") return items;

  const groups = compileQuery(query);
  if (groups.length === 0) return items;

  return items.filter((item) =>
    groups.some((group) => group.every((condition) => matchesCondition(item, condition))),
  );
}
