/**
 * Format a timestamp into a human friendly string.
 * @param {number|string|null} timestamp - UNIX timestamp or ISO string.
 * @returns {string} Readable relative time value.
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) {
    return "Never";
  }
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Less than a minute
  if (diff < 60000) {
    return "Just now";
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // More than a day
  return date.toLocaleDateString();
};

