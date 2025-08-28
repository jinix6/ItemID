/**
 * Cache Manager
 * Minimal implementation with configurable cache names
 */

/**
 * Smart fetch with cache-first strategy
 * @param {string} url - URL of the resource to fetch
 * @param {string} cacheName - Name of the cache storage to use
 * @returns {Promise<ArrayBuffer>} - Resource data as ArrayBuffer
 */
async function smartFetch(url, cacheName = 'texture-cache-v1') {
    // Try cache first
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(url);
        if (cachedResponse) {
            return await cachedResponse.arrayBuffer();
        }
    } catch (error) {
        // Proceed to network if cache fails
    }
    
    // Fall back to network
    const response = await fetch(url);
    
    if (!response.ok) {
        return null;
    }
    
    // Clone before consuming
    const responseClone = response.clone();
    const arrayBuffer = await response.arrayBuffer();
    
    // Cache only successful responses
    if (response.status === 200) {
        try {
            const cache = await caches.open(cacheName);
            await cache.put(url, responseClone);
        } catch (error) {
            // Silent fail - caching is optional
        }
    } else {
        return null;
    }
    
    return arrayBuffer;
}

/**
 * Clears specified cache storage
 * @param {string} cacheName - Name of the cache storage to clear
 * @returns {Promise<void>}
 */
async function clearCache(cacheName = 'texture-cache-v1') {
    try {
        await caches.delete(cacheName);
    } catch (error) {
        throw new Error('Cache clearance failed');
    }
}

/**
 * Clears ALL cache storage for the entire website
 * @returns {Promise<void>}
 */
async function clearSiteCache() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    } catch (error) {
        throw new Error('Full cache clearance failed');
    }
}