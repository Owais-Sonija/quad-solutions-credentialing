import { Request, Response } from 'express';
import pool from '../config/db';
import multer from 'multer';

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = req.params.id;
    const { doc_type } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'No file provided' });
      return;
    }

    // Verify request belongs to this user
    const checkQuery = `SELECT id FROM credentialing_requests WHERE id = $1 AND user_id = $2`;
    const checkResult = await pool.query(checkQuery, [requestId, userId]);

    if (checkResult.rows.length === 0) {
      res.status(403).json({ message: 'Request not found or access denied' });
      return;
    }

    const { filename, originalname, path: filepath, size } = req.file;

    const insertQuery = `
      INSERT INTO documents (request_id, filename, original_name, filepath, file_size, doc_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [requestId, filename, originalname, filepath, size, doc_type || 'other'];
    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json(rows[0]);
  } catch (error) {
    if (error instanceof multer.MulterError) {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Verify request belongs to this user
    const checkQuery = `SELECT id FROM credentialing_requests WHERE id = $1 AND user_id = $2`;
    const checkResult = await pool.query(checkQuery, [requestId, userId]);

    if (checkResult.rows.length === 0) {
      res.status(403).json({ message: 'Request not found or access denied' });
      return;
    }

    const docsQuery = `SELECT * FROM documents WHERE request_id = $1 ORDER BY uploaded_at DESC`;
    const docsResult = await pool.query(docsQuery, [requestId]);

    res.status(200).json(docsResult.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
