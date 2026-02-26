const cache = new Map();

function getMsUntilMidnight() {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime() - Date.now();
}

function getFromCache(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function setToCache(key, data, ttlMs) {
    cache.set(key, {
        data,
        expiresAt: Date.now() + (ttlMs || getMsUntilMidnight()),
    });
}

function clearCache() {
    cache.clear();
}

function deleteCacheEntry(key) {
    cache.delete(key);
}

function getCacheSize() {
    return cache.size;
}

function getCacheKeys() {
    return [...cache.keys()];
}

function hasCache(key) {
    const entry = cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return false;
    }
    return true;
}

module.exports = {
    getFromCache,
    setToCache,
    clearCache,
    deleteCacheEntry,
    getCacheSize,
    getCacheKeys,
    hasCache,
};