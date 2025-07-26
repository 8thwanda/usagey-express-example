const express = require('express');
const { trackEvent, getUsageStats, getUsageEvents } = require('../lib/usagey-client');
const { getPricingModels, getPricingModelById, calculateCost, calculateTierBreakdown } = require('../lib/pricing-models');

const router = express.Router();

/**
 * Home page
 */
router.get('/', (req, res) => {
  // Check if API key is set
  const isApiKeySet = process.env.USAGEY_API_KEY && 
                      process.env.USAGEY_API_KEY !== 'your_api_key_here' && 
                      process.env.USE_MOCK_DATA !== 'true';
                      
  res.render('index', { 
    title: 'Usagey Express Example',
    isApiKeySet,
    useMockData: process.env.USE_MOCK_DATA === 'true'
  });
});

/**
 * Usage tracking demo page
 */
router.get('/usage-tracking', (req, res) => {
  res.render('usage-tracking', { 
    title: 'Usage Tracking | Usagey Express Example',
    eventTypes: ['api_call', 'data_processing', 'storage', 'compute', 'custom']
  });
});

/**
 * Usage dashboard demo page
 */
router.get('/usage-dashboard', async (req, res) => {
  try {
    // Fetch usage stats and events
    const [statsResponse, eventsResponse] = await Promise.all([
      getUsageStats(),
      getUsageEvents({ limit: 50 })
    ]);
    
    res.render('usage-dashboard', { 
      title: 'Usage Dashboard | Usagey Express Example',
      stats: statsResponse.usage || { 
        currentUsage: 0, 
        limit: 1000, 
        percentage: 0, 
        plan: 'Free' 
      },
      events: eventsResponse.data || [],
      error: null 
    });
  } catch (error) {
    console.error('Error fetching usage data:', error);
    res.render('usage-dashboard', { 
      title: 'Usage Dashboard | Usagey Express Example',
      stats: { currentUsage: 0, limit: 1000, percentage: 0, plan: 'Free' },
      events: [],
      error: error.message 
    });
  }
});

/**
 * Pricing models demo page
 */
router.get('/pricing-demo', (req, res) => {
  const pricingModels = getPricingModels();
  res.render('pricing-demo', { 
    title: 'Pricing Models | Usagey Express Example',
    pricingModels
  });
});

/**
 * Calculate and display billing
 */
router.post('/pricing-demo/calculate', async (req, res) => {
  try {
    const { modelId, usage } = req.body;
    
    // Parse usage as number
    const usageQuantity = parseInt(usage, 10) || 0;
    
    const model = getPricingModelById(modelId);
    
    if (!model) {
      throw new Error('Invalid pricing model');
    }
    
    const totalCost = calculateCost(model, usageQuantity);
    const tierBreakdown = calculateTierBreakdown(model, usageQuantity);
    
    // Track the calculation as a usage event
    try {
      await trackEvent('billing_calculation', usageQuantity, {
        pricingModel: modelId,
        calculatedCost: totalCost
      });
    } catch (trackError) {
      console.error('Error tracking calculation event:', trackError);
      // Continue anyway, as this is not critical
    }
    
    res.render('pricing-demo', { 
      title: 'Pricing Models | Usagey Express Example',
      pricingModels: getPricingModels(),
      selectedModel: model,
      usageQuantity,
      totalCost,
      tierBreakdown,
      success: 'Billing calculation completed'
    });
    
  } catch (error) {
    console.error('Error calculating billing:', error);
    res.render('pricing-demo', { 
      title: 'Pricing Models | Usagey Express Example',
      pricingModels: getPricingModels(),
      selectedModel: req.body.modelId ? getPricingModelById(req.body.modelId) : null,
      usageQuantity: parseInt(req.body.usage, 10) || 0,
      error: error.message
    });
  }
});

module.exports = router;