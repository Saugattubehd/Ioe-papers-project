-- IOE Past Papers Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Universities
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  code VARCHAR(20) NOT NULL,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(code, university_id)
);

-- Subjects
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  semester INT CHECK (semester BETWEEN 1 AND 8),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users (admins and moderators)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'moderator')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Papers
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(300) NOT NULL,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  semester INT CHECK (semester BETWEEN 1 AND 8),
  year INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(300) NOT NULL,
  file_size BIGINT,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT true,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed universities
INSERT INTO universities (name, code) VALUES
  ('Tribhuvan University', 'TU'),
  ('Pokhara University', 'PU'),
  ('Kathmandu University', 'KU'),
  ('Purbanchal University', 'PoU');

-- Seed default admin (password: Admin@1234 - CHANGE THIS)
-- Default admin: username=admin, password=Admin@1234  (CHANGE THIS IMMEDIATELY)
INSERT INTO users (username, email, password_hash, role) VALUES
  ('admin', 'admin@ioepapers.edu.np', '$2a$10$.7RphHuogoJY0blLOIrL7uTwjw2NRSh6FItmOABECE038yY5mNVR.', 'admin');

-- Indexes
CREATE INDEX idx_papers_university ON papers(university_id);
CREATE INDEX idx_papers_department ON papers(department_id);
CREATE INDEX idx_papers_semester ON papers(semester);
CREATE INDEX idx_papers_year ON papers(year);
CREATE INDEX idx_departments_university ON departments(university_id);
