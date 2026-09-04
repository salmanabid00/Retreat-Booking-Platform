const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { initSocket } = require('./socket/socketHandler');

const compression = require('compression');

// Load environment variables
dotenv.config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Connect to MongoDB
connectDB();

const app = express();
app.set('trust proxy', 1);

// HTTP Response Compression
app.use(compression());

const server = http.createServer(app);

// Initialize Socket.IO with Server
const io = initSocket(server);
app.set('io', io);

const PORT = process.env.PORT || 5000;

// CORS configuration
const clientUrl = process.env.CLIENT_URL;
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  ...(clientUrl ? clientUrl.split(',').map((url) => url.trim()) : []),
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Stripe Webhook (MUST be registered before express.json() to receive unparsed raw body for signature verification)
const { handleStripeWebhook } = require('./controllers/webhookController');
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Body parser & Cookie parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Prevent intermediate caching on all dynamic API endpoints
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Global Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

// Import Routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Retreat Platform API Server is healthy and running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api', chatRoutes); // /api/conversations & /api/messages
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Fallback Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found.`,
  });
});

// Global Error Handler
app.use(errorHandler);

// Graceful Server Error Handling for EADDRINUSE
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[ERROR]: Port ${PORT} is already in use by another running process.`);
    console.error(`To free port ${PORT} on Windows, run:\n  npx kill-port ${PORT}\nor in PowerShell:\n  Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`);
    process.exit(1);
  } else {
    console.error('[Server Error]:', err);
  }
});

server.listen(PORT, () => {
  console.log(`[Server & Socket.IO Running]: http://localhost:${PORT}`);
});