// Initialize transfer tax rates in Firestore
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/Firebase.js';

export const initializeTransferTaxRates = async () => {
  try {
    const transferTaxRates = {
      // Major cities in the Philippines with their transfer tax rates
      cabanatuan: 0.005,  // 0.5% - Nueva Ecija
      manila: 0.0075,     // 0.75% - Manila City
      quezon: 0.006,      // 0.6% - Quezon City
      makati: 0.0075,     // 0.75% - Makati City
      taguig: 0.007,      // 0.7% - Taguig City
      pasig: 0.006,       // 0.6% - Pasig City
      marikina: 0.005,    // 0.5% - Marikina City
      paranaque: 0.0075,  // 0.75% - Parañaque City
      muntinlupa: 0.006,  // 0.6% - Muntinlupa City
      caloocan: 0.005,    // 0.5% - Caloocan City
      valenzuela: 0.005,  // 0.5% - Valenzuela City
      navotas: 0.005,     // 0.5% - Navotas City
      malabon: 0.005,     // 0.5% - Malabon City
      mandaluyong: 0.0065, // 0.65% - Mandaluyong City
      pasay: 0.007,       // 0.7% - Pasay City
      // Add more cities as needed
      default: 0.005      // Default rate 0.5%
    };

    await setDoc(doc(db, 'transferTaxRates', 'cities'), transferTaxRates);
    
    console.log('✅ Transfer tax rates initialized successfully!');
    console.log('📊 Rates added for', Object.keys(transferTaxRates).length, 'cities');
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing transfer tax rates:', error);
    return false;
  }
};

// Run initialization if called directly
if (typeof window === 'undefined') {
  initializeTransferTaxRates()
    .then(() => console.log('Initialization complete'))
    .catch((error) => console.error('Initialization failed:', error));
}
