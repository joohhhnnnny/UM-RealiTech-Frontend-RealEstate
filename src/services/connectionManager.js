/**
 * Connection Manager for Firebase operations
 * Prevents multiple concurrent requests and manages connection state
 */

class ConnectionManager {
  constructor() {
    this.activeRequests = new Map();
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.listeners = new Map();
  }

  // Generate a unique key for caching
  generateKey(collection, params) {
    return `${collection}_${JSON.stringify(params)}`;
  }

  // Check if data is cached and still valid
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Cache data with timestamp
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Prevent duplicate requests
  async executeRequest(key, requestFn) {
    // Check cache first
    const cachedData = this.getCachedData(key);
    if (cachedData) {
      console.log(`Using cached data for: ${key}`);
      return cachedData;
    }

    // Check if request is already in progress
    if (this.activeRequests.has(key)) {
      console.log(`Request already in progress for: ${key}, waiting...`);
      return await this.activeRequests.get(key);
    }

    // Execute the request
    const requestPromise = requestFn()
      .then(result => {
        this.setCachedData(key, result);
        return result;
      })
      .catch(error => {
        console.error(`Request failed for: ${key}`, error);
        throw error;
      })
      .finally(() => {
        this.activeRequests.delete(key);
      });

    this.activeRequests.set(key, requestPromise);
    return await requestPromise;
  }

  // Manage real-time listeners to prevent duplicates
  addListener(key, unsubscribe) {
    // Remove existing listener if any
    this.removeListener(key);
    this.listeners.set(key, unsubscribe);
  }

  removeListener(key) {
    const existing = this.listeners.get(key);
    if (existing) {
      try {
        existing();
      } catch (error) {
        console.warn(`Error removing listener for: ${key}`, error);
      }
      this.listeners.delete(key);
    }
  }

  // Clean up all listeners
  cleanup() {
    this.listeners.forEach((unsubscribe, key) => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn(`Error cleaning up listener for: ${key}`, error);
      }
    });
    this.listeners.clear();
    this.activeRequests.clear();
    this.cache.clear();
  }

  // Clear cache for specific pattern
  clearCache(pattern) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
}

// Create singleton instance
export const connectionManager = new ConnectionManager();

// Hook for React components
export const useConnectionManager = () => {
  return connectionManager;
};
