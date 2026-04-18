import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
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

export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.id;
    const adminResult = await pool.query('SELECT id, name, email, created_at FROM admins WHERE id = $1', [adminId]);
    const admin = adminResult.rows[0];

    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    // Get system stats for the card
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_providers,
        (SELECT COUNT(*) FROM credentialing_requests) as total_requests,
        (SELECT COUNT(*) FROM credentialing_requests WHERE status = 'pending') as pending_review,
        (SELECT COUNT(*) FROM documents) as documents_uploaded
    `;
    const statsResult = await pool.query(statsQuery);

    res.status(200).json({
      admin,
      stats: {
        total_providers: parseInt(statsResult.rows[0].total_providers) || 0,
        total_requests: parseInt(statsResult.rows[0].total_requests) || 0,
        pending_review: parseInt(statsResult.rows[0].pending_review) || 0,
        documents_uploaded: parseInt(statsResult.rows[0].documents_uploaded) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ message: 'Server error retrieving admin profile' });
  }
};

export const updateAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.id;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    const result = await pool.query(
      'UPDATE admins SET name = $1 WHERE id = $2 RETURNING id, name, email, created_at',
      [name, adminId]
    );

    res.status(200).json({ admin: result.rows[0] });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

export const changeAdminPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user?.id;
    const { currentPassword, newPassword } = req.body;

    const adminResult = await pool.query('SELECT email, password_hash FROM admins WHERE id = $1', [adminId]);
    const admin = adminResult.rows[0];

    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    const DEMO_ADMIN_EMAILS = ['demoadmin@quadsolutions.com'];
    if (DEMO_ADMIN_EMAILS.includes(admin.email)) {
      res.status(403).json({ 
        message: 'Password cannot be changed for demo accounts.' 
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid current password' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [passwordHash, adminId]);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing admin password:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.phone,
        u.created_at,
        COUNT(cr.id)::int as total_requests,
        COUNT(CASE WHEN cr.status = 'pending' THEN 1 END)::int as pending,
        COUNT(CASE WHEN cr.status = 'in_review' THEN 1 END)::int as in_review,
        COUNT(CASE WHEN cr.status = 'approved' THEN 1 END)::int as approved,
        COUNT(CASE WHEN cr.status = 'rejected' THEN 1 END)::int as rejected
      FROM users u
      LEFT JOIN credentialing_requests cr ON cr.user_id = u.id
    `;

    const queryParams: any[] = [];
    if (search) {
      query += ` WHERE u.name ILIKE $1 OR u.email ILIKE $1`;
      queryParams.push(`%${search}%`);
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const { rows } = await pool.query(query, queryParams);
    
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error retrieving users' });
  }
};

export const getUserDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const userQuery = `SELECT id, name, email, phone, created_at FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [id]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const requestsQuery = `
      SELECT cr.*, 
             COUNT(d.id)::int as doc_count 
      FROM credentialing_requests cr
      LEFT JOIN documents d ON d.request_id = cr.id
      WHERE cr.user_id = $1
      GROUP BY cr.id
      ORDER BY cr.submitted_at DESC
    `;
    const requestsResult = await pool.query(requestsQuery, [id]);

    const statsQuery = `
      SELECT 
      COUNT(*)::int as total,
      COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending,
      COUNT(CASE WHEN status = 'in_review' THEN 1 END)::int as in_review,
      COUNT(CASE WHEN status = 'approved' THEN 1 END)::int as approved,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int as rejected
      FROM credentialing_requests
      WHERE user_id = $1
    `;
    const statsResult = await pool.query(statsQuery, [id]);

    res.status(200).json({
      user: userResult.rows[0],
      requests: requestsResult.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error retrieving user details' });
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const overviewQuery = `
      SELECT 
        COUNT(*)::int as total_requests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending,
        COUNT(CASE WHEN status = 'in_review' THEN 1 END)::int as in_review,
        COUNT(CASE WHEN status = 'approved' THEN 1 END)::int as approved,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int as rejected
      FROM credentialing_requests
    `;
    const specialtyQuery = `
      SELECT specialty, COUNT(*)::int as count
      FROM credentialing_requests
      GROUP BY specialty
      ORDER BY count DESC
      LIMIT 8
    `;
    const typeQuery = `
      SELECT request_type, COUNT(*)::int as count
      FROM credentialing_requests
      GROUP BY request_type
      ORDER BY count DESC
    `;
    const timeQuery = `
      SELECT 
        DATE(submitted_at) as date,
        COUNT(*)::int as count
      FROM credentialing_requests
      WHERE submitted_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(submitted_at)
      ORDER BY date ASC
    `;
    const docQuery = `
      SELECT 
        COUNT(*)::int as total_documents,
        COUNT(CASE WHEN doc_type = 'license' THEN 1 END)::int as license,
        COUNT(CASE WHEN doc_type = 'certificate' THEN 1 END)::int as certificate,
        COUNT(CASE WHEN doc_type = 'insurance' THEN 1 END)::int as insurance,
        COUNT(CASE WHEN doc_type = 'identity' THEN 1 END)::int as identity,
        COUNT(CASE WHEN doc_type = 'other' THEN 1 END)::int as other
      FROM documents
    `;
    const userQuery = `SELECT COUNT(*)::int as total_users FROM users`;

    const [overviewRes, specialtyRes, typeRes, timeRes, docRes, userRes] = await Promise.all([
      pool.query(overviewQuery),
      pool.query(specialtyQuery),
      pool.query(typeQuery),
      pool.query(timeQuery),
      pool.query(docQuery),
      pool.query(userQuery)
    ]);

    const overview = overviewRes.rows[0];
    overview.total_users = userRes.rows[0].total_users;
    overview.approval_rate = overview.total_requests > 0 
      ? Math.round((overview.approved / overview.total_requests) * 1000) / 10 
      : 0;

    res.status(200).json({
      overview,
      by_specialty: specialtyRes.rows,
      by_type: typeRes.rows,
      over_time: timeRes.rows,
      documents: docRes.rows[0]
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error retrieving analytics' });
  }
};
