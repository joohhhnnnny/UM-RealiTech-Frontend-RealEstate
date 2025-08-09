import React from 'react';
import { RiLoader4Line } from 'react-icons/ri';

const ListingForm = ({ 
  listing, 
  onListingChange, 
  onSubmit, 
  onCancel, 
  submitting, 
  mode = 'add' // 'add' or 'edit'
}) => {
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
    <form onSubmit={onSubmit} className="space-y-6">
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

      {/* Image URL (for add mode only) */}
      {mode === 'add' && (
        <div className="form-control w-full">
          <label className="label">
            <span className={LABEL_CLASSES}>Property Image URL (Optional)</span>
          </label>
          <input
            type="url"
            className={INPUT_CLASSES}
            placeholder="https://example.com/image.jpg"
            value={listing.image}
            onChange={e => onListingChange({...listing, image: e.target.value})}
          />
          <label className="label">
            <span className="label-text-alt text-base-content/70">Provide a direct URL to the property image</span>
          </label>
        </div>
      )}

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
  );
};

export default ListingForm;
