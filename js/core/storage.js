/**
 * Storage Abstraction Layer
 *
 * Provides unified async API that can switch between localStorage and IndexedDB.
 * Starts in localStorage mode (safe for existing app), switches to IndexedDB after migration.
 */

import { get, set, del } from '../../node_modules/idb-keyval/dist/index.js';

// Storage keys
export const STORAGE_KEY = 'lagomstronk_data';
export const MIGRATION_FLAG_KEY = 'lagomstronk_migrated';
export const BACKUP_KEY = 'lagomstronk_backup';

// Module-level state: determines which storage backend to use
let storageMode = 'localStorage'; // 'localStorage' | 'indexedDB'

/**
 * Initialize storage system
 * Checks if migration has completed and sets appropriate storage mode
 * @returns {Promise<string>} Current storage mode ('localStorage' or 'indexedDB')
 */
export async function initializeStorage() {
  try {
    const migrated = await get(MIGRATION_FLAG_KEY);
    if (migrated && migrated.migratedAt) {
      storageMode = 'indexedDB';
    }
  } catch (error) {
    console.warn('Error checking migration status, defaulting to localStorage:', error);
    storageMode = 'localStorage';
  }
  return storageMode;
}

/**
 * Get value from storage
 * @param {string} key - Storage key
 * @returns {Promise<any>} Stored value or null
 */
export async function storageGet(key) {
  if (storageMode === 'indexedDB') {
    try {
      return await get(key);
    } catch (error) {
      console.error('IndexedDB get failed:', error);
      return null;
    }
  }

  // localStorage mode
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('localStorage get failed:', error);
    return null;
  }
}

/**
 * Set value in storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {Promise<void>}
 */
export async function storageSet(key, value) {
  if (storageMode === 'indexedDB') {
    try {
      await set(key, value);
    } catch (error) {
      console.error('IndexedDB set failed:', error);
      throw error;
    }
    return;
  }

  // localStorage mode
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('localStorage set failed:', error);
    throw error;
  }
}

/**
 * Delete value from storage
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export async function storageDelete(key) {
  if (storageMode === 'indexedDB') {
    try {
      await del(key);
    } catch (error) {
      console.error('IndexedDB delete failed:', error);
      throw error;
    }
    return;
  }

  // localStorage mode
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('localStorage delete failed:', error);
    throw error;
  }
}

/**
 * Check if currently using IndexedDB
 * @returns {boolean}
 */
export function isUsingIndexedDB() {
  return storageMode === 'indexedDB';
}

/**
 * Switch to IndexedDB mode
 * Called by migration process after successful migration
 * @returns {void}
 */
export function enableIndexedDB() {
  storageMode = 'indexedDB';
}
