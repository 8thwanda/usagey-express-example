# Usagey Express Example

This is an example application demonstrating how to integrate [Usagey](https://www.npmjs.com/package/usagey) with an Express.js server.

## What is Usagey?

Usagey is a complete toolkit for implementing usage-based pricing in your applications. It provides:

- Real-time usage tracking
- Flexible pricing models (per-unit, tiered, hybrid)
- Automated billing
- Analytics and reporting

## Features Demonstrated

This example application demonstrates:

1. **Server-Side Usage Tracking**: How to track usage events from your backend
2. **RESTful API Integration**: Example API endpoints for tracking and retrieving usage data
3. **Pricing Model Implementation**: How to calculate costs for different pricing strategies
4. **Usage Visualization**: Displaying usage data with charts and tables

## Getting Started

### Prerequisites

- Node.js 14.x or newer
- npm or yarn

### Installation

1. Clone this repository
```bash
git clone https://github.com/usagey/usagey-express-example.git
cd usagey-express-example
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Set up your environment variables
```bash
cp .env.example .env
```

4. Edit `.env` to add your Usagey API key or set `USE_MOCK_DATA=true` for demo purposes

5. Start the server
```bash
npm start
# or
npm run dev # for development with auto-reload
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
.
├── lib/                # Library code, including Usagey client setup
│   ├── usagey-client.js # Usagey client wrapper
│   └── pricing-models.js # Pricing model definitions
├── public/             # Static assets
├── routes/             # Express routes
│   ├── api.js          # API routes for usagey operations
│   └── web.js          # Web routes for serving pages
├── views/              # EJS templates
│   ├── partials/       # Reusable template parts
│   ├── index.ejs       # Home page
│   ├── usage-tracking.ejs # Usage tracking demo
│   ├── usage-dashboard.ejs # Dashboard demo
│   └── pricing-demo.ejs # Pricing models demo
├── .env.example        # Example environment variables
├── server.js           # Express server setup
└── README.md           # This file
```

## API Endpoints

### Track Usage Event

```
POST /api/track
```

**Request Body:**
```json
{
  "event_type": "api_call",
  "quantity": 1,
  "metadata": {
    "endpoint": "/users",
    "method": "GET"
  }
}
```

### Get Usage Statistics

```
GET /api/stats
```

### Get Usage Events

```
GET /api/events?event_type=api_call&limit=10
```

Parameters:
- `event_type`: Filter by event type
- `start_date`: Filter by start date (ISO format)
- `end_date`: Filter by end date (ISO format)
- `limit`: Number of events to return (default: 50, max: 1000)

### Calculate Cost Based on Pricing Model

```
POST /api/calculate
```

**Request Body:**
```json
{
  "model_id": "tiered",
  "usage": 5000
}
```

## Code Examples

### Initialize the Usagey Client

```javascript
// lib/usagey-client.js
const { UsageyClient } = require('usagey');

function getUsageyClient() {
  const apiKey = process.env.USAGEY_API_KEY;
  
  return new UsageyClient(apiKey, {
    baseUrl: process.env.USAGEY_API_URL || 'https://api.usagey.com',
  });
}
```

### Track a Usage Event

```javascript
// Example route handler
const { trackEvent } = require('../lib/usagey-client');

router.post('/track', async (req, res) => {
  try {
    const { event_type, quantity = 1, metadata = {} } = req.body;
    
    const result = await trackEvent(event_type, quantity, metadata);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Get Usage Statistics

```javascript
// Example route handler
const { getUsageStats } = require('../lib/usagey-client');

router.get('/stats', async (req, res) => {
  try {
    const stats = await getUsageStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Resources

- [Usagey NPM Package](https://www.npmjs.com/package/usagey)
- [Usagey Documentation](https://usagey.com/docs)
- [Express.js Documentation](https://expressjs.com/)

## License

MIT