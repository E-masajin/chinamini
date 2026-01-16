-- Rename existing users table to participants
ALTER TABLE users RENAME TO participants;

-- Create new users table for Cognito SSO authentication
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  oauth2_provider TEXT NOT NULL DEFAULT 'cognito',
  oauth2_subject TEXT NOT NULL UNIQUE,
  oauth2_refresh_token TEXT,
  emp_id TEXT,
  emp_name TEXT,
  last_login_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth2_subject ON users(oauth2_subject);
CREATE INDEX idx_users_emp_id ON users(emp_id);
