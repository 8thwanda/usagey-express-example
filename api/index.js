require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

// Import routes
const apiRoutes = require('../routes/api');
const webRoutes = require('../routes/web');

const app = express();

// Middleware setup
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Add path to all template renders
app.use((req, res, next) => {
  const originalRender = res.render;
  res.render = function(view, locals, callback) {
    if (typeof locals === 'object' && locals !== null) {
      locals.path = req.path;
    } else if (typeof locals === 'undefined') {
      locals = { path: req.path };
    }
    originalRender.call(this, view, locals, callback);
  };
  next();
});

// Mount routes
app.use('/api', apiRoutes);
app.use('/', webRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Exporting the app for Vercel
module.exports = app;