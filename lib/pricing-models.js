// Define sample pricing models for the demo
const pricingModels = [
  {
    id: 'per-unit',
    name: 'Per Unit',
    description: 'Fixed price per unit of usage',
    basePrice: 10,
    tiers: [
      { 
        id: 1, 
        name: 'All Units', 
        startQuantity: 0, 
        endQuantity: null,
        pricePerUnit: 0.01, 
        flatFee: 0 
      }
    ]
  },
  {
    id: 'tiered',
    name: 'Tiered',
    description: 'Different rates for different usage volumes',
    basePrice: 0,
    tiers: [
      { 
        id: 1, 
        name: 'Tier 1', 
        startQuantity: 0, 
        endQuantity: 1000,
        pricePerUnit: 0.02, 
        flatFee: 0 
      },
      { 
        id: 2, 
        name: 'Tier 2', 
        startQuantity: 1001, 
        endQuantity: 10000,
        pricePerUnit: 0.01, 
        flatFee: 0 
      },
      { 
        id: 3, 
        name: 'Tier 3', 
        startQuantity: 10001, 
        endQuantity: null,
        pricePerUnit: 0.005, 
        flatFee: 0 
      }
    ]
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    description: 'Base fee plus usage-based charges',
    basePrice: 49.99,
    tiers: [
      { 
        id: 1, 
        name: 'Included', 
        startQuantity: 0, 
        endQuantity: 5000,
        pricePerUnit: 0, 
        flatFee: 0 
      },
      { 
        id: 2, 
        name: 'Overage', 
        startQuantity: 5001, 
        endQuantity: null,
        pricePerUnit: 0.008, 
        flatFee: 0 
      }
    ]
  }
];

/**
 * Get all pricing models
 * @returns {Array} Array of pricing models
 */
function getPricingModels() {
  return pricingModels;
}

/**
 * Get a specific pricing model by ID
 * @param {string} id - The model ID
 * @returns {object|null} The pricing model or null if not found
 */
function getPricingModelById(id) {
  return pricingModels.find(model => model.id === id) || null;
}

/**
 * Calculate cost based on usage and pricing model
 * @param {object} model - The pricing model
 * @param {number} usage - The usage quantity
 * @returns {number} The calculated cost
 */
function calculateCost(model, usage) {
  let cost = model.basePrice;
  let remainingUsage = usage;
  
  // Apply pricing model calculation
  switch (model.id) {
    case 'per-unit':
      // Simple multiplication
      cost += remainingUsage * model.tiers[0].pricePerUnit;
      break;
      
    case 'tiered':
      // Different rates for different tiers
      for (const tier of model.tiers) {
        if (remainingUsage <= 0) break;
        
        const tierStart = tier.startQuantity;
        const tierEnd = tier.endQuantity !== null ? tier.endQuantity : Infinity;
        const tierSize = tierEnd - tierStart + 1;
        
        // How much usage fits in this tier
        const usageInTier = Math.min(remainingUsage, tierSize);
        
        // Calculate cost for this tier
        cost += usageInTier * tier.pricePerUnit + tier.flatFee;
        
        // Reduce remaining usage
        remainingUsage -= usageInTier;
      }
      break;
      
    case 'hybrid':
      // Base fee is already added, only calculate usage charges
      for (const tier of model.tiers) {
        if (remainingUsage <= 0) break;
        
        const tierStart = tier.startQuantity;
        const tierEnd = tier.endQuantity !== null ? tier.endQuantity : Infinity;
        const tierSize = tierEnd - tierStart + 1;
        
        // How much usage fits in this tier
        const usageInTier = Math.min(remainingUsage, tierSize);
        
        // Calculate cost for this tier
        cost += usageInTier * tier.pricePerUnit + tier.flatFee;
        
        // Reduce remaining usage
        remainingUsage -= usageInTier;
      }
      break;
  }
  
  return cost;
}

/**
 * Calculate usage breakdown by tier for a specific pricing model
 * @param {object} model - The pricing model
 * @param {number} usage - The usage quantity
 * @returns {Array} Array of tier breakdown objects
 */
function calculateTierBreakdown(model, usage) {
  let remainingUsage = usage;
  const breakdown = [];
  
  // Calculate breakdown based on model type
  switch (model.id) {
    case 'per-unit':
      breakdown.push({
        tier: model.tiers[0].name,
        quantity: usage,
        rate: model.tiers[0].pricePerUnit,
        cost: usage * model.tiers[0].pricePerUnit
      });
      break;
      
    case 'tiered':
    case 'hybrid':
      for (const tier of model.tiers) {
        if (remainingUsage <= 0) break;
        
        const tierStart = tier.startQuantity;
        const tierEnd = tier.endQuantity !== null ? tier.endQuantity : Infinity;
        const tierSize = tierEnd - tierStart;
        
        const usageInTier = Math.max(0, Math.min(remainingUsage - tierStart, tierSize));
        
        if (usageInTier <= 0) continue;
        
        breakdown.push({
          tier: tier.name,
          quantity: usageInTier,
          rate: tier.pricePerUnit,
          cost: usageInTier * tier.pricePerUnit + tier.flatFee
        });
        
        remainingUsage -= usageInTier;
      }
      break;
  }
  
  return breakdown;
}

module.exports = {
  getPricingModels,
  getPricingModelById,
  calculateCost,
  calculateTierBreakdown
};