import { Request, Response } from 'express';
import pool from '../config/db';
import fs from 'fs';
import path from 'path';

export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;

    let baseQuery = `
      FROM credentialing_requests cr
      JOIN users u ON cr.user_id = u.id
      LEFT JOIN documents d ON cr.id = d.request_id
    `;
    
    let whereClause = '';
    const queryParams: any[] = [];
    
    if (status) {
      whereClause = `WHERE cr.status = $1`;
      queryParams.push(status);
    }

    const countQuery = `SELECT COUNT(DISTINCT cr.id) ${baseQuery} ${whereClause}`;
    const { rows: countRows } = await pool.query(countQuery, queryParams);
    const totalRequests = parseInt(countRows[0].count);

    const dataQuery = `
      SELECT 
        cr.*, 
        u.name AS user_name, 
        u.email AS user_email,
        COUNT(d.id)::int AS doc_count
      ${baseQuery}
      ${whereClause}
      GROUP BY cr.id, u.id
      ORDER BY cr.submitted_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    const dataParams = [...queryParams, limit, offset];
    const { rows } = await pool.query(dataQuery, dataParams);

    res.status(200).json({
      requests: rows,
      total: totalRequests,
      page,
      limit,
      totalPages: Math.ceil(totalRequests / limit)
    });
  } catch (error) {
    console.error('Error fetching all requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRequestDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Get request + user details
    const requestQuery = `
      SELECT cr.*, u.name AS user_name, u.email AS user_email
      FROM credentialing_requests cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.id = $1
    `;
    const requestResult = await pool.query(requestQuery, [id]);

    if (requestResult.rows.length === 0) {
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    const requestData = requestResult.rows[0];

    // 2. Get documents
    const docsQuery = `SELECT * FROM documents WHERE request_id = $1 ORDER BY uploaded_at DESC`;
    const docsResult = await pool.query(docsQuery, [id]);

    // 3. Get status history
    const historyQuery = `
      SELECT sh.*, a.name AS admin_name
      FROM status_history sh
      LEFT JOIN admins a ON sh.changed_by = a.id
      WHERE sh.request_id = $1
      ORDER BY sh.changed_at DESC
    `;
    const historyResult = await pool.query(historyQuery, [id]);

    res.status(200).json({
      ...requestData,
      documents: docsResult.rows,
      status_history: historyResult.rows
    });
  } catch (error) {
    console.error('Error fetching request detail:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { status: new_status, note } = req.body;
    const adminId = req.user?.id;

    const validStatuses = ['pending', 'in_review', 'approved', 'rejected'];
    if (!validStatuses.includes(new_status)) {
      res.status(400).json({ message: 'Invalid status value' });
      client.release();
      return;
    }

    await client.query('BEGIN');

    // Get current status
    const getQuery = `SELECT status FROM credentialing_requests WHERE id = $1 FOR UPDATE`;
    const getResult = await client.query(getQuery, [id]);

    if (getResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Request not found' });
      return;
    }

    const old_status = getResult.rows[0].status;

    if (old_status === new_status) {
      await client.query('ROLLBACK');
      res.status(400).json({ message: 'Status must be different from the current status' });
      return;
    }

    // Insert into status_history
    const historyQuery = `
      INSERT INTO status_history (request_id, old_status, new_status, changed_by, note)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query(historyQuery, [id, old_status, new_status, adminId, note || null]);

    // Update credentialing_requests
    const updateReqQuery = `
      UPDATE credentialing_requests 
      SET status = $1, updated_at = NOW() 
      WHERE id = $2 
      RETURNING *
    `;
    const updateResult = await client.query(updateReqQuery, [new_status, id]);

    await client.query('COMMIT');
    
    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'in_review') AS in_review,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
      FROM credentialing_requests
    `;
    const statsResult = await pool.query(statsQuery);

    const recentQuery = `
      SELECT cr.*, u.name AS user_name, u.email AS user_email
      FROM credentialing_requests cr
      JOIN users u ON cr.user_id = u.id
      ORDER BY cr.submitted_at DESC
      LIMIT 5
    `;
    const recentResult = await pool.query(recentQuery);

    res.status(200).json({
      stats: {
        total: parseInt(statsResult.rows[0].total) || 0,
        pending: parseInt(statsResult.rows[0].pending) || 0,
        in_review: parseInt(statsResult.rows[0].in_review) || 0,
        approved: parseInt(statsResult.rows[0].approved) || 0,
        rejected: parseInt(statsResult.rows[0].rejected) || 0,
      },
      recent_requests: recentResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doc_type, request_status } = req.query;

    let query = `
      SELECT d.*, cr.specialty, cr.request_type, cr.status as request_status,
      u.name as user_name, u.email as user_email
      FROM documents d
      JOIN credentialing_requests cr ON d.request_id = cr.id
      JOIN users u ON cr.user_id = u.id
    `;

    const queryParams = [];
    const whereClause = [];
    
    if (doc_type) {
      queryParams.push(doc_type);
      whereClause.push(`d.doc_type = $${queryParams.length}`);
    }

    if (request_status) {
       queryParams.push(request_status);
       whereClause.push(`cr.status = $${queryParams.length}`);
    }

    if (whereClause.length > 0) {
      query += ` WHERE ` + whereClause.join(' AND ');
    }
    
    query += ` ORDER BY d.uploaded_at DESC`;

    const { rows } = await pool.query(query, queryParams);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching all documents:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const getQuery = `SELECT * FROM documents WHERE id = $1`;
    const getResult = await pool.query(getQuery, [id]);

    if (getResult.rows.length === 0) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    const doc = getResult.rows[0];

    const deleteQuery = `DELETE FROM documents WHERE id = $1`;
    await pool.query(deleteQuery, [id]);

    if (doc.filename) {
      // Assuming frontend uploads went to project root /uploads or backend root /uploads
      const filepath = path.join(process.cwd(), 'uploads', doc.filename);
      if (fs.existsSync(filepath)) {
         fs.unlinkSync(filepath);
      }
    }

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
