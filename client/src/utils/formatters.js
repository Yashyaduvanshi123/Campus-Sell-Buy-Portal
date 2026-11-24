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

/**
 * Clean, neutral SVG placeholder matching the warm ivory/chocolate campus palette.
 * Used whenever a product has no image or when an image fails to load.
 */
export const DEFAULT_PRODUCT_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450" fill="none"><rect width="600" height="450" fill="%23ECE7DE"/><g transform="translate(262, 165)" stroke="%238A7B68" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.65"><path d="m37.5 15 37.5 21.65v43.3L37.5 101.6 0 79.95V36.65L37.5 15z" fill="%23F3EFE7"/><path d="M0 36.65 37.5 58.3m0 0L75 36.65m-37.5 21.65v43.3"/></g><text x="300" y="300" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="%238A7B68" text-anchor="middle" letter-spacing="0.5" opacity="0.75">No Image Available</text></svg>`;

/**
 * Handles image load errors gracefully by falling back to the neutral placeholder.
 * Prevents broken image icons without masking valid images.
 */
export const handleImageError = (e, fallback = DEFAULT_PRODUCT_PLACEHOLDER) => {
  if (e?.currentTarget && e.currentTarget.src !== fallback) {
    e.currentTarget.onerror = null; // Prevent infinite error loops
    e.currentTarget.src = fallback;
  }
};

/**
 * Resolves media/image URLs for both local development and production.
 * - Leaves absolute URLs (http, https, blob, data) untouched (e.g. Cloudinary, Unsplash).
 * - Resolves relative paths (e.g. /uploads/...) using the backend API origin when configured.
 */
export const getMediaUrl = (url, fallback = null) => {
  if (!url) return fallback;
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl) {
    // If apiUrl is https://.../api, strip the trailing /api segment
    const baseOrigin = apiUrl.replace(/\/api\/?$/, '');
    return `${baseOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  return url;
};
