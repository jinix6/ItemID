import { store } from "../config.js";

const SOURCES = {
  cdn: "assets/data/cdn.json",
  pngs: "assets/data/pngs.json",
  pngsRemote:
    "https://raw.githubusercontent.com/0xme/ff-resources/refs/heads/main/pngs/300x300/list.json",
  items: "assets/data/itemData.json",
};

async function readJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

async function readPngs() {
  try {
    return await readJson(SOURCES.pngs);
  } catch (localError) {
    try {
      return await readJson(SOURCES.pngsRemote);
    } catch {
      throw localError;
    }
  }
}

export async function loadRepository() {
  const [cdn, pngs, items] = await Promise.all([
    readJson(SOURCES.cdn),
    readPngs(),
    readJson(SOURCES.items),
  ]);

  const cdnMap = new Map();
  for (const entry of cdn) {
    for (const [key, value] of Object.entries(entry)) cdnMap.set(key, value);
  }

  store.cdnMap = cdnMap;
  store.pngsList = Array.isArray(pngs) ? pngs : [];
  store.pngsSet = new Set(store.pngsList);
  store.items = Array.isArray(items) ? items : [];
  store.currentItems = store.items;
}
