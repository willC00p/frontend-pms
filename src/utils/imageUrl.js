import api from './api';

// Normalize various backend image path shapes into a usable absolute URL.
// Handles:
// - full URLs (returns as-is)
// - "/storage/..." paths (prefix with origin)
// - "storage/..." or "parking-layouts/.." (prefix with origin + /storage/)
// - bare filenames (prefix with origin + /storage/)
export default function normalizeImageUrl(value) {
  if (!value) return null;
  const str = String(value).trim();

  // Already a full URL
  if (/^https?:\/\//i.test(str)) return str;

  // Determine origin from api.defaults.baseURL or fallback to window.location.origin
  let base = api?.defaults?.baseURL || window?.location?.origin || '';
  // Remove trailing /api if present
  base = base.replace(/\/api\/?$/, '');
  base = base.replace(/\/$/, '');

  // If it starts with /storage, attach to origin
  if (str.startsWith('/storage')) return `${base}${str}`;

  // If it already starts with storage/ or parking-layouts/ assume storage path
  if (str.startsWith('storage/') || str.startsWith('parking-layouts/') || str.startsWith('parking_layouts/')) {
    return `${base}/storage/${str.replace(/^storage\//, '')}`;
  }

  // If it's just a filename like 'parking-layouts/abc.jpg' or 'abc.jpg'
  return `${base}/storage/${str}`;
}
