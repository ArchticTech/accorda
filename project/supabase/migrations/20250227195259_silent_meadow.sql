/*
  # Loan System Database Schema

  This SQL script creates the necessary tables for a loan management system based on the loan request form.
  
  Tables:
  1. loans - Stores available loan packages
  2. loan_requests - Stores customer loan applications
  3. customers - Stores customer information (already exists in your project)
  4. references - Stores customer references
  5. loan_statuses - Stores possible loan request statuses
  
  The schema includes proper relationships, constraints, and RLS policies.
*/

-- Create enum types for various fields
CREATE TYPE pay_frequency_type AS ENUM ('1month', '2weeks', 'bimonthly', '1week');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer-not-to-say');
CREATE TYPE income_source_type AS ENUM ('employed', 'saaq', 'CSST', 'pension', 'invalidity', 'insurance', 'rqap');
CREATE TYPE file_treatment_type AS ENUM ('normal', 'priority');
CREATE TYPE loan_status_type AS ENUM (
  'pending', 
  'reviewing documents', 
  'validation', 
  'evaluation', 
  'signature', 
  'deposit', 
  'complete', 
  'rejected'
);

-- Create loans table to store available loan packages
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount decimal(10, 2) NOT NULL,
  duration text NOT NULL,
  interest_rate decimal(5, 2) NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create loan_requests table
CREATE TABLE IF NOT EXISTS loan_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  loan_id uuid NOT NULL REFERENCES loans(id),
  request_date timestamptz DEFAULT now(),
  
  -- Personal Information
  birth_date date NOT NULL,
  gender gender_type NOT NULL,
  social_insurance_number text,
  
  -- Address
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  province text NOT NULL,
  postal_code text NOT NULL,
  
  -- Income Source
  income_source income_source_type NOT NULL,
  bank_institution text NOT NULL,
  pay_frequency pay_frequency_type NOT NULL,
  next_pay_date date NOT NULL,
  consumer_proposal boolean NOT NULL DEFAULT false,
  bankruptcy boolean NOT NULL DEFAULT false,
  
  -- Loan Details
  file_treatment_method file_treatment_type NOT NULL DEFAULT 'normal',
  terms_accepted boolean NOT NULL DEFAULT false,
  privacy_policy_accepted boolean NOT NULL DEFAULT false,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  
  -- Status
  status loan_status_type NOT NULL DEFAULT 'pending',
  status_updated_at timestamptz DEFAULT now(),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create references table
CREATE TABLE IF NOT EXISTS references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_request_id uuid NOT NULL REFERENCES loan_requests(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  relationship text NOT NULL,
  reference_order int NOT NULL, -- 1 for first reference, 2 for second reference
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure each loan request has at most 2 references with different orders
  UNIQUE(loan_request_id, reference_order)
);

-- Create loan_status_history table to track status changes
CREATE TABLE IF NOT EXISTS loan_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_request_id uuid NOT NULL REFERENCES loan_requests(id) ON DELETE CASCADE,
  status loan_status_type NOT NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create loan_documents table
CREATE TABLE IF NOT EXISTS loan_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_request_id uuid NOT NULL REFERENCES loan_requests(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Insert default loan packages
INSERT INTO loans (amount, duration, interest_rate, description)
VALUES 
  (400, '3 Months', 12.99, 'Small short-term loan'),
  (600, '4 Months', 11.99, 'Medium short-term loan'),
  (800, '5 Months', 10.99, 'Medium-term loan'),
  (1000, '5 Months', 9.99, 'Standard medium-term loan'),
  (1200, '6 Months', 9.49, 'Large medium-term loan'),
  (1400, '6 Months', 8.99, 'Premium medium-term loan')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE references ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Loans table policies
CREATE POLICY "Anyone can view active loans" 
  ON loans 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Only admins can modify loans" 
  ON loans 
  FOR ALL 
  TO authenticated 
  USING (auth.uid() IN (SELECT auth_id FROM customers WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM customers WHERE role = 'admin'));

-- Loan requests policies
CREATE POLICY "Customers can view their own loan requests" 
  ON loan_requests 
  FOR SELECT 
  TO authenticated 
  USING (customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()));

CREATE POLICY "Customers can create their own loan requests" 
  ON loan_requests 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()));

CREATE POLICY "Customers can update their own pending loan requests" 
  ON loan_requests 
  FOR UPDATE 
  TO authenticated 
  USING (
    customer_id IN (SELECT id FROM customers WHERE auth_id = auth.uid()) AND 
    status = 'pending'
  );

-- References policies
CREATE POLICY "Customers can view references for their own loan requests" 
  ON references 
  FOR SELECT 
  TO authenticated 
  USING (
    loan_request_id IN (
      SELECT id FROM loan_requests 
      WHERE customer_id IN (
        SELECT id FROM customers 
        WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Customers can create references for their own loan requests" 
  ON references 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    loan_request_id IN (
      SELECT id FROM loan_requests 
      WHERE customer_id IN (
        SELECT id FROM customers 
        WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Customers can update references for their own pending loan requests" 
  ON references 
  FOR UPDATE 
  TO authenticated 
  USING (
    loan_request_id IN (
      SELECT id FROM loan_requests 
      WHERE customer_id IN (
        SELECT id FROM customers 
        WHERE auth_id = auth.uid()
      ) AND status = 'pending'
    )
  );

-- Loan status history policies
CREATE POLICY "Customers can view status history for their own loan requests" 
  ON loan_status_history 
  FOR SELECT 
  TO authenticated 
  USING (
    loan_request_id IN (
      SELECT id FROM loan_requests 
      WHERE customer_id IN (
        SELECT id FROM customers 
        WHERE auth_id = auth.uid()
      )
    )
  );

-- Loan documents policies
CREATE POLICY "Customers can view documents for their own loan requests" 
  ON loan_documents 
  FOR SELECT 
  TO authenticated 
  USING (
    loan_request_id IN (
      SELECT id FROM loan_requests 
      WHERE customer_id IN (
        SELECT id FROM customers 
        WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Customers can upload documents for their own loan requests" 
  ON loan_documents 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    loan_request_id IN (
      SELECT id FROM loan_requests 
      WHERE customer_id IN (
        SELECT id FROM customers 
        WHERE auth_id = auth.uid()
      )
    ) AND uploaded_by = auth.uid()
  );

-- Create functions and triggers

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update the updated_at column for loan_requests
CREATE TRIGGER update_loan_requests_updated_at
BEFORE UPDATE ON loan_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update the updated_at column for loans
CREATE TRIGGER update_loans_updated_at
BEFORE UPDATE ON loans
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update the updated_at column for references
CREATE TRIGGER update_references_updated_at
BEFORE UPDATE ON references
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to record status changes in loan_status_history
CREATE OR REPLACE FUNCTION record_loan_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS NULL OR NEW.status <> OLD.status THEN
    INSERT INTO loan_status_history (loan_request_id, status, created_by)
    VALUES (NEW.id, NEW.status, auth.uid());
    
    -- Update the status_updated_at timestamp
    NEW.status_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to record status changes
CREATE TRIGGER record_loan_status_change
BEFORE UPDATE ON loan_requests
FOR EACH ROW
EXECUTE FUNCTION record_loan_status_change();

-- Function to insert initial status in loan_status_history
CREATE OR REPLACE FUNCTION record_initial_loan_status()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO loan_status_history (loan_request_id, status, created_by)
  VALUES (NEW.id, NEW.status, auth.uid());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to record initial status
CREATE TRIGGER record_initial_loan_status
AFTER INSERT ON loan_requests
FOR EACH ROW
EXECUTE FUNCTION record_initial_loan_status();

-- Add role column to customers table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'role'
  ) THEN
    ALTER TABLE customers ADD COLUMN role text DEFAULT 'customer';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_loan_requests_customer_id ON loan_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_loan_requests_status ON loan_requests(status);
CREATE INDEX IF NOT EXISTS idx_references_loan_request_id ON references(loan_request_id);
CREATE INDEX IF NOT EXISTS idx_loan_status_history_loan_request_id ON loan_status_history(loan_request_id);
CREATE INDEX IF NOT EXISTS idx_loan_documents_loan_request_id ON loan_documents(loan_request_id);