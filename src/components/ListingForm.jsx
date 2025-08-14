import React, { useState } from 'react';
import { RiLoader4Line } from 'react-icons/ri';
import Toast from './Toast';

const ListingForm = ({ 
  listing, 
  onListingChange, 
  onSubmit, 
  onCancel, 
  submitting, 
  mode = 'add', // 'add' or 'edit'
  showExternalToast // Optional: function to show toast from parent component
}) => {
  // Toast state management
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Toast helper functions
  const showToast = (message, type = 'success') => {
    if (showExternalToast) {
      showExternalToast(message, type);
    } else {
      setToast({
        show: true,
        message,
        type
      });
    }
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  // Enhanced form submission with toast notifications
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields before submission
    if (!listing.title?.trim()) {
      showToast('Property title is required', 'error');
      return;
    }
    
    if (!listing.price?.trim()) {
      showToast('Property price is required', 'error');
      return;
    }
    
    if (!listing.location?.trim()) {
      showToast('Property location is required', 'error');
      return;
    }
    
    if (!listing.type?.trim()) {
      showToast('Property type is required', 'error');
      return;
    }
    
    // Validate at least one image URL
    const images = getInitializedImages();
    const validImages = images.filter(img => img && img.trim() && validateImageUrl(img));
    
    if (validImages.length === 0) {
      showToast('At least one valid image URL is required', 'error');
      return;
    }
    
    // Check for invalid image URLs
    const invalidImages = images.filter(img => img && img.trim() && !validateImageUrl(img));
    if (invalidImages.length > 0) {
      showToast('Please fix invalid image URLs before submitting', 'error');
      return;
    }
    
    try {
      await onSubmit(e);
      // Success/error toasts should be handled by parent component
      // since it knows the actual result of the API call
    } catch (error) {
      console.error('Form submission error:', error);
      // Only show toast if parent doesn't handle it
      if (!showExternalToast) {
        showToast(
          mode === 'edit' 
            ? 'Failed to update property. Please try again.' 
            : 'Failed to create listing. Please try again.', 
          'error'
        );
      }
    }
  };
  // Initialize images array if it doesn't exist (safe version to prevent setState during render)
  const initializeImages = () => {
    if (!listing.images || !Array.isArray(listing.images)) {
      // If there's an old single image field, migrate it
      const initialImages = listing.image ? [listing.image] : [''];
      return initialImages;
    }
    return listing.images;
  };

  // Handle images initialization without causing re-render
  const getInitializedImages = () => {
    const images = initializeImages();
    
    // Only update if we actually need to migrate from old format
    if (!listing.images || !Array.isArray(listing.images)) {
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        onListingChange({
          ...listing, 
          images: images,
          // Remove old single image field
          image: undefined
        });
      }, 0);
    }
    
    return images;
  };

  // Professional multiple image management functions
  const updateImageUrl = (index, value) => {
    const currentImages = getInitializedImages();
    const updatedImages = [...currentImages];
    updatedImages[index] = value;
    onListingChange({...listing, images: updatedImages});
    
    // Provide immediate feedback for image URL validation
    if (value && value.trim() && !validateImageUrl(value)) {
      showToast('Please enter a valid image URL (jpg, jpeg, png, gif, webp, bmp, svg)', 'warning');
    }
  };

  const addImageField = () => {
    const currentImages = getInitializedImages();
    if (currentImages.length < 4) {
      const updatedImages = [...currentImages, ''];
      onListingChange({...listing, images: updatedImages});
      showToast(`Image field ${currentImages.length + 1} added`, 'info');
    } else {
      showToast('Maximum 4 images allowed', 'warning');
    }
  };

  const removeImageField = (index) => {
    const currentImages = getInitializedImages();
    if (currentImages.length > 1) {
      const updatedImages = currentImages.filter((_, i) => i !== index);
      onListingChange({...listing, images: updatedImages});
      showToast(`Image ${index + 1} removed`, 'info');
    } else {
      showToast('At least one image field is required', 'warning');
    }
  };

  const validateImageUrl = (url) => {
    if (!url || url.trim() === '') return true; // Empty is valid (optional)
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
    } catch {
      return false;
    }
  };

  const getImageFieldError = (url, index) => {
    if (!url || url.trim() === '') {
      return index === 0 ? 'At least one image URL is required' : '';
    }
    if (!validateImageUrl(url)) {
      return 'Please enter a valid image URL';
    }
    return '';
  };
  // Smart price formatting functions
  const formatPrice = (value) => {
    if (!value) return '';
    
    // Remove all non-numeric characters except decimal point
    const numericValue = value.toString().replace(/[^\d.]/g, '');
    
    // If empty after cleaning, return empty
    if (!numericValue || numericValue === '.') return '';
    
    // Handle decimal places
    const parts = numericValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Add comma separators to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Combine with decimal part if exists
    if (decimalPart !== undefined) {
      // Pad decimal part to 2 digits if less than 2
      const paddedDecimal = decimalPart.padEnd(2, '0').slice(0, 2);
      return `${formattedInteger}.${paddedDecimal}`;
    }
    
    // Add .00 for whole numbers when formatting on blur
    return formattedInteger;
  };

  const handlePriceChange = (e) => {
    const inputValue = e.target.value;
    // Allow typing without immediate formatting for better UX
    onListingChange({...listing, price: inputValue});
  };

  const handlePriceBlur = (e) => {
    const inputValue = e.target.value;
    if (!inputValue || inputValue.trim() === '') return;
    
    // Format the price when user leaves the field
    const numericValue = inputValue.replace(/[^\d.]/g, '');
    if (numericValue && !isNaN(parseFloat(numericValue))) {
      const parsedValue = parseFloat(numericValue);
      // Add .00 for whole numbers
      const formattedValue = parsedValue % 1 === 0 ? 
        formatPrice(numericValue) + '.00' : 
        formatPrice(numericValue);
      onListingChange({...listing, price: formattedValue});
      
      // Show success feedback for valid price formatting
      if (parsedValue >= 1000) {
        showToast('Price formatted successfully', 'success');
      } else {
        showToast('Price seems unusually low. Please verify.', 'warning');
      }
    } else {
      showToast('Please enter a valid price amount', 'error');
    }
  };

  // Validate and format price for better UX
  const validatePriceInput = (e) => {
    const key = e.key;
    const currentValue = e.target.value;
    
    // Allow backspace, delete, tab, escape, enter, decimal point
    if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (key === 'a' && e.ctrlKey === true) ||
        (key === 'c' && e.ctrlKey === true) ||
        (key === 'v' && e.ctrlKey === true) ||
        (key === 'x' && e.ctrlKey === true)) {
      return;
    }
    
    // Ensure that it is a number or decimal point and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190) {
      e.preventDefault();
    }
    
    // Limit decimal places to 2
    if (currentValue.includes('.') && key === '.') {
      e.preventDefault();
    }
    
    if (currentValue.includes('.')) {
      const decimalPart = currentValue.split('.')[1];
      if (decimalPart && decimalPart.length >= 2 && e.keyCode >= 48 && e.keyCode <= 57) {
        e.preventDefault();
      }
    }
  };

  // Property type options - centralized
  const PROPERTY_TYPES = [
    { value: '', label: 'Select property type' },
    { value: 'House', label: 'House' },
    { value: 'Townhouse', label: 'Townhouse' },
    { value: 'Condo', label: 'Condo' },
    { value: 'Lot', label: 'Lot' }
  ];

  // Common input classes - centralized styling
  const INPUT_CLASSES = "input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary";
  const LABEL_CLASSES = "label-text font-medium";

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Input */}
      <div className="form-control w-full">
        <label className="label">
          <span className={LABEL_CLASSES}>Title</span>
        </label>
        <input
          type="text"
          className={INPUT_CLASSES}
          value={listing.title}
          onChange={e => onListingChange({...listing, title: e.target.value})}
          placeholder="Enter property title"
          required
        />
      </div>

      {/* Price Input */}
      <div className="form-control w-full">
        <label className="label">
          <span className={LABEL_CLASSES}>Price</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/70 font-medium">₱</span>
          <input
            type="text"
            className={`${INPUT_CLASSES} pl-7`}
            value={listing.price}
            onChange={handlePriceChange}
            onBlur={handlePriceBlur}
            onKeyDown={validatePriceInput}
            placeholder="Enter property price (e.g., 1000000)"
            required
          />
        </div>
      </div>

      {/* Location Input */}
      <div className="form-control w-full">
        <label className="label">
          <span className={LABEL_CLASSES}>Location</span>
        </label>
        <input
          type="text"
          className={INPUT_CLASSES}
          value={listing.location}
          onChange={e => onListingChange({...listing, location: e.target.value})}
          placeholder="Enter property location"
          required
        />
      </div>

      {/* Type Select */}
      <div className="form-control w-full">
        <label className="label">
          <span className={LABEL_CLASSES}>Property Type</span>
        </label>
        <select
          className="select select-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
          value={listing.type}
          onChange={e => onListingChange({...listing, type: e.target.value})}
          required
        >
          {PROPERTY_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Bedrooms and Bathrooms */}
      <div className="grid grid-cols-2 gap-6">
        <div className="form-control w-full">
          <label className="label">
            <span className={LABEL_CLASSES}>Bedrooms</span>
          </label>
          <input
            type="number"
            className={INPUT_CLASSES}
            value={listing.bedrooms}
            onChange={e => onListingChange({...listing, bedrooms: e.target.value})}
            placeholder="0"
            required
          />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className={LABEL_CLASSES}>Bathrooms</span>
          </label>
          <input
            type="number"
            className={INPUT_CLASSES}
            value={listing.bathrooms}
            onChange={e => onListingChange({...listing, bathrooms: e.target.value})}
            placeholder="0"
            required
          />
        </div>
      </div>

      {/* Floor Area and Lot Area */}
      <div className="grid grid-cols-2 gap-6">
        <div className="form-control w-full">
          <label className="label">
            <span className={LABEL_CLASSES}>Floor Area</span>
          </label>
          <input
            type="text"
            className={INPUT_CLASSES}
            placeholder="e.g. 120 sqm"
            value={listing.floorArea}
            onChange={e => onListingChange({...listing, floorArea: e.target.value})}
          />
        </div>
        <div className="form-control w-full">
          <label className="label">
            <span className={LABEL_CLASSES}>Lot Area</span>
          </label>
          <input
            type="text"
            className={INPUT_CLASSES}
            placeholder="e.g. 100 sqm"
            value={listing.lotArea}
            onChange={e => onListingChange({...listing, lotArea: e.target.value})}
          />
        </div>
      </div>

      {/* Description (for add mode only) */}
      {mode === 'add' && (
        <div className="form-control w-full">
          <label className="label">
            <span className={LABEL_CLASSES}>Description (Optional)</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
            placeholder="Describe the property features, amenities, etc."
            value={listing.description}
            onChange={e => onListingChange({...listing, description: e.target.value})}
            rows="3"
          />
        </div>
      )}

      {/* Professional Multiple Image URLs (for add and edit modes) */}
      <div className="form-control w-full">
        <label className="label">
          <span className={LABEL_CLASSES}>Property Images (1-4 images)</span>
          <span className="label-text-alt text-primary font-medium">
            {getInitializedImages().filter(img => img && img.trim()).length}/4 images
          </span>
        </label>
          
          <div className="space-y-3">
            {getInitializedImages().map((imageUrl, index) => {
              const error = getImageFieldError(imageUrl, index);
              const isFirstImage = index === 0;
              
              return (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-base-content/70">
                        Image {index + 1}
                        {isFirstImage && <span className="text-primary ml-1">(Required)</span>}
                      </span>
                      {imageUrl && validateImageUrl(imageUrl) && (
                        <div className="badge badge-success badge-xs">Valid</div>
                      )}
                      {imageUrl && !validateImageUrl(imageUrl) && (
                        <div className="badge badge-error badge-xs">Invalid</div>
                      )}
                    </div>
                    
                    <input
                      type="url"
                      className={`${INPUT_CLASSES} ${error ? 'border-error focus:border-error' : ''}`}
                      placeholder={isFirstImage ? "https://example.com/main-image.jpg (Required)" : "https://example.com/additional-image.jpg"}
                      value={imageUrl}
                      onChange={e => updateImageUrl(index, e.target.value)}
                    />
                    
                    {error && (
                      <label className="label">
                        <span className="label-text-alt text-error">{error}</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Remove button (disabled for first image if it's the only one) */}
                  <button
                    type="button"
                    className={`btn btn-square btn-sm mt-6 ${
                      getInitializedImages().length === 1 ? 
                      'btn-disabled opacity-30' : 
                      'btn-error btn-outline hover:btn-error'
                    }`}
                    onClick={() => removeImageField(index)}
                    disabled={getInitializedImages().length === 1}
                    title={getInitializedImages().length === 1 ? "At least one image is required" : `Remove image ${index + 1}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
          
          {/* Add more images button */}
          {getInitializedImages().length < 4 && (
            <button
              type="button"
              className="btn btn-outline btn-primary btn-sm mt-3 self-start"
              onClick={addImageField}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Image URL ({getInitializedImages().length}/4)
            </button>
          )}
          
          <div className="alert alert-info mt-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div className="text-sm">
              <div className="font-medium">Image Requirements:</div>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                <li>At least 1 image is required (first image will be the main display)</li>
                <li>Maximum 4 images allowed</li>
                <li>Must be direct image URLs (jpg, jpeg, png, gif, webp, bmp, svg)</li>
                <li>Images should be high-quality and showcase the property well</li>
              </ul>
            </div>
          </div>
        </div>

      {/* Maps Embed URL */}
      <div className="form-control w-full">
        <label className="label">
          <div className="flex items-center gap-2">
            <span className={LABEL_CLASSES}>Maps Embed URL</span>
            <div className="tooltip tooltip-right" data-tip="Google Maps embed URL for property location (from Google Maps > Share > Embed)">
              <div className="btn btn-circle btn-xs btn-ghost text-base-content/50 hover:text-base-content/80">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </label>
        <input
          type="url"
          className={INPUT_CLASSES}
          placeholder="https://www.google.com/maps/embed?pb=..."
          value={listing.maps_embed_url || ""}
          onChange={e => onListingChange({...listing, maps_embed_url: e.target.value})}
        />
      </div>

      {/* Action Buttons */}
      <div className="modal-action pt-4">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <RiLoader4Line className="w-4 h-4 animate-spin mr-2" />
              {mode === 'edit' ? 'Updating...' : 'Adding Listing...'}
            </>
          ) : (
            mode === 'edit' ? 'Save Changes' : 'Add Listing'
          )}
        </button>
        <button 
          type="button" 
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
      </div>
    </form>

    {/* Toast Notifications */}
    <Toast
      show={toast.show}
      message={toast.message}
      type={toast.type}
      onClose={hideToast}
      position="top-right"
      duration={4000}
    />
  </>
  );
};

// Export toast-enabled ListingForm with exposed toast functions
export const ListingFormWithToast = (props) => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return (
    <>
      <ListingForm {...props} showExternalToast={showToast} />
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        position="top-right"
        duration={4000}
      />
    </>
  );
};

export default ListingForm;
