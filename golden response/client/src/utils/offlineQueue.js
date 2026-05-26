// offlineQueue.js — saves failed operations while offline, flushes when back online
// On flush failure: rollback is handled by the caller (TaskContext) via thrown errors.
import { OFFLINE_QUEUE_KEY } from './constants'

export function enqueueOperation(op) {
  try {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
    queue.push({ ...op, queuedAt: Date.now() })
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
  } catch (err) {
    console.error('offlineQueue enqueue error:', err)
  }
}

// Flush all queued operations when back online.
// Failed ops remain in the queue for the next attempt.
export async function flushOfflineQueue() {
  if (!navigator.onLine) return

  try {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
    if (queue.length === 0) return

    const { default: api } = await import('../api/axios')
    const remaining = []

    for (const op of queue) {
      try {
        await api({ method: op.method, url: op.endpoint, data: op.payload })
      } catch {
        remaining.push(op)
      }
    }

    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining))
  } catch (err) {
    console.error('offlineQueue flush error:', err)
  }
}
