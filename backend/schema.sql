-- 1. Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Enums
CREATE TYPE request_status AS ENUM ('pending', 'in_review', 'approved', 'rejected');
CREATE TYPE document_type AS ENUM ('license', 'certificate', 'insurance', 'identity', 'other');

-- 3. Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Table: admins
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Table: credentialing_requests
CREATE TABLE credentialing_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(100),
    npi_number VARCHAR(20),
    license_state VARCHAR(50),
    request_type VARCHAR(100),
    notes TEXT,
    status request_status DEFAULT 'pending',
    submitted_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Table: documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES credentialing_requests(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    original_name VARCHAR(255),
    filepath TEXT,
    file_size INTEGER,
    doc_type document_type DEFAULT 'other',
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Table: status_history
CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES credentialing_requests(id) ON DELETE CASCADE,
    old_status request_status,
    new_status request_status NOT NULL,
    changed_by UUID REFERENCES admins(id),
    note TEXT,
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Indexes
CREATE INDEX idx_requests_user_id ON credentialing_requests(user_id);
CREATE INDEX idx_requests_status ON credentialing_requests(status);
CREATE INDEX idx_documents_request_id ON documents(request_id);
CREATE INDEX idx_history_request_id ON status_history(request_id);

-- 9. Seed one admin
INSERT INTO admins (name, email, password_hash)
VALUES (
    'Super Admin',
    'admin@quadsolutions.com',
    crypt('Admin@1234', gen_salt('bf', 10))
);
