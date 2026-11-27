export async function smartFetch(url, cacheName = "texture-cache-v1") {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(url);
    if (cached) return await cached.arrayBuffer();
  } catch {}

  const response = await fetch(url);
  if (!response.ok) return null;

  const clone = response.clone();
  const buffer = await response.arrayBuffer();

  try {
    const cache = await caches.open(cacheName);
    await cache.put(url, clone);
  } catch {}

  return buffer;
}

export async function clearCache(cacheName = "texture-cache-v1") {
  await caches.delete(cacheName);
}

export async function clearSiteCache() {
  const names = await caches.keys();
  await Promise.all(names.map((name) => caches.delete(name)));
}
