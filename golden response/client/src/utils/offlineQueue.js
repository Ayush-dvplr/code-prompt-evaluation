// offlineQueue.js — saves failed operations while offline, flushes when back online
const QUEUE_KEY = 'offline_task_queue';

/**
 * Add an API operation to the queue when the user is offline.
 * @param {{ method: string, endpoint: string, payload: object }} op
 */
export function enqueueOperation(op) {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({ ...op, queuedAt: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('offlineQueue enqueue error:', err);
  }
}

/**
 * Flush all queued operations when back online.
 * Successfully sent ops are removed; failed ones remain for the next attempt.
 */
export async function flushOfflineQueue() {
  if (!navigator.onLine) return;

  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (queue.length === 0) return;

    const { default: api } = await import('../api/axios');
    const remaining = [];

    for (const op of queue) {
      try {
        await api({ method: op.method, url: op.endpoint, data: op.payload });
      } catch {
        remaining.push(op); // keep ops that still fail
      }
    }

    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } catch (err) {
    console.error('offlineQueue flush error:', err);
  }
}
