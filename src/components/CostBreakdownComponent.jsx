import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/Firebase';
import { 
  RiMoneyDollarCircleLine,
  RiCalculatorLine
} from 'react-icons/ri';

function CostBreakdownComponent({ selectedProperty, isOpen }) {
  const [transferTaxRates, setTransferTaxRates] = useState({});

  // Function to fetch transfer tax rates from Firestore
  const fetchTransferTaxRates = useCallback(async () => {
    if (Object.keys(transferTaxRates).length > 0) return; // Already loaded
    
    try {
      const taxRatesRef = doc(db, 'transferTaxRates', 'cities');
      const taxRatesSnap = await getDoc(taxRatesRef);
      
      if (taxRatesSnap.exists()) {
        setTransferTaxRates(taxRatesSnap.data());
      } else {
        // Create default rates if document doesn't exist
        const defaultRates = {
          cabanatuan: 0.005,  // 0.5%
          manila: 0.0075,     // 0.75%
          quezon: 0.006,      // 0.6%
          makati: 0.0075,     // 0.75%
          taguig: 0.007,      // 0.7%
          pasig: 0.006,       // 0.6%
          marikina: 0.005,    // 0.5%
          paranaque: 0.0075,  // 0.75%
          muntinlupa: 0.006,  // 0.6%
          caloocan: 0.005,    // 0.5%
          default: 0.005      // Default rate
        };
        
        // Initialize the document in Firestore
        await setDoc(taxRatesRef, defaultRates);
        setTransferTaxRates(defaultRates);
        console.log('✅ Transfer tax rates initialized in Firestore');
      }
    } catch (error) {
      console.error('Error fetching transfer tax rates:', error);
      // Use default rates on error
      const fallbackRates = {
        cabanatuan: 0.005,
        manila: 0.0075,
        quezon: 0.006,
        makati: 0.0075,
        taguig: 0.007,
        default: 0.005
      };
      setTransferTaxRates(fallbackRates);
    }
  }, [transferTaxRates]);

  // Function to get transfer tax rate based on location
  const getTransferTaxRate = useCallback((location) => {
    if (!location) return 0.005; // Default 0.5%
    
    const locationLower = location.toLowerCase();
    const cityName = Object.keys(transferTaxRates).find(city => 
      locationLower.includes(city) || city.includes(locationLower)
    );
    
    return transferTaxRates[cityName] || 0.005; // Default 0.5% if city not found
  }, [transferTaxRates]);

  // Function to calculate cost breakdown
  const calculateCostBreakdown = useCallback((property) => {
    if (!property?.price) return null;
    
    const sellingPrice = parseInt(property.price.replace(/[₱,\s]/g, '')) || 0;
    const transferTaxRate = getTransferTaxRate(property.location);
    
    // Calculate individual costs
    const transferTax = Math.round(sellingPrice * transferTaxRate);
    const registrationFee = Math.round(sellingPrice * 0.0025); // 0.25%
    const documentaryStampTax = Math.round(sellingPrice * 0.015); // 1.5%
    const notarialFee = Math.max(Math.round(sellingPrice * 0.01), 5000); // 1% or min ₱5,000
    const processingFee = 10000; // Fixed ₱10,000
    
    const totalAdditionalCosts = transferTax + registrationFee + documentaryStampTax + notarialFee + processingFee;
    const totalCost = sellingPrice + totalAdditionalCosts;
    
    return {
      sellingPrice,
      transferTax,
      transferTaxRate: transferTaxRate * 100, // Convert to percentage for display
      registrationFee,
      documentaryStampTax,
      notarialFee,
      processingFee,
      totalAdditionalCosts,
      totalCost,
      cityFound: Object.keys(transferTaxRates).find(city => 
        property.location?.toLowerCase().includes(city)
      ) || 'default'
    };
  }, [getTransferTaxRate, transferTaxRates]);

  // Function to format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Fetch tax rates when component opens
  useEffect(() => {
    if (isOpen && selectedProperty) {
      fetchTransferTaxRates();
    }
  }, [isOpen, selectedProperty, fetchTransferTaxRates]);

  if (!selectedProperty) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold flex items-center gap-2 text-base-content">
          <RiMoneyDollarCircleLine className="text-success w-4 h-4" />
          Full Cost Details
        </h4>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-base-200/50 to-base-300/50 p-4 rounded-lg border border-base-300">
              {(() => {
                const costData = calculateCostBreakdown(selectedProperty);
                if (!costData) return (
                  <div className="text-center text-base-content/60 text-sm py-4">
                    Unable to calculate costs
                  </div>
                );

                return (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="text-center border-b border-base-300 pb-3">
                      <h5 className="text-base font-bold text-base-content">
                        Complete Cost Breakdown
                      </h5>
                      <p className="text-xs text-base-content/70 mt-1">
                        <span className="font-semibold text-primary">{selectedProperty.location}</span>
                        {costData.cityFound !== 'default' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
                            {costData.cityFound} rate applied
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Base Price */}
                    <div className="bg-base-100 p-3 rounded-lg border-l-4 border-primary">
                      <div className="flex justify-between items-center">
                        <div>
                          <h6 className="text-sm font-semibold text-base-content">Property Selling Price</h6>
                          <p className="text-xs text-base-content/70">Base price of the property</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-primary">{formatCurrency(costData.sellingPrice)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Costs */}
                    <div className="space-y-3">
                      <h6 className="text-sm font-semibold text-base-content flex items-center gap-2">
                        <RiCalculatorLine className="text-warning w-4 h-4" />
                        Additional Costs Breakdown
                      </h6>

                      {/* Transfer Tax */}
                      <div className="bg-base-100 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h7 className="text-sm font-semibold text-base-content">Transfer Tax</h7>
                            <p className="text-xs text-base-content/70">
                              Paid to Local Government ({costData.transferTaxRate.toFixed(2)}% rate)
                            </p>
                          </div>
                          <p className="text-sm font-bold text-warning">
                            {formatCurrency(costData.transferTax)}
                          </p>
                        </div>
                      </div>

                      {/* Registration Fee */}
                      <div className="bg-base-100 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h7 className="text-sm font-semibold text-base-content">Registration Fee</h7>
                            <p className="text-xs text-base-content/70">Paid to Registry of Deeds (0.25% rate)</p>
                          </div>
                          <p className="text-sm font-bold text-info">
                            {formatCurrency(costData.registrationFee)}
                          </p>
                        </div>
                      </div>

                      {/* Documentary Stamp Tax */}
                      <div className="bg-base-100 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h7 className="text-sm font-semibold text-base-content">Documentary Stamp Tax (DST)</h7>
                            <p className="text-xs text-base-content/70">Paid to Bureau of Internal Revenue (1.5% rate)</p>
                          </div>
                          <p className="text-sm font-bold text-secondary">
                            {formatCurrency(costData.documentaryStampTax)}
                          </p>
                        </div>
                      </div>

                      {/* Notarial Fee */}
                      <div className="bg-base-100 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h7 className="text-sm font-semibold text-base-content">Notarial Fee</h7>
                            <p className="text-xs text-base-content/70">Paid to Notary Public (1% or minimum ₱5,000)</p>
                          </div>
                          <p className="text-sm font-bold text-accent">
                            {formatCurrency(costData.notarialFee)}
                          </p>
                        </div>
                      </div>

                      {/* Processing Fee */}
                      <div className="bg-base-100 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h7 className="text-sm font-semibold text-base-content">Processing Fee</h7>
                            <p className="text-xs text-base-content/70">Paid to broker/agency for paperwork</p>
                          </div>
                          <p className="text-sm font-bold text-neutral">
                            {formatCurrency(costData.processingFee)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Total Summary */}
                    <div className="border-t border-base-300 pt-3 space-y-3">
                      <div className="bg-warning/10 p-3 rounded-lg border border-warning/30">
                        <div className="flex justify-between items-center mb-1">
                          <h6 className="text-sm font-semibold text-warning">Total Additional Costs</h6>
                          <p className="text-base font-bold text-warning">
                            {formatCurrency(costData.totalAdditionalCosts)}
                          </p>
                        </div>
                        <div className="text-xs text-base-content/70">
                          Transfer Tax + Registration + DST + Notarial + Processing
                        </div>
                      </div>

                      <div className="bg-success/10 p-4 rounded-lg border-2 border-success/30">
                        <div className="text-center">
                          <h6 className="text-base font-bold text-success mb-1">
                            🏠 TOTAL PAYMENT REQUIRED
                          </h6>
                          <p className="text-xl font-extrabold text-success mb-2">
                            {formatCurrency(costData.totalCost)}
                          </p>
                          <div className="text-xs text-base-content/70 space-y-0.5">
                            <p>Property Price: {formatCurrency(costData.sellingPrice)}</p>
                            <p>Additional Costs: {formatCurrency(costData.totalAdditionalCosts)}</p>
                            <p className="font-semibold">Percentage of Additional Costs: {((costData.totalAdditionalCosts / costData.sellingPrice) * 100).toFixed(2)}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-base-200/50 p-3 rounded-lg border-l-4 border-warning">
                      <p className="text-xs text-base-content/70 italic">
                        <strong>Disclaimer:</strong> These calculations are estimates based on standard rates and may vary depending on specific circumstances, 
                        local government policies, and negotiated fees. Please consult with legal and real estate professionals for exact amounts.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CostBreakdownComponent;
