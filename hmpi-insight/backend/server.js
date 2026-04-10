const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const winston = require('winston');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const hmpiRoutes = require('./routes/hmpi');
const predictionRoutes = require('./routes/predictions');
const gisRoutes = require('./routes/gis');
const alertRoutes = require('./routes/alerts');
const reportRoutes = require('./routes/reports');
const citizenRoutes = require('./routes/citizen');

// Import scheduled jobs
const { startScheduledJobs } = require('./jobs/scheduler');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'hmpi-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hmpi-insight', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Connected to MongoDB');
  // Start scheduled jobs after database connection
  startScheduledJobs();
}).catch(err => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hmpi', hmpiRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/gis', gisRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/citizen', citizenRoutes);

// Static files (for uploaded data)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  logger.info('New client connected');
  
  socket.on('join-region', (regionId) => {
    socket.join(`region-${regionId}`);
    logger.info(`Client joined region: ${regionId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 HMPI-Insight Backend Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = { app, io };
