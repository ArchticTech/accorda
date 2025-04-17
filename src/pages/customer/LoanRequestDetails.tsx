import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatLoanRequestForDisplay } from '../../lib/loans';
import { supabase } from "/src/lib/supabase";

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
      case 'reviewing documents':
        return { color: 'bg-blue-100 text-blue-800', label: 'Reviewing Documents' };
      case 'validation':
        return { color: 'bg-indigo-100 text-indigo-800', label: 'Validation' };
      case 'evaluation':
        return { color: 'bg-purple-100 text-purple-800', label: 'Evaluation' };
      case 'signature':
        return { color: 'bg-gray-100 text-gray-800', label: 'Signature' };
      case 'deposit':
        return { color: 'bg-blue-100 text-blue-800', label: 'Deposit' };
      case 'complete':
        return { color: 'bg-green-100 text-green-800', label: 'Complete' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', label: 'Rejected' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  const { color, label } = getStatusColor(status);
  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>{label}</span>;
};

const LoanRequestDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [loanRequest, setLoanRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoanRequestDetails = async () => {
      if (!user || !id) return;
      
      try {
        setLoading(true);
        
        // Fetching loan request
        const { data: loanData, error: loanError } = await supabase.functions.invoke('get-loan-request', {
          body: { id }, // loan request id
        });

        if (loanError) {
          console.error('Failed to fetch loan request details:', loanError);
          setError('Failed to fetch loan request details');
          setLoading(false);
          return;
        }

        const loanResult = loanData;

        if (loanResult.success) {
          const formattedData = formatLoanRequestForDisplay(loanResult.data);
          setLoanRequest(formattedData);
        } else {
          setError('Failed to fetch loan request details');
        }

        setLoading(false);

      } catch (err) {
        console.error('Error fetching loan request details:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoanRequestDetails();
  }, [user, id]);

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Map province code to full name
  const getProvinceName = (code) => {
    const provinces = {
      'AB': 'Alberta',
      'BC': 'British Columbia',
      'MB': 'Manitoba',
      'NB': 'New Brunswick',
      'NL': 'Newfoundland and Labrador',
      'NS': 'Nova Scotia',
      'NT': 'Northwest Territories',
      'NU': 'Nunavut',
      'ON': 'Ontario',
      'PE': 'Prince Edward Island',
      'QC': 'Quebec',
      'SK': 'Saskatchewan',
      'YT': 'Yukon'
    };
    
    return provinces[code] || code;
  };

  // Get file treatment method display text
  const getFileTreatmentText = (method) => {
    return method === 'priority' ? 'Priority Treatment (4 hours)' : 'Normal Treatment (24 hours)';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !loanRequest) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <Link to="/customer/loan-requests" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Loan Requests
          </Link>
        </div>
        <div className="text-center py-12">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Loan Request Not Found</h2>
          <p className="text-gray-600">
            {error || "The loan request you're looking for doesn't exist or you don't have permission to view it."}
          </p>
          <Link 
            to="/customer/loan-requests" 
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            View All Loan Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <div className="flex items-center mb-2">
              <Link to="/customer/loan-requests" className="flex items-center text-blue-600 hover:text-blue-800">
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Loan Requests
              </Link>
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Loan Request #{loanRequest.id}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Submitted on {formatDate(loanRequest.requestDate)}
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <StatusBadge status={loanRequest.status} />
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:p-6">
        {/* Loan Summary */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-700 mb-4">Loan Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Loan Amount</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(loanRequest.loanPackage.amount)}</p>
              <p className="text-sm text-gray-600">{loanRequest.loanPackage.duration}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Pay Frequency</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">{loanRequest.payFrequency}</p>
              <p className="text-sm text-gray-600">Next pay: {formatDate(loanRequest.nextPayDate)}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Processing</span>
              </div>
              <p className="text-xl font-semibold text-gray-900">
                {getFileTreatmentText(loanRequest.loanDetails.fileTreatmentMethod)}
              </p>
              <p className="text-sm text-gray-600">
                {loanRequest.loanDetails.fileTreatmentMethod === 'priority' ? 'Priority processing fee: $10.00' : 'Standard processing'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Personal Information Section */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-3">Personal Information</h4>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Birth Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {loanRequest.personalInfo.birthDate}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{loanRequest.personalInfo.gender}</dd>
            </div>
          </dl>
        </div>
        
        {/* Address Section */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-3">Address</h4>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Street Address</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {loanRequest.personalInfo.addressLine1}
                {loanRequest.personalInfo.addressLine2 && <span><br />{loanRequest.personalInfo.addressLine2}</span>}
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">City</dt>
                <dd className="mt-1 text-sm text-gray-900">{loanRequest.personalInfo.city}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Province</dt>
                <dd className="mt-1 text-sm text-gray-900">{getProvinceName(loanRequest.personalInfo.province)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
                <dd className="mt-1 text-sm text-gray-900">{loanRequest.personalInfo.postalCode}</dd>
              </div>
            </div>
          </dl>
        </div>
        
        {/* References Section */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-3">References</h4>
          <div className="space-y-4">
            {loanRequest.personalInfo.reference1 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700">Reference 1</h5>
                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loanRequest.personalInfo.reference1.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loanRequest.personalInfo.reference1.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loanRequest.personalInfo.reference1.relationship}</dd>
                  </div>
                </dl>
              </div>
            )}
            
            {loanRequest.personalInfo.reference2 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700">Reference 2</h5>
                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loanRequest.personalInfo.reference2.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loanRequest.personalInfo.reference2.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                    <dd className="mt-1 text-sm text-gray-900">{loanRequest.personalInfo.reference2.relationship}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
        
        {/* Income Source Section */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-3">Income Source</h4>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Income Source</dt>
              <dd className="mt-1 text-sm text-gray-900">{loanRequest.incomeSource.source}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Bank Institution</dt>
              <dd className="mt-1 text-sm text-gray-900">{loanRequest.incomeSource.bankInstitution}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Pay Frequency</dt>
              <dd className="mt-1 text-sm text-gray-900">{loanRequest.incomeSource.payFrequency}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Next Pay Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(loanRequest.incomeSource.nextPayDate)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Consumer Proposal</dt>
              <dd className="mt-1 text-sm text-gray-900">{loanRequest.incomeSource.consumerProposal === 'yes' ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Bankruptcy</dt>
              <dd className="mt-1 text-sm text-gray-900">{loanRequest.incomeSource.bankruptcy === 'yes' ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </div>
        
        {/* Loan Details Section */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h4 className="text-lg font-medium text-gray-700 mb-3">Loan Details</h4>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Selected Loan</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {`${formatCurrency(loanRequest.loanDetails.selectedLoan.amount)} for ${loanRequest.loanDetails.selectedLoan.duration}`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">File Treatment Method</dt>
              <dd className="mt-1 text-sm text-gray-900">{getFileTreatmentText(loanRequest.loanDetails.fileTreatmentMethod)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Terms and Conditions</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Terms and conditions: {loanRequest.loanDetails.termsAccepted ? 'Accepted' : 'Not accepted'}</li>
                  <li>Privacy policy: {loanRequest.loanDetails.privacyPolicyAccepted ? 'Accepted' : 'Not accepted'}</li>
                  <li>Marketing communications: {loanRequest.loanDetails.marketingOptIn ? 'Opted in' : 'Opted out'}</li>
                </ul>
              </dd>
            </div>
          </dl>
        </div>
        
        {/* Status Timeline */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-lg font-medium text-gray-700 mb-3">Application Status</h4>
          <div className="relative pb-8">
            <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200"></div>
            <div className="relative flex items-start space-x-3">
              <div>
                <div className="relative px-1">
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center ring-8 ring-white">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1 py-1.5">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">Application Submitted</span>
                  <span className="ml-2 text-gray-500">{formatDate(loanRequest.requestDate)}</span>
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  Your loan application has been received and is being processed.
                </div>
              </div>
            </div>
            
            {/* Current status */}
            <div className="mt-6 relative flex items-start space-x-3">
              <div>
                <div className="relative px-1">
                  <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center ring-8 ring-white">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1 py-1.5">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900">Current Status: {loanRequest.status.charAt(0).toUpperCase() + loanRequest.status.slice(1)}</span>
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  {loanRequest.status === 'pending' && 'Your application is pending initial review.'}
                  {loanRequest.status === 'reviewing documents' && 'We are currently reviewing your submitted documents.'}
                  {loanRequest.status === 'validation' && 'Your information is being validated.'}
                  {loanRequest.status === 'evaluation' && 'Your loan application is being evaluated.'}
                  {loanRequest.status === 'signature' && 'Your application is approved and awaiting signature.'}
                  {loanRequest.status === 'deposit' && 'Your loan is approved and funds are being prepared for deposit.'}
                  {loanRequest.status === 'complete' && 'Your loan has been fully processed and funds have been deposited.'}
                  {loanRequest.status === 'rejected' && 'Unfortunately, your loan application has been rejected.'}
                </div>
              </div>
            </div>
            
            {/* Completed status for completed loans */}
            {loanRequest.status === 'complete' && (
              <div className="mt-6 relative flex items-start space-x-3">
                <div>
                  <div className="relative px-1">
                    <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center ring-8 ring-white">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-1.5">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">Loan Completed</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    Your loan has been successfully processed and funds have been deposited to your account.
                  </div>
                </div>
              </div>
            )}
            
            {/* Rejected status for rejected loans */}
            {loanRequest.status === 'rejected' && (
              <div className="mt-6 relative flex items-start space-x-3">
                <div>
                  <div className="relative px-1">
                    <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center ring-8 ring-white">
                      <XCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1 py-1.5">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">Application Rejected</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    Unfortunately, your loan application has been rejected. Please contact customer support for more information.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between">
          <Link 
            to="/customer/loan-requests" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Loan Requests
          </Link>
          
          {loanRequest.status !== 'complete' && loanRequest.status !== 'rejected' && (
            <button 
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Contact Support
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanRequestDetails;