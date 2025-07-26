const { UsageyClient } = require('usagey');

// Create a singleton instance of UsageyClient
let usageyClient = null;

/**
 * Get Usagey client instance (singleton pattern)
 * @returns {UsageyClient}
 */
function getUsageyClient() {
  if (!usageyClient) {
    const apiKey = process.env.USAGEY_API_KEY;
    
    if (!apiKey) {
      throw new Error('Usagey API key is not defined. Please set USAGEY_API_KEY environment variable.');
    }
    
    usageyClient = new UsageyClient(apiKey, {
      baseUrl: process.env.USAGEY_API_URL || 'https://api.usagey.com',
    });
  }
  
  return usageyClient;
}

/**
 * Track a usage event
 * @param {string} eventType - Type of event to track
 * @param {number} quantity - Quantity of usage
 * @param {object} metadata - Additional metadata about the event
 * @returns {Promise<object>}
 */
async function trackEvent(eventType, quantity = 1, metadata = {}) {
  try {
    // Use mock data if specified in environment
    if (process.env.USE_MOCK_DATA === 'true') {
      return mockResponse();
    }
    
    const client = getUsageyClient();
    return await client.trackEvent(eventType, quantity, metadata);
  } catch (error) {
    console.error('Error tracking event:', error);
    throw error;
  }
}

/**
 * Get usage statistics
 * @returns {Promise<object>}
 */
async function getUsageStats() {
  try {
    // Use mock data if specified in environment
    if (process.env.USE_MOCK_DATA === 'true') {
      return { usage: mockUsageStats() };
    }
    
    const client = getUsageyClient();
    return await client.getUsageStats();
  } catch (error) {
    console.error('Error getting usage stats:', error);
    throw error;
  }
}

/**
 * Get recent usage events
 * @param {object} options - Options for filtering usage events
 * @returns {Promise<object>}
 */
async function getUsageEvents(options = {}) {
  try {
    // Use mock data if specified in environment
    if (process.env.USE_MOCK_DATA === 'true') {
      return { data: mockUsageEvents() };
    }
    
    const client = getUsageyClient();
    return await client.getUsageEvents(options);
  } catch (error) {
    console.error('Error getting usage events:', error);
    throw error;
  }
}

// Mock response helper functions
function mockResponse() {
  return {
    success: true,
    event_id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    timestamp: new Date().toISOString(),
    usage: mockUsageStats()
  };
}

function mockUsageStats() {
  return {
    currentUsage: 485,
    limit: 1000,
    percentage: 48.5,
    plan: 'Starter'
  };
}

function mockUsageEvents() {
  return [
    { 
      id: 'evt_001', 
      eventType: 'api_call', 
      quantity: 1, 
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), 
      metadata: { endpoint: '/users', method: 'GET' } 
    },
    { 
      id: 'evt_002', 
      eventType: 'data_processing', 
      quantity: 5, 
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), 
      metadata: { size: '2.5MB' } 
    },
    { 
      id: 'evt_003', 
      eventType: 'storage', 
      quantity: 10, 
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), 
      metadata: { fileCount: 3 } 
    },
    { 
      id: 'evt_004', 
      eventType: 'api_call', 
      quantity: 1, 
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(), 
      metadata: { endpoint: '/products', method: 'POST' } 
    },
    { 
      id: 'evt_005', 
      eventType: 'compute', 
      quantity: 3, 
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), 
      metadata: { duration: '5m' } 
    },
  ];
}

module.exports = {
  getUsageyClient,
  trackEvent,
  getUsageStats,
  getUsageEvents,
  mockUsageStats,
  mockUsageEvents
};