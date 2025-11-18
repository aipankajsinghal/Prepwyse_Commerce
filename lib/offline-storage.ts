/**
 * IndexedDB wrapper for offline storage
 */

const DB_NAME = "prepwyse-offline";
const DB_VERSION = 1;

const STORES = {
  pendingAttempts: "pendingAttempts",
  cachedQuestions: "cachedQuestions",
  cachedQuizzes: "cachedQuizzes",
  userProgress: "userProgress",
};

let dbInstance: IDBDatabase | null = null;

/**
 * Open or create the IndexedDB database
 */
export async function openOfflineDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.pendingAttempts)) {
        db.createObjectStore(STORES.pendingAttempts, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.cachedQuestions)) {
        db.createObjectStore(STORES.cachedQuestions, { keyPath: "quizId" });
      }
      if (!db.objectStoreNames.contains(STORES.cachedQuizzes)) {
        db.createObjectStore(STORES.cachedQuizzes, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.userProgress)) {
        db.createObjectStore(STORES.userProgress, { keyPath: "attemptId" });
      }
    };
  });
}

/**
 * Save quiz questions to IndexedDB for offline access
 */
export async function cacheQuizQuestions(quizId: string, questions: any[]) {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction([STORES.cachedQuestions], "readwrite");
    const store = transaction.objectStore(STORES.cachedQuestions);

    await store.put({
      quizId,
      questions,
      cachedAt: new Date().toISOString(),
    });

    console.log("[IndexedDB] Cached questions for quiz:", quizId);
  } catch (error) {
    console.error("[IndexedDB] Failed to cache questions:", error);
  }
}

/**
 * Get cached quiz questions from IndexedDB
 */
export async function getCachedQuizQuestions(quizId: string): Promise<any[] | null> {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction([STORES.cachedQuestions], "readonly");
    const store = transaction.objectStore(STORES.cachedQuestions);

    return new Promise((resolve, reject) => {
      const request = store.get(quizId);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.questions : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[IndexedDB] Failed to get cached questions:", error);
    return null;
  }
}

/**
 * Save quiz attempt progress to IndexedDB
 */
export async function saveOfflineProgress(attemptId: string, progress: any) {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction([STORES.userProgress], "readwrite");
    const store = transaction.objectStore(STORES.userProgress);

    await store.put({
      attemptId,
      ...progress,
      lastSyncedAt: new Date().toISOString(),
    });

    console.log("[IndexedDB] Saved progress for attempt:", attemptId);
  } catch (error) {
    console.error("[IndexedDB] Failed to save progress:", error);
  }
}

/**
 * Get saved progress from IndexedDB
 */
export async function getOfflineProgress(attemptId: string): Promise<any | null> {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction([STORES.userProgress], "readonly");
    const store = transaction.objectStore(STORES.userProgress);

    return new Promise((resolve, reject) => {
      const request = store.get(attemptId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[IndexedDB] Failed to get progress:", error);
    return null;
  }
}

/**
 * Queue a quiz attempt for background sync
 */
export async function queueAttemptForSync(attempt: any) {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction([STORES.pendingAttempts], "readwrite");
    const store = transaction.objectStore(STORES.pendingAttempts);

    await store.put({
      ...attempt,
      queuedAt: new Date().toISOString(),
    });

    // Request background sync if available
    if ("sync" in registration) {
      await (registration as any).sync.register("sync-quiz-attempts");
    }

    console.log("[IndexedDB] Queued attempt for sync:", attempt.id);
  } catch (error) {
    console.error("[IndexedDB] Failed to queue attempt:", error);
  }
}

/**
 * Get all pending attempts
 */
export async function getPendingAttempts(): Promise<any[]> {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction([STORES.pendingAttempts], "readonly");
    const store = transaction.objectStore(STORES.pendingAttempts);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("[IndexedDB] Failed to get pending attempts:", error);
    return [];
  }
}

/**
 * Remove a synced attempt from the queue
 */
export async function removeSyncedAttempt(attemptId: string) {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction([STORES.pendingAttempts], "readwrite");
    const store = transaction.objectStore(STORES.pendingAttempts);

    await store.delete(attemptId);
    console.log("[IndexedDB] Removed synced attempt:", attemptId);
  } catch (error) {
    console.error("[IndexedDB] Failed to remove attempt:", error);
  }
}

/**
 * Clear all offline data
 */
export async function clearOfflineData() {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(
      [STORES.pendingAttempts, STORES.cachedQuestions, STORES.cachedQuizzes, STORES.userProgress],
      "readwrite"
    );

    await Promise.all([
      transaction.objectStore(STORES.pendingAttempts).clear(),
      transaction.objectStore(STORES.cachedQuestions).clear(),
      transaction.objectStore(STORES.cachedQuizzes).clear(),
      transaction.objectStore(STORES.userProgress).clear(),
    ]);

    console.log("[IndexedDB] Cleared all offline data");
  } catch (error) {
    console.error("[IndexedDB] Failed to clear data:", error);
  }
}
