export const formatPrice = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculateDiscount = (sellingPrice, originalPrice) => {
  if (!originalPrice || originalPrice <= sellingPrice) return 0;
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Format dynamic category product counts based on exact conditions:
 * - count = 0 -> "No items yet"
 * - count = 1 -> "1 item"
 * - 1 < count <= 50 -> exact count e.g. "12 items", "35 items", "50 items"
 * - count > 50 -> "50+ items"
 */
export const formatItemCount = (count) => {
  const num = parseInt(count, 10);
  if (isNaN(num) || num <= 0) {
    return 'No items yet';
  }
  if (num === 1) {
    return '1 item';
  }
  if (num <= 50) {
    return `${num} items`;
  }
  return '50+ items';
};
