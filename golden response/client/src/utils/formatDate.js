/**
 * Format a Date or date string into a readable label.
 * @returns {string} e.g. "Jan 15, 2025" or "No due date"
 */
export function formatDate(date) {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Returns true if the date is in the past */
export function isPast(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}
