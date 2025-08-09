// Property-related constants for the application

export const PROPERTY_TYPES = [
  { value: '', label: 'Select property type' },
  { value: 'House', label: 'House' },
  { value: 'Townhouse', label: 'Townhouse' },
  { value: 'Condo', label: 'Condo' },
  { value: 'Lot', label: 'Lot' }
];

export const PROPERTY_STATUS = [
  { value: 'Available', label: 'Available', color: 'badge-success' },
  { value: 'Under Negotiation', label: 'Under Negotiation', color: 'badge-warning' },
  { value: 'Sold', label: 'Sold', color: 'badge-error' },
  { value: 'Reserved', label: 'Reserved', color: 'badge-info' }
];

export const DEFAULT_PROPERTY_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9";

export const FORM_STYLES = {
  INPUT: "input input-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary",
  LABEL: "label-text font-medium",
  SELECT: "select select-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary",
  TEXTAREA: "textarea textarea-bordered w-full mt-1 bg-base-100 text-base-content border-base-300 focus:border-primary"
};

export const INITIAL_LISTING_STATE = {
  title: "",
  price: "",
  location: "",
  type: "",
  bedrooms: "",
  bathrooms: "",
  floorArea: "",
  lotArea: "",
  image: "",
  imageFile: null,
  description: "",
  maps_embed_url: ""
};

// Debug mode flag - set to false for production
export const DEBUG_MODE = import.meta.env?.MODE === 'development' || false;

// Logging utility
export const debugLog = (...args) => {
  if (DEBUG_MODE) {
    console.log(...args);
  }
};
