require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const bookingsRoutes = require('./routes/bookings');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PORT = process.env.PORT || 3001;

app.set('pool', pool);
app.set('trust proxy', 1);

app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json({ limit: '10kb' }));
app.use(cors({ origin: ['https://selk.om', 'https://www.selk.om'], credentials: true }));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, '127.0.0.1', () => console.log(`selk-api listening on 127.0.0.1:${PORT}`));
