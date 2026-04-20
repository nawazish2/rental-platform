const http = require('http');
const express = require('express');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { Server } = require('socket.io');
const User = require('./models/User');
const { initializeRealtime } = require('./services/realtime');

const parseOrigins = () =>
  [process.env.CLIENT_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap((value) => value.split(','))
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = parseOrigins();
const isDev = process.env.NODE_ENV !== 'production';

const normalizeLoopbackOrigin = (value) => {
  if (!value) return value;
  return value
    .replace(/^http:\/\/127\.0\.0\.1(?::\d+)?$/i, (match) => match.replace('127.0.0.1', 'localhost'))
    .replace(/^http:\/\/localhost(?::\d+)?$/i, (match) => match.replace('localhost', '127.0.0.1'));
};

const originAllowed = (requestOrigin) => {
  if (!requestOrigin) return true;
  if (allowedOrigins.includes(requestOrigin)) return true;

  const alt = normalizeLoopbackOrigin(requestOrigin);
  if (alt && allowedOrigins.includes(alt)) return true;

  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isDev && allowedOrigins.length === 0) {
      return callback(null, true);
    }

    if (originAllowed(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
};

const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

initializeRealtime(io);

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('_id name email role');

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  socket.join(`user:${String(socket.user._id)}`);
  socket.emit('socket:ready', { userId: String(socket.user._id) });
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '512kb' }));
app.use(express.urlencoded({ extended: true, limit: '512kb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/visits', require('./routes/visits'));
app.use('/api/shortlists', require('./routes/shortlists'));
app.use('/api/movein', require('./routes/moveIn'));
app.use('/api/support', require('./routes/support'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payments', require('./routes/payments'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
