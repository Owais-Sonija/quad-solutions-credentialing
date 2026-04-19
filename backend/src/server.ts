import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import timeout from 'connect-timeout';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import pool from './config/db';
import bcrypt from 'bcrypt';

const seedDemoAccounts = async () => {
  try {
    // Seed demo user
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['demo@quadsolutions.com']
    )
    if (existingUser.rows.length === 0) {
      const hash = await bcrypt.hash('Demo@1234', 10)
      await pool.query(
        `INSERT INTO users (name, email, password_hash, phone) 
         VALUES ($1, $2, $3, $4)`,
        ['Demo User', 'demo@quadsolutions.com', hash, 
         '+1 (555) 000-0000']
      )
      console.log('Demo user created')
    }

    // Seed demo admin (separate from real admin)
    const existingAdmin = await pool.query(
      'SELECT id FROM admins WHERE email = $1',
      ['demoadmin@quadsolutions.com']
    )
    if (existingAdmin.rows.length === 0) {
      const hash = await bcrypt.hash('DemoAdmin@1234', 10)
      await pool.query(
        `INSERT INTO admins (name, email, password_hash) 
         VALUES ($1, $2, $3)`,
        ['Demo Admin', 'demoadmin@quadsolutions.com', hash]
      )
      console.log('Demo admin created')
    }
  } catch (err) {
    console.error('Demo seed error:', err)
  }
}

seedDemoAccounts()

const app = express();

// Middleware
app.use(timeout('30s'));
app.use((req: any, res: Response, next: NextFunction) => {
  if (!req.timedout) next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL, // Allow requests from FRONTEND_URL in env
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global rate limit - applies to ALL routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,  // increased from 100 to 200
  message: { 
    message: 'Too many requests. Please try again later.' 
  },
  skip: (req) => {
    // Skip rate limiting for static files
    return req.path.startsWith('/uploads/')
  }
})

// Strict limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,  // 15 login attempts per 15 min (increased from 10)
  message: { 
    message: 'Too many login attempts. Please try again in 15 minutes.' 
  }
})

// Apply global limiter to all routes
app.use(globalLimiter)

// Apply strict limiter to auth routes
app.use('/api/auth', authLimiter)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('Created uploads directory')
}

// Static file serving for uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err)
  
  if (err.name === 'MulterError') {
    return res.status(400).json({ 
      message: err.message || 'File upload error' 
    })
  }
  
  if (err.message === 'Request timeout') {
    return res.status(408).json({ 
      message: 'Request timed out. Please try again.' 
    })
  }
  
  res.status(500).json({ 
    message: 'Internal server error. Please try again.' 
  })
})

// Server configuration
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
