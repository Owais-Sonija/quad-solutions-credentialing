export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: Date;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export type RequestStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export type DocumentType = 'license' | 'certificate' | 'insurance' | 'identity' | 'other';

export interface CredentialingRequest {
  id: string;
  user_id: string;
  specialty: string;
  npi_number: string;
  license_state: string;
  request_type: string;
  notes?: string;
  status: RequestStatus;
  submitted_at: Date;
  updated_at: Date;
}

export interface Document {
  id: string;
  request_id: string;
  filename: string;
  original_name: string;
  filepath: string;
  file_size: number;
  doc_type: DocumentType;
  uploaded_at: Date;
}

export interface StatusHistory {
  id: string;
  request_id: string;
  old_status?: RequestStatus;
  new_status: RequestStatus;
  changed_by: string;
  note?: string;
  changed_at: Date;
  admin_name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'user' | 'admin';
      };
    }
  }
}
