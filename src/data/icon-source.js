import { FF_PNG_BASE, store } from "../config.js";
import { smartFetch } from "./cache.js";
import { isEnabled } from "./settings.js";
import {
  decodeASTCTexture,
  drawToCanvas,
  initASTCDecoder,
  parseASTCHeader,
} from "../vendor/astc-decode.js";

const ASTC_ICON_BASE_URL =
  "https://dl-tata.freefireind.in/live/ABHotUpdates/IconCDN/android";
const ASTC_ICON_CACHE_NAME = "texture-cache-v1";
const ASTC_MAX_CONCURRENT_DECODES = 4;
const ASTC_ICON_CACHE_LIMIT = 200;

export const ICON_UNKNOWN_URL = `${FF_PNG_BASE}UI_EPFP_unknown.png`;

const astcIconPromises = new Map();
const astcIconResolvedKeys = new Set();
const astcIconQueue = [];
const iconSourceTimings = { cdn: [], pngs: [], astc: [], unknown: [] };
const iconLoadStart = new WeakMap();
let astcActiveDecodes = 0;
let astcDecoderPromise = null;
let astcGeneration = 0;

export function resolveItemIcon(item, img, onResolved) {
  const startedAt = performance.now();
  const finish = (src, source) => {
    if (img) img.dataset.iconSource = source;
    onResolved(src);
    trackIconLoad(img, startedAt, source);
  };
  const itemId = item?.itemID != null ? String(item.itemID) : null;

  const cdnUrl = isEnabled("source.cdn") && itemId ? store.cdnMap.get(itemId) : null;
  if (cdnUrl) {
    finish(cdnUrl, "cdn");
    return;
  }

  if (
    isEnabled("source.pngs") &&
    item.icon &&
    store.pngsSet.has(`${item.icon}.png`)
  ) {
    finish(`${FF_PNG_BASE}${item.icon}.png`, "pngs");
    return;
  }

  if (itemId && isEnabled("source.astc")) {
    if (img) img.dataset.iconSource = "astc";
    getAstcIconUrl(itemId).then((decodedUrl) => {
      finish(decodedUrl || ICON_UNKNOWN_URL, decodedUrl ? "astc" : "unknown");
    });
    return;
  }

  finish(ICON_UNKNOWN_URL, "unknown");
}

export function trackIconLoad(img, startedAt, source) {
  iconLoadStart.set(img, { startedAt, source });
  img.addEventListener("load", () => recordIconLoad(img), { once: true });
  img.addEventListener("error", () => iconLoadStart.delete(img), { once: true });
}

function recordIconLoad(img) {
  const info = iconLoadStart.get(img);
  if (!info) return;
  iconLoadStart.delete(img);
  const samples = iconSourceTimings[info.source];
  if (!samples) return;
  samples.push(performance.now() - info.startedAt);
  if (samples.length > 500) samples.shift();
}

export function clearIconCache() {
  astcGeneration += 1;
  for (const task of astcIconQueue) task.resolve(null);
  astcIconQueue.length = 0;
  astcIconPromises.clear();
  astcIconResolvedKeys.clear();
}

export function getIconSourceStats() {
  return Object.entries(iconSourceTimings).map(([source, samples]) => {
    const sorted = [...samples].sort((a, b) => a - b);
    return {
      source,
      count: samples.length,
      avgMs: samples.length
        ? +(samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(1)
        : 0,
      minMs: samples.length ? +sorted[0].toFixed(1) : 0,
      p95Ms: samples.length ? +sorted[Math.floor(sorted.length * 0.95)].toFixed(1) : 0,
      maxMs: samples.length ? +sorted[sorted.length - 1].toFixed(1) : 0,
    };
  });
}

function getAstcIconUrl(itemId) {
  const key = String(itemId);
  if (!astcIconPromises.has(key)) {
    astcIconPromises.set(
      key,
      new Promise((resolve) => {
        astcIconQueue.push({ key, resolve });
        pumpAstcIconQueue();
      }),
    );
  }
  return astcIconPromises.get(key);
}

function pumpAstcIconQueue() {
  while (
    astcActiveDecodes < ASTC_MAX_CONCURRENT_DECODES &&
    astcIconQueue.length > 0
  ) {
    const task = astcIconQueue.shift();
    const generation = astcGeneration;
    astcActiveDecodes += 1;
    decodeAstcIcon(task.key)
      .catch(() => null)
      .then((dataUrl) => {
        if (generation !== astcGeneration) {
          task.resolve(null);
        } else {
          task.resolve(dataUrl);
          astcIconResolvedKeys.add(task.key);
          if (astcIconResolvedKeys.size > ASTC_ICON_CACHE_LIMIT) {
            const oldest = astcIconResolvedKeys.values().next().value;
            astcIconResolvedKeys.delete(oldest);
            astcIconPromises.delete(oldest);
          }
        }
        astcActiveDecodes -= 1;
        pumpAstcIconQueue();
      });
  }
}

function ensureAstcDecoder() {
  if (!astcDecoderPromise) {
    astcDecoderPromise = initASTCDecoder().catch((error) => {
      astcDecoderPromise = null;
      throw error;
    });
  }
  return astcDecoderPromise;
}

async function decodeAstcIcon(itemId) {
  const url = `${ASTC_ICON_BASE_URL}/${itemId}_rgb.astc`;
  const buffer = await smartFetch(url, ASTC_ICON_CACHE_NAME);
  if (!buffer || buffer.byteLength === 0) return null;

  await ensureAstcDecoder();

  const astcData = new Uint8Array(buffer);
  const header = parseASTCHeader(astcData);
  const pixels = decodeASTCTexture(astcData);

  const canvas = document.createElement("canvas");
  canvas.width = header.width;
  canvas.height = header.height;
  const ctx = canvas.getContext("2d");
  if (!ctx || !drawToCanvas(ctx, pixels, header.width, header.height)) return null;

  return canvas.toDataURL("image/png");
}
