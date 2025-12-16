import { openDB } from "idb";

const DB_NAME = "portfolio-db";
const STORE_NAME = "profiles";
const DB_VERSION = 1;

let dbInstance = null;
let dbPromise = null;

const isBrowser = () => {
  return typeof window !== 'undefined' && 
         typeof indexedDB !== 'undefined' &&
         !process.env.JEST_WORKER_ID; // For test environments
};

const initDB = () => {
  if (!isBrowser()) {
    return Promise.resolve({
      get: () => Promise.resolve(null),
      put: () => Promise.resolve(),
      delete: () => Promise.resolve(),
      clear: () => Promise.resolve(),
      getAll: () => Promise.resolve([]),
      transaction: () => ({
        objectStore: () => ({
          get: () => Promise.resolve(null),
          put: () => Promise.resolve(),
        }),
      }),
    });
  }

  if (dbPromise) return dbPromise;

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME);
        // Optional: Add index for better querying
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    },
  }).then(db => {
    dbInstance = db;
    return db;
  }).catch(error => {
    console.error('Failed to initialize IndexedDB:', error);
    // Reset promise on error
    dbPromise = null;
    throw error;
  });

  return dbPromise;
};

// Get DB instance with lazy initialization
export const getDB = async () => {
  return initDB();
};

export async function getCachedProfile(profileId) {
  if (!profileId || !isBrowser()) return null;
  
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const result = await store.get(profileId);
    await tx.done;
    return result;
  } catch (error) {
    console.warn('Failed to get cached profile:', error);
    return null;
  }
}

export async function saveCachedProfile(profileId, profile) {
  if (!profileId || !profile || !isBrowser()) return;
  
  try {
    const profileWithMetadata = {
      ...profile,
      cachedAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.put(profileWithMetadata, profileId);
    await tx.done;
  } catch (error) {
    console.warn('Failed to save cached profile:', error);
  }
}

export async function clearCache() {
  if (!isBrowser()) return;
  
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.clear();
    await tx.done;
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

export async function deleteCachedProfile(profileId) {
  if (!profileId || !isBrowser()) return;
  
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await store.delete(profileId);
    await tx.done;
  } catch (error) {
    console.warn('Failed to delete cached profile:', error);
  }
}

// Optional: Cache invalidation - delete old cache entries
export async function cleanOldCache(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
  if (!isBrowser()) return;
  
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('updatedAt');
    
    const cutoff = Date.now() - maxAge;
    const allKeys = await store.getAllKeys();
    
    for (const key of allKeys) {
      const item = await store.get(key);
      if (item && item.updatedAt < cutoff) {
        await store.delete(key);
      }
    }
    
    await tx.done;
  } catch (error) {
    console.warn('Failed to clean old cache:', error);
  }
}

export const isCacheAvailable = isBrowser();