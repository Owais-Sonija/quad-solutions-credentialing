export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  created_at: string;
}

export type RequestStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

export interface CredentialingRequest {
  id: string;
  user_id: string;
  specialty: string;
  npi_number: string;
  license_state: string;
  request_type: string;
  status: RequestStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

export interface Document {
  id: string;
  request_id: string;
  file_name: string;
  file_path: string;
  document_type: string;
  uploaded_at: string;
}

export interface StatusHistory {
  id: string;
  request_id: string;
  status: RequestStatus;
  notes?: string;
  changed_by: string;
  changed_by_name?: string;
  changed_at: string;
}
