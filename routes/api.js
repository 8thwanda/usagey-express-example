const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { trackEvent, getUsageStats, getUsageEvents } = require('../lib/usagey-client');
const { getPricingModelById, calculateCost, calculateTierBreakdown } = require('../lib/pricing-models');

const router = express.Router();

/**
 * Track a usage event
 * 
 * POST /api/track
 * {
 *   "event_type": "api_call",
 *   "quantity": 1,
 *   "metadata": { "endpoint": "/users", "method": "GET" }
 * }
 */
router.post('/track', async (req, res, next) => {
  try {
    const { event_type, quantity = 1, metadata = {} } = req.body;
    
    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required' });
    }
    
    // Add request ID to metadata
    const requestMetadata = {
      ...metadata,
      request_id: uuidv4().slice(0, 8),
      timestamp: new Date().toISOString()
    };
    
    // Track the event
    const result = await trackEvent(event_type, quantity, requestMetadata);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get usage statistics
 * 
 * GET /api/stats
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getUsageStats();
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * Get recent usage events
 * 
 * GET /api/events
 * Query params:
 *   - event_type: Filter by event type
 *   - start_date: Filter by start date (ISO format)
 *   - end_date: Filter by end date (ISO format)
 *   - limit: Number of events to return (default: 50, max: 1000)
 */
router.get('/events', async (req, res, next) => {
  try {
    const { event_type, start_date, end_date, limit = 50 } = req.query;
    
    const options = {
      eventType: event_type,
      startDate: start_date,
      endDate: end_date,
      limit: Math.min(parseInt(limit) || 50, 1000)
    };
    
    const events = await getUsageEvents(options);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
});

/**
 * Calculate cost based on pricing model and usage
 * 
 * POST /api/calculate
 * {
 *   "model_id": "tiered",
 *   "usage": 5000
 * }
 */
router.post('/calculate', async (req, res, next) => {
  try {
    const { model_id, usage } = req.body;
    
    if (!model_id) {
      return res.status(400).json({ error: 'model_id is required' });
    }
    
    if (usage === undefined || usage === null) {
      return res.status(400).json({ error: 'usage is required' });
    }
    
    const model = getPricingModelById(model_id);
    
    if (!model) {
      return res.status(404).json({ error: 'Pricing model not found' });
    }
    
    const totalCost = calculateCost(model, usage);
    const tierBreakdown = calculateTierBreakdown(model, usage);
    
    // Track the calculation as a usage event
    await trackEvent('billing_calculation', usage, {
      pricingModel: model_id,
      calculatedCost: totalCost
    });
    
    res.status(200).json({
      model_id,
      model_name: model.name,
      usage,
      base_price: model.basePrice,
      total_cost: totalCost,
      currency: 'USD',
      tier_breakdown: tierBreakdown
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;