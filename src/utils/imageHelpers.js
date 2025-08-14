/**
 * Helper functions for handling property images and thumbnails
 */

// Helper function to get the thumbnail image URL from a listing
export const getThumbnailImageUrl = (listing) => {
  if (!listing || !listing.images || !Array.isArray(listing.images)) {
    return null;
  }
  
  const thumbnailIndex = listing.thumbnailIndex !== undefined ? listing.thumbnailIndex : 0;
  const validImages = listing.images.filter(img => img && img.trim());
  
  if (validImages.length === 0) {
    return null;
  }
  
  // Return the thumbnail image or fallback to first valid image
  return validImages[thumbnailIndex] || validImages[0] || null;
};

// Helper function to get all valid images from a listing
export const getValidImages = (listing) => {
  if (!listing || !listing.images || !Array.isArray(listing.images)) {
    return [];
  }
  
  return listing.images.filter(img => img && img.trim());
};

// Helper function to validate if an image URL is valid format
export const validateImageUrl = (url) => {
  if (!url || url.trim() === '') return true; // Empty is valid (optional)
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
  } catch {
    return false;
  }
};

// Helper function to get the thumbnail index with fallback
export const getThumbnailIndex = (listing) => {
  if (!listing || !listing.images || !Array.isArray(listing.images)) {
    return 0;
  }
  
  const thumbnailIndex = listing.thumbnailIndex !== undefined ? listing.thumbnailIndex : 0;
  const validImages = getValidImages(listing);
  
  // Ensure the thumbnail index is valid, otherwise return 0
  return (thumbnailIndex < validImages.length && validImages[thumbnailIndex]) ? thumbnailIndex : 0;
};
