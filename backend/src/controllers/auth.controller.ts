import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { containsBlockedContent, sanitizeText } from '../middleware/contentFilter.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

const DEMO_EMAIL = 'demo@quadsolutions.com';
const MAX_DEMO_REQUESTS = 20;
const CLEANUP_COUNT = 5;

export const cleanupDemoRequests = async () => {
  try {
    // Get demo user id
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [DEMO_EMAIL]
    );
    if (!userResult.rows[0]) return;

    const demoUserId = userResult.rows[0].id;

    // Count demo user requests
    const countResult = await pool.query(
      'SELECT COUNT(*)::int as count FROM credentialing_requests WHERE user_id = $1',
      [demoUserId]
    );
    const count = countResult.rows[0].count;

    // If over limit, delete oldest requests
    if (count >= MAX_DEMO_REQUESTS) {
      await pool.query(`
        DELETE FROM credentialing_requests 
        WHERE id IN (
          SELECT id FROM credentialing_requests 
          WHERE user_id = $1
          ORDER BY submitted_at ASC
          LIMIT $2
        )
      `, [demoUserId, CLEANUP_COUNT]);
      console.log('Demo cleanup: removed oldest requests');
    }
  } catch (err) {
    console.error('Demo cleanup error:', err);
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (containsBlockedContent(name)) {
      return res.status(400).json({ 
        message: 'Name contains inappropriate content' 
      });
    }
    const sanitizedName = sanitizeText(name);

    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(sanitizedName.trim())) {
      return res.status(400).json({ 
        message: 'Name must contain English letters only' 
      });
    }

    if (sanitizedName.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Name must be at least 2 characters' 
      });
    }
    if (sanitizedName.trim().length > 100) {
      return res.status(400).json({ 
        message: 'Name must not exceed 100 characters' 
      });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [sanitizedName, email, passwordHash, phone || null]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { ...user, role: 'user' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: 'user' }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find admin, note using 'admins' table
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email, role: 'admin' }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userResult = await pool.query('SELECT id, name, email, phone, created_at FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'in_review' THEN 1 END) as in_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
      FROM credentialing_requests 
      WHERE user_id = $1
    `, [userId]);

    const stats = statsResult.rows[0];

    res.json({
      user,
      stats: {
        total: parseInt(stats.total) || 0,
        pending: parseInt(stats.pending) || 0,
        in_review: parseInt(stats.in_review) || 0,
        approved: parseInt(stats.approved) || 0,
        rejected: parseInt(stats.rejected) || 0
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error retrieving profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { name, phone } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required' });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2 WHERE id = $3 RETURNING id, name, email, phone, created_at',
      [name, phone, userId]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    // Get current user details
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const DEMO_EMAILS = ['demo@quadsolutions.com'];
    if (DEMO_EMAILS.includes(user.email)) {
      return res.status(403).json({ 
        message: 'Password cannot be changed for demo accounts. Please create your own account.' 
      });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};
