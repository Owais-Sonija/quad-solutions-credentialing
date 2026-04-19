import { Request, Response } from 'express';
import pool from '../config/db';
import multer from 'multer';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { id: requestId } = req.params;
    const { doc_type } = req.body;

    const files = req.files as any[] 
      ?? (req.file ? [req.file] : []);

    if (!files || files.length === 0) {
      res.status(400).json({ 
        message: 'No file uploaded' 
      });
      return;
    }

    if (files.length > 2) {
      res.status(400).json({ 
        message: 'Maximum 2 files allowed per upload' 
      });
      return;
    }

    // Verify request belongs to this user
    const requestResult = await pool.query(
      'SELECT id FROM credentialing_requests WHERE id = $1 AND user_id = $2',
      [requestId, req.user!.id]
    );
    if (!requestResult.rows[0]) {
      res.status(403).json({ 
        message: 'Access denied' 
      });
      return;
    }

    // Insert each file
    const uploadedDocs = [];
    for (const file of files) {
      const result = await pool.query(
        `INSERT INTO documents 
        (request_id, filename, original_name, filepath, 
         file_size, doc_type) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [
          requestId,
          file.filename,
          file.originalname,
          file.path,
          file.size || 0,
          doc_type || 'other'
        ]
      );
      uploadedDocs.push(result.rows[0]);
    }

    res.status(201).json(
      uploadedDocs.length === 1 
        ? uploadedDocs[0] 
        : uploadedDocs
    );
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Server error during upload' 
    });
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
