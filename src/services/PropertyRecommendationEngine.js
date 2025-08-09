/**
 * Professional Real Estate Recommendation Engine
 * Multi-Criteria Decision Analysis (MCDA) + Content-Based Filtering
 * Optimized for Filipino Real Estate Market
 */

export class PropertyRecommendationEngine {
  constructor() {
    // Buyer-type specific weights (must sum to 1.0)
    this.buyerTypeWeights = {
      'First Time Buyer': {
        affordability: 0.40,    // High weight on affordability
        location: 0.25,         // Safety and convenience priority
        budget: 0.20,           // Budget alignment important
        buyerType: 0.10,        // Property type match
        amenities: 0.05         // Basic amenities
      },
      'OFW': {
        investment: 0.35,       // ROI and rental potential
        affordability: 0.25,    // Financial stability
        location: 0.20,         // Strategic locations
        liquidity: 0.15,        // Easy to sell/rent
        buyerType: 0.05         // Property type flexibility
      },
      'Investor': {
        investment: 0.50,       // Primary focus on ROI
        location: 0.20,         // Market appreciation areas
        affordability: 0.15,    // Cash flow considerations
        liquidity: 0.10,        // Exit strategy
        buyerType: 0.05         // Property type flexibility
      },
      'Upgrader': {
        location: 0.30,         // Premium locations priority
        affordability: 0.25,    // Financial capability
        amenities: 0.20,        // Luxury features important
        buyerType: 0.15,        // Specific property types
        budget: 0.10            // Higher budget tolerance
      }
    };

    // Filipino market-specific criteria
    this.locationPriorities = {
      'Metro Manila': { premium: 1.0, growth: 0.9, liquidity: 1.0 },
      'Makati': { premium: 1.0, growth: 0.8, liquidity: 1.0 },
      'BGC': { premium: 1.0, growth: 1.0, liquidity: 1.0 },
      'Quezon City': { premium: 0.8, growth: 0.9, liquidity: 0.9 },
      'Pasig': { premium: 0.8, growth: 1.0, liquidity: 0.9 },
      'Cebu': { premium: 0.7, growth: 0.9, liquidity: 0.8 },
      'Davao': { premium: 0.6, growth: 0.8, liquidity: 0.7 }
    };

    // Financial calculation constants
    this.financialConstants = {
      downPaymentRate: 0.20,      // 20% down payment
      interestRate: 0.065,        // 6.5% annual interest
      loanTermYears: 15,          // 15-year loan term
      maxHousingRatio: 0.30,      // 30% of income for housing
      maxTotalDebtRatio: 0.40     // 40% total debt ratio
    };
  }

  /**
   * Main recommendation scoring function
   * @param {Object} property - Property data
   * @param {Object} userProfile - User profile data
   * @returns {Object} - Scored property with explanation
   */
  calculateRecommendationScore(property, userProfile) {
    if (!userProfile || !property) {
      return { ...property, matchScore: 0, matchFactors: [], explanation: 'Incomplete data' };
    }

    const weights = this.buyerTypeWeights[userProfile.buyerType] || this.buyerTypeWeights['First Time Buyer'];
    const scores = {};
    const explanations = [];
    const matchFactors = [];

    // 1. Affordability Analysis (0-1 normalized)
    const affordabilityResult = this.calculateAffordabilityScore(property, userProfile);
    scores.affordability = affordabilityResult.score;
    explanations.push(affordabilityResult.explanation);
    matchFactors.push(...affordabilityResult.factors);

    // 2. Budget Alignment (0-1 normalized)
    const budgetResult = this.calculateBudgetScore(property, userProfile);
    scores.budget = budgetResult.score;
    explanations.push(budgetResult.explanation);
    matchFactors.push(...budgetResult.factors);

    // 3. Location Match (0-1 normalized)
    const locationResult = this.calculateLocationScore(property, userProfile);
    scores.location = locationResult.score;
    explanations.push(locationResult.explanation);
    matchFactors.push(...locationResult.factors);

    // 4. Buyer Type Compatibility (0-1 normalized)
    const buyerTypeResult = this.calculateBuyerTypeScore(property, userProfile);
    scores.buyerType = buyerTypeResult.score;
    explanations.push(buyerTypeResult.explanation);
    matchFactors.push(...buyerTypeResult.factors);

    // 5. Investment Potential (0-1 normalized) - for relevant buyer types
    const investmentResult = this.calculateInvestmentScore(property, userProfile);
    scores.investment = investmentResult.score;
    if (investmentResult.explanation) explanations.push(investmentResult.explanation);
    matchFactors.push(...investmentResult.factors);

    // 6. Amenities & Features (0-1 normalized)
    const amenitiesResult = this.calculateAmenitiesScore(property, userProfile);
    scores.amenities = amenitiesResult.score;
    explanations.push(amenitiesResult.explanation);
    matchFactors.push(...amenitiesResult.factors);

    // 7. Liquidity Score (0-1 normalized) - for investors/OFWs
    const liquidityResult = this.calculateLiquidityScore(property, userProfile);
    scores.liquidity = liquidityResult.score;
    if (liquidityResult.explanation) explanations.push(liquidityResult.explanation);
    matchFactors.push(...liquidityResult.factors);

    // Calculate weighted final score
    let finalScore = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach(criterion => {
      if (scores[criterion] !== undefined) {
        finalScore += weights[criterion] * scores[criterion];
        totalWeight += weights[criterion];
      }
    });

    // Normalize final score to 0-100
    const normalizedScore = totalWeight > 0 ? (finalScore / totalWeight) * 100 : 0;

    return {
      ...property,
      matchScore: Math.round(normalizedScore),
      matchFactors: matchFactors.filter(factor => factor),
      detailedScores: scores,
      explanation: explanations.filter(exp => exp).join(' '),
      recommendationReason: this.generateRecommendationReason(userProfile.buyerType, scores, normalizedScore)
    };
  }

  /**
   * Calculate affordability score based on DTI ratio
   */
  calculateAffordabilityScore(property, profile) {
    const monthlyIncome = parseInt(profile.monthlyIncome) || 0;
    const monthlyDebts = parseInt(profile.monthlyDebts) || 0;
    const spouseIncome = profile.hasSpouseIncome ? monthlyIncome * 0.5 : 0;
    const totalIncome = monthlyIncome + spouseIncome;
    
    if (!totalIncome || !property.price) {
      return { score: 0, explanation: '', factors: [] };
    }

    const propertyPrice = parseInt(property.price.replace(/[₱,\s]/g, '')) || 0;
    const loanAmount = propertyPrice * (1 - this.financialConstants.downPaymentRate);
    const monthlyRate = this.financialConstants.interestRate / 12;
    const numberOfPayments = this.financialConstants.loanTermYears * 12;
    
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const housingRatio = monthlyPayment / totalIncome;
    const totalDebtRatio = (monthlyPayment + monthlyDebts) / totalIncome;

    let score = 0;
    let explanation = '';
    let factors = [];

    if (housingRatio <= 0.25 && totalDebtRatio <= 0.35) {
      score = 1.0; // Excellent
      explanation = 'Excellent affordability - well within safe financial ratios';
      factors.push('financial-excellent');
    } else if (housingRatio <= 0.30 && totalDebtRatio <= 0.40) {
      score = 0.8; // Good
      explanation = 'Good affordability - manageable monthly payments';
      factors.push('financial-good');
    } else if (housingRatio <= 0.35 && totalDebtRatio <= 0.45) {
      score = 0.6; // Fair
      explanation = 'Fair affordability - consider budget carefully';
      factors.push('financial-fair');
    } else if (housingRatio <= 0.40 && totalDebtRatio <= 0.50) {
      score = 0.3; // Tight
      explanation = 'Tight budget - may strain finances';
      factors.push('financial-tight');
    } else {
      score = 0.1; // Poor
      explanation = 'Challenging affordability - consider lower price range';
      factors.push('financial-stretch');
    }

    return { score, explanation, factors };
  }

  /**
   * Calculate budget alignment score
   */
  calculateBudgetScore(property, profile) {
    if (!profile.budgetRange || !property.price) {
      return { score: 0.5, explanation: 'Budget information incomplete', factors: [] };
    }

    const price = parseInt(property.price.replace(/[₱,\s]/g, '')) || 0;
    const budgetRanges = {
      '1M-3M': { min: 1000000, max: 3000000 },
      '3M-5M': { min: 3000000, max: 5000000 },
      '5M-10M': { min: 5000000, max: 10000000 },
      '10M+': { min: 10000000, max: Infinity }
    };

    const range = budgetRanges[profile.budgetRange];
    if (!range) return { score: 0, explanation: '', factors: [] };

    let score = 0;
    let explanation = '';
    let factors = [];

    if (price >= range.min && price <= range.max) {
      score = 1.0;
      explanation = 'Perfect budget match';
      factors.push('budget-perfect');
    } else if (price >= range.min * 0.8 && price <= range.max * 1.2) {
      score = 0.8;
      explanation = 'Close to budget range';
      factors.push('budget-close');
    } else if (price >= range.min * 0.6 && price <= range.max * 1.4) {
      score = 0.5;
      explanation = 'Somewhat outside budget range';
      factors.push('budget-some');
    } else {
      score = 0.2;
      explanation = 'Outside preferred budget range';
      factors.push('budget-far');
    }

    return { score, explanation, factors };
  }

  /**
   * Calculate location compatibility score
   */
  calculateLocationScore(property, profile) {
    if (!profile.preferredLocation || !property.location) {
      return { score: 0.3, explanation: 'Location preferences not specified', factors: [] };
    }

    const isLocationMatch = this.isLocationMatch(property.location, profile.preferredLocation);
    const locationPriority = this.getLocationPriority(property.location);

    let score = 0;
    let explanation = '';
    let factors = [];

    if (isLocationMatch) {
      score = 0.9 + (locationPriority.premium * 0.1); // 0.9-1.0 range
      explanation = 'Excellent location match in preferred area';
      factors.push('location-perfect');
    } else {
      // Check for nearby areas or similar tier
      score = locationPriority.premium * 0.4; // 0-0.4 range based on location quality
      explanation = 'Different location but good area potential';
      factors.push('location-alternative');
    }

    return { score, explanation, factors };
  }

  /**
   * Calculate buyer type compatibility
   */
  calculateBuyerTypeScore(property, profile) {
    let score = 0.5; // Default base score
    let explanation = '';
    let factors = [];

    switch (profile.buyerType) {
      case 'First Time Buyer': {
        const price = parseInt(property.price?.replace(/[₱,\s]/g, '')) || 0;
        if (price <= 3000000) {
          score = 1.0;
          explanation = 'Ideal starter property price range';
          factors.push('first-timer-perfect');
        } else if (price <= 5000000) {
          score = 0.7;
          explanation = 'Suitable for first-time buyer with good income';
          factors.push('first-timer-good');
        } else {
          score = 0.3;
          explanation = 'Higher-end property for first-time buyer';
          factors.push('first-timer-stretch');
        }
        break;
      }

      case 'OFW': {
        let ofwScore = 0.5;
        if (property.description?.toLowerCase().includes('ofw friendly') ||
            property.title?.toLowerCase().includes('ofw')) {
          ofwScore += 0.4;
          factors.push('ofw-friendly');
        }
        if (property.furnishing === 'Fully Furnished') {
          ofwScore += 0.3;
          factors.push('fully-furnished');
        } else if (property.furnishing === 'Semi Furnished') {
          ofwScore += 0.2;
          factors.push('semi-furnished');
        }
        score = Math.min(ofwScore, 1.0);
        explanation = 'OFW-suitable property features';
        break;
      }

      case 'Investor': {
        let investorScore = 0.4; // Base score for any property
        if (property.description?.toLowerCase().includes('investment') ||
            property.title?.toLowerCase().includes('investment')) {
          investorScore += 0.4;
          factors.push('investment-ready');
        }
        if (property.amenities?.some(a => a.toLowerCase().includes('rental') ||
                                         a.toLowerCase().includes('commercial'))) {
          investorScore += 0.2;
          factors.push('rental-potential');
        }
        score = Math.min(investorScore, 1.0);
        explanation = 'Investment potential property';
        break;
      }

      case 'Upgrader': {
        const price = parseInt(property.price?.replace(/[₱,\s]/g, '')) || 0;
        const amenityCount = property.amenities?.length || 0;
        
        if (price >= 5000000 && amenityCount >= 3) {
          score = 1.0;
          explanation = 'Premium upgrade property with excellent amenities';
          factors.push('upgrade-premium');
        } else if (price >= 3000000 && amenityCount >= 2) {
          score = 0.8;
          explanation = 'Good upgrade option';
          factors.push('upgrade-good');
        } else {
          score = 0.4;
          explanation = 'Basic upgrade option';
          factors.push('upgrade-basic');
        }
        break;
      }
    }

    return { score, explanation, factors };
  }

  /**
   * Calculate investment potential score
   */
  calculateInvestmentScore(property, profile) {
    if (!['OFW', 'Investor'].includes(profile.buyerType)) {
      return { score: 0.5, explanation: null, factors: [] }; // Not applicable
    }

    const location = property.location || '';
    const price = parseInt(property.price?.replace(/[₱,\s]/g, '')) || 0;
    const locationPriority = this.getLocationPriority(location);
    
    let score = locationPriority.growth * 0.6; // Base score from location growth potential
    let factors = [];

    // Add rental potential indicators
    if (property.amenities?.some(a => ['swimming pool', 'gym', 'parking', 'security'].includes(a.toLowerCase()))) {
      score += 0.2;
      factors.push('rental-amenities');
    }

    // Add liquidity factors
    score += locationPriority.liquidity * 0.2;
    factors.push('market-liquidity');

    return {
      score: Math.min(score, 1.0),
      explanation: 'Investment and rental potential analysis',
      factors
    };
  }

  /**
   * Calculate amenities score
   */
  calculateAmenitiesScore(property, profile) {
    const amenities = property.amenities || [];
    const amenityCount = amenities.length;
    
    let score = Math.min(amenityCount / 10, 1.0); // Normalize based on 10 amenities = perfect
    let factors = [];

    // Bonus for essential amenities
    const essentialAmenities = ['security', 'parking', 'swimming pool', 'gym'];
    const hasEssential = amenities.some(a => 
      essentialAmenities.some(essential => a.toLowerCase().includes(essential))
    );

    if (hasEssential) {
      score = Math.min(score + 0.2, 1.0);
      factors.push('essential-amenities');
    }

    return {
      score,
      explanation: `${amenityCount} amenities available`,
      factors
    };
  }

  /**
   * Calculate liquidity score
   */
  calculateLiquidityScore(property, profile) {
    if (!['OFW', 'Investor'].includes(profile.buyerType)) {
      return { score: 0.5, explanation: null, factors: [] };
    }

    const locationPriority = this.getLocationPriority(property.location);
    return {
      score: locationPriority.liquidity,
      explanation: 'Market liquidity and resale potential',
      factors: ['market-liquidity']
    };
  }

  /**
   * Helper function to check location match
   */
  isLocationMatch(propertyLocation, preferredLocation) {
    if (!propertyLocation || !preferredLocation) return false;
    
    const propertyLower = propertyLocation.toLowerCase();
    const preferredLower = preferredLocation.toLowerCase();
    
    return propertyLower.includes(preferredLower) || preferredLower.includes(propertyLower);
  }

  /**
   * Get location priority scores
   */
  getLocationPriority(location) {
    if (!location) return { premium: 0.3, growth: 0.3, liquidity: 0.3 };

    const locationLower = location.toLowerCase();
    
    for (const [area, scores] of Object.entries(this.locationPriorities)) {
      if (locationLower.includes(area.toLowerCase())) {
        return scores;
      }
    }

    // Default for unrecognized locations
    return { premium: 0.4, growth: 0.4, liquidity: 0.4 };
  }

  /**
   * Generate personalized recommendation reason
   */
  generateRecommendationReason(buyerType, scores, finalScore) {
    if (finalScore >= 80) {
      return `Excellent match for ${buyerType}s - strong alignment across all criteria`;
    } else if (finalScore >= 60) {
      return `Good match for ${buyerType}s - meets most important criteria`;
    } else if (finalScore >= 40) {
      return `Fair option for ${buyerType}s - has some matching features`;
    } else {
      return `Limited match for ${buyerType}s - consider other options`;
    }
  }
}

// Export singleton instance
export const propertyRecommendationEngine = new PropertyRecommendationEngine();
