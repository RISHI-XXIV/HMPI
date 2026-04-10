/**
 * HMPI Calculator Module
 * Calculates Heavy Metal Pollution Index based on WHO standards
 */

// WHO/BIS maximum permissible limits for heavy metals in drinking water (mg/L)
const PERMISSIBLE_LIMITS = {
  lead: 0.01,        // Pb
  arsenic: 0.01,     // As
  mercury: 0.001,    // Hg
  cadmium: 0.003,    // Cd
  chromium: 0.05,    // Cr
  nickel: 0.02,      // Ni
  copper: 2.0,       // Cu
  zinc: 3.0,         // Zn
  iron: 0.3,         // Fe
  manganese: 0.1     // Mn
};

// Weight factors for different heavy metals (based on toxicity)
const WEIGHT_FACTORS = {
  lead: 10,
  arsenic: 10,
  mercury: 10,
  cadmium: 9,
  chromium: 8,
  nickel: 7,
  copper: 5,
  zinc: 3,
  iron: 2,
  manganese: 3
};

/**
 * Calculate Heavy Metal Pollution Index
 * @param {Object} metalConcentrations - Object containing metal concentrations in mg/L
 * @returns {Object} HMPI value and categorization
 */
function calculateHMPI(metalConcentrations) {
  let totalWeightedSum = 0;
  let totalWeight = 0;
  const individualIndices = {};
  const exceededLimits = [];

  // Calculate individual metal indices
  for (const [metal, concentration] of Object.entries(metalConcentrations)) {
    if (PERMISSIBLE_LIMITS[metal] !== undefined && concentration !== null) {
      const limit = PERMISSIBLE_LIMITS[metal];
      const weight = WEIGHT_FACTORS[metal] || 1;
      
      // Calculate individual index (Ci/Si)
      const individualIndex = concentration / limit;
      individualIndices[metal] = {
        concentration,
        limit,
        index: individualIndex,
        exceeded: individualIndex > 1
      };

      if (individualIndex > 1) {
        exceededLimits.push({
          metal,
          concentration,
          limit,
          exceedanceRatio: individualIndex
        });
      }

      // Add to weighted sum
      totalWeightedSum += weight * individualIndex;
      totalWeight += weight;
    }
  }

  // Calculate final HMPI
  const hmpi = totalWeight > 0 ? totalWeightedSum / totalWeight : 0;

  // Categorize based on HMPI value
  let category, riskLevel, recommendation;
  
  if (hmpi <= 1) {
    category = 'Safe';
    riskLevel = 'low';
    recommendation = 'Water is safe for drinking and domestic use.';
  } else if (hmpi <= 2) {
    category = 'Moderate';
    riskLevel = 'medium';
    recommendation = 'Water quality needs monitoring. Treatment recommended for drinking purposes.';
  } else if (hmpi <= 5) {
    category = 'High';
    riskLevel = 'high';
    recommendation = 'Water is contaminated. Treatment required before any use.';
  } else {
    category = 'Critical';
    riskLevel = 'critical';
    recommendation = 'Water is severely contaminated. Immediate action required. Not suitable for any use without extensive treatment.';
  }

  return {
    hmpi: parseFloat(hmpi.toFixed(3)),
    category,
    riskLevel,
    recommendation,
    individualIndices,
    exceededLimits,
    totalMetalsAnalyzed: Object.keys(individualIndices).length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate Water Quality Index (WQI) as supplementary metric
 */
function calculateWQI(metalConcentrations) {
  let sum = 0;
  let count = 0;

  for (const [metal, concentration] of Object.entries(metalConcentrations)) {
    if (PERMISSIBLE_LIMITS[metal] !== undefined && concentration !== null) {
      const qi = (concentration / PERMISSIBLE_LIMITS[metal]) * 100;
      sum += qi;
      count++;
    }
  }

  const wqi = count > 0 ? sum / count : 0;
  
  let quality;
  if (wqi < 50) quality = 'Excellent';
  else if (wqi < 100) quality = 'Good';
  else if (wqi < 200) quality = 'Poor';
  else if (wqi < 300) quality = 'Very Poor';
  else quality = 'Unsuitable';

  return {
    wqi: parseFloat(wqi.toFixed(2)),
    quality
  };
}

/**
 * Validate input data
 */
function validateInput(data) {
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Invalid input: must be an object containing metal concentrations');
  }
  
  for (const [metal, concentration] of Object.entries(data)) {
    if (typeof concentration !== 'number' || concentration < 0) {
      errors.push(`Invalid concentration for ${metal}: must be a non-negative number`);
    }
  }
  
  return errors;
}

/**
 * Main calculation function with validation
 */
function calculate(metalConcentrations) {
  // Validate input
  const errors = validateInput(metalConcentrations);
  if (errors.length > 0) {
    return {
      success: false,
      errors
    };
  }

  // Calculate HMPI
  const hmpiResult = calculateHMPI(metalConcentrations);
  
  // Calculate WQI as supplementary metric
  const wqiResult = calculateWQI(metalConcentrations);

  return {
    success: true,
    hmpi: hmpiResult,
    wqi: wqiResult,
    inputData: metalConcentrations,
    standards: {
      permissibleLimits: PERMISSIBLE_LIMITS,
      weightFactors: WEIGHT_FACTORS
    }
  };
}

module.exports = {
  calculate,
  calculateHMPI,
  calculateWQI,
  PERMISSIBLE_LIMITS,
  WEIGHT_FACTORS
};
