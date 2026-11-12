/**
 * ImageKit Media Helper for HILAARA Store
 * Builds optimized, responsive image URLs with automatic format negotiation (WebP/AVIF)
 */

const defaultEndpoint = 'https://ik.imagekit.io/hilaara';

export const isImageKitConfigured = Boolean(
  import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT && 
  !import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT.includes('your-id')
);

export function buildImageUrl(pathOrUrl, options = {}) {
  if (!pathOrUrl) {
    return '/brand/hilaara-mark-dark.svg';
  }

  // If already an external absolute URL and not ImageKit, return as is
  if (pathOrUrl.startsWith('http') && !pathOrUrl.includes('ik.imagekit.io')) {
    return pathOrUrl;
  }

  const endpoint = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || defaultEndpoint).replace(/\/$/, '');
  
  // Clean path
  const relativePath = pathOrUrl
    .replace(/^https:\/\/ik\.imagekit\.io\/[^/]+\//, '')
    .replace(/^\//, '');

  const trArray = [];
  if (options.width) trArray.push(`w-${options.width}`);
  if (options.height) trArray.push(`h-${options.height}`);
  if (options.cropMode) trArray.push(`cm-${options.cropMode}`);
  if (options.focus) trArray.push(`fo-${options.focus}`);
  if (options.quality) trArray.push(`q-${options.quality}`);
  trArray.push('f-auto'); // Auto format (WebP / AVIF)

  const trString = trArray.length > 0 ? `tr:${trArray.join(',')}` : '';

  return trString 
    ? `${endpoint}/${trString}/${relativePath}`
    : `${endpoint}/${relativePath}`;
}

/**
 * Common aspect-ratio presets for HILAARA
 */
export const IMAGE_PRESETS = {
  catalogCard: { width: 750, height: 1000, cropMode: 'pad_resize', quality: 85 },
  productDetail: { width: 1200, height: 1600, cropMode: 'pad_resize', quality: 90 },
  thumbnail: { width: 200, height: 200, focus: 'auto', quality: 80 },
  editorialHero: { width: 1920, height: 1080, quality: 85 },
  collectionCard: { width: 800, height: 1000, focus: 'auto', quality: 85 },
};

