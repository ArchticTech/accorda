export type Customer = {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
};

export type SignupFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
};

// Loan types
export type Loan = {
  id: string;
  amount: number;
  duration: string;
  interest_rate: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

// Enum types from database
export type PayFrequencyType = '1month' | '2weeks' | 'bimonthly' | '1week';
export type GenderType = 'male' | 'female' | 'other' | 'prefer-not-to-say';
export type IncomeSourceType = 'employed' | 'saaq' | 'CSST' | 'pension' | 'invalidity' | 'insurance' | 'rqap';
export type FileTreatmentType = 'normal' | 'priority';
export type LoanStatusType = 
  'pending' | 
  'reviewing documents' | 
  'validation' | 
  'evaluation' | 
  'signature' | 
  'deposit' | 
  'complete' | 
  'rejected';

// Loan request type
export type LoanRequest = {
  id: string;
  customer_id: string;
  loan_id: string;
  request_date: string;
  
  // Personal Information
  birth_date: string;
  gender: GenderType;
  social_insurance_number?: string;
  
  // Address
  address_line1: string;
  address_line2?: string;
  city: string;
  province: string;
  postal_code: string;
  
  // Income Source
  income_source: IncomeSourceType;
  bank_institution: string;
  pay_frequency: PayFrequencyType;
  next_pay_date: string;
  consumer_proposal: boolean;
  bankruptcy: boolean;
  
  // Loan Details
  file_treatment_method: FileTreatmentType;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
  marketing_opt_in: boolean;
  
  // Status
  status: LoanStatusType;
  status_updated_at: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
};

// Reference type
export type Reference = {
  id: string;
  loan_request_id: string;
  name: string;
  phone: string;
  relationship: string;
  reference_order: number;
  created_at: string;
  updated_at: string;
};

// Status history type
export type LoanStatusHistory = {
  id: string;
  loan_request_id: string;
  status: LoanStatusType;
  notes?: string;
  created_by: string;
  created_at: string;
};

// Document type
export type LoanDocument = {
  id: string;
  loan_request_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_by: string;
  created_at: string;
};

// Form data for loan application
export type LoanApplicationFormData = {
  // Personal information
  birthDate: {
    year: string;
    month: string;
    day: string;
  };
  gender: GenderType;
  socialInsuranceNumber?: string;
  
  // Address
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  
  // References
  reference1: {
    name: string;
    phone: string;
    relationship: string;
  };
  reference2: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Income Source
  incomeSource: IncomeSourceType;
  bankInstitution: string;
  payFrequency: PayFrequencyType;
  nextPayDate: string;
  consumerProposal: 'yes' | 'no';
  bankruptcy: 'yes' | 'no';
  
  // Loan details
  selectedLoan: {
    id: string;
    amount: number;
    duration: string;
  };
  fileTreatmentMethod: FileTreatmentType;
  
  // Terms and conditions
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  marketingOptIn: boolean;
};

// Loan request with related data
export type LoanRequestWithDetails = {
  loanRequest: LoanRequest;
  loan: Loan;
  references: Reference[];
  statusHistory: LoanStatusHistory[];
  documents?: LoanDocument[];
};

// Simplified loan request for list view
export type LoanRequestListItem = {
  id: string;
  requestDate: string;
  loanPackage: {
    amount: number;
    duration: string;
  };
  payFrequency: string;
  reference: string;
  status: LoanStatusType;
  nextPayDate: string;
};