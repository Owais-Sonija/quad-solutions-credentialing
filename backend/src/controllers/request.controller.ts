import { Request, Response } from 'express';
import pool from '../config/db';

export const submitRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specialty, npi_number, license_state, request_type, notes } = req.body;
    
    // Validate required fields
    if (!specialty || !npi_number || !license_state || !request_type) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const query = `
      INSERT INTO credentialing_requests (user_id, specialty, npi_number, license_state, request_type, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [userId, specialty, npi_number, license_state, request_type, notes];
    
    const { rows } = await pool.query(query, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error submitting request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Join documents count per request 
    const query = `
      SELECT cr.*, COUNT(d.id)::int AS doc_count
      FROM credentialing_requests cr
      LEFT JOIN documents d ON cr.id = d.request_id
      WHERE cr.user_id = $1
      GROUP BY cr.id
      ORDER BY cr.submitted_at DESC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // 1. Get request
    const requestQuery = `
      SELECT * FROM credentialing_requests 
      WHERE id = $1 AND user_id = $2
    `;
    const requestResult = await pool.query(requestQuery, [id, userId]);
    
    if (requestResult.rows.length === 0) {
      res.status(403).json({ message: 'Request not found or access denied' });
      return;
    }
    
    const request = requestResult.rows[0];

    // 2. Get documents
    const docsQuery = `SELECT * FROM documents WHERE request_id = $1`;
    const docsResult = await pool.query(docsQuery, [id]);
    
    // 3. Get status history (join with admins)
    const historyQuery = `
      SELECT sh.*, a.name AS admin_name
      FROM status_history sh
      LEFT JOIN admins a ON sh.changed_by = a.id
      WHERE sh.request_id = $1
      ORDER BY sh.changed_at DESC
    `;
    const historyResult = await pool.query(historyQuery, [id]);

    res.status(200).json({
      ...request,
      documents: docsResult.rows,
      status_history: historyResult.rows
    });

  } catch (error) {
    console.error('Error fetching request details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
