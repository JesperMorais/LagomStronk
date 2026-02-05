/**
 * Storage Migration System
 *
 * Handles silent migration from localStorage to IndexedDB on app load.
 * Verifies data integrity, keeps localStorage backup, emits events for monitoring.
 */

import { get, set } from '../../node_modules/idb-keyval/dist/index.js';
import { eventBus, EVENTS } from '../core/eventBus.js';
import { STORAGE_KEY, MIGRATION_FLAG_KEY, BACKUP_KEY, enableIndexedDB } from '../core/storage.js';

/**
 * Migrate data from localStorage to IndexedDB
 *
 * Process:
 * 1. Check if already migrated (skip if yes)
 * 2. Read from localStorage
 * 3. Write to IndexedDB
 * 4. Verify data integrity (critical)
 * 5. Mark as migrated
 * 6. Keep localStorage backup
 * 7. Switch to IndexedDB mode
 *
 * @returns {Promise<Object>} Migration result
 */
export async function migrateToIndexedDB() {
  // 1. Check if already migrated
  const migrated = await get(MIGRATION_FLAG_KEY);
  if (migrated) {
    return { success: true, skipped: true };
  }

  eventBus.emit(EVENTS.MIGRATION_STARTED);

  try {
    // 2. Read from localStorage
    const localStorageData = localStorage.getItem(STORAGE_KEY);
    if (!localStorageData) {
      // No data to migrate - mark as migrated anyway
      await set(MIGRATION_FLAG_KEY, { migratedAt: new Date().toISOString() });
      enableIndexedDB();
      eventBus.emit(EVENTS.MIGRATION_COMPLETE, { hadData: false });
      return { success: true, hadData: false };
    }

    const data = JSON.parse(localStorageData);

    // 3. Write to IndexedDB
    await set(STORAGE_KEY, data);

    // 4. Verify migration (critical - read back and compare)
    const verified = await get(STORAGE_KEY);
    if (!verified || JSON.stringify(verified) !== JSON.stringify(data)) {
      throw new Error('Migration verification failed');
    }

    // 5. Mark as migrated
    await set(MIGRATION_FLAG_KEY, {
      migratedAt: new Date().toISOString(),
      workoutCount: data.workouts?.length || 0
    });

    // 6. Keep localStorage backup (don't delete - user decision from CONTEXT)
    localStorage.setItem(BACKUP_KEY, localStorageData);

    // 7. Switch to IndexedDB mode
    enableIndexedDB();

    eventBus.emit(EVENTS.MIGRATION_COMPLETE, {
      hadData: true,
      workoutCount: data.workouts?.length || 0
    });

    return { success: true, hadData: true };

  } catch (error) {
    console.error('Migration failed:', error);
    eventBus.emit(EVENTS.MIGRATION_FAILED, { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Retry failed migration
 * Clears migration flag to allow retry
 *
 * @returns {Promise<Object>} Migration result
 */
export async function retryMigration() {
  // Clear migration flag to allow retry
  await set(MIGRATION_FLAG_KEY, null);
  return migrateToIndexedDB();
}
