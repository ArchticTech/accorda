import { useFormContext } from 'react-hook-form';

const ReviewStep = () => {
  const { getValues } = useFormContext();
  const formData = getValues();

  const formatCurrency = (amount: string | number) => {
    if (!amount) return '-';
    return `$${parseFloat(amount.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Map province code to full name
  const getProvinceName = (code: string) => {
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

  // Map bank institution code to name
  const getBankName = (code: string) => {
    const banks = {
      '001': 'Bank of Montreal',
      '002': 'Scotiabank',
      '003': 'RBC Royal Bank',
      '004': 'Toronto-Dominion Bank',
      '006': 'National Bank',
      '010': 'CIBC Bank',
      '016': 'HSBC Bank',
      '030': 'Canadian Western Bank',
      '039': 'Laurentian Bank of Canada',
      '219': 'Alberta Treasury Branch',
      '310': 'First National Bank',
      '320': 'PC Financial',
      '540': 'Manulife Bank',
      '568': 'Peace Hills Trust',
      '614': 'Tangerine Bank',
      '621': 'KOHO Bank',
      '809': 'Credit Union British Columbia',
      '815': 'Desjardins Quebec',
      '828': 'Credit Union Ontario',
      '829': 'Desjardins Ontario',
      '837': 'Credit Union Meridian',
      '839': 'Credit Union Heritage Brunswick',
      '849': 'Brunswick Credit Union',
      '879': 'Credit Union Manitoba',
      '899': 'Credit Union Alberta',
      '000': 'Other'
    };
    
    return banks[code] || code;
  };

  // Map income source code to name
  const getIncomeSourceName = (code: string) => {
    const sources = {
      'employed': 'Employed',
      'saaq': 'SAAQ',
      'CSST': 'CSST',
      'pension': 'Pension',
      'invalidity': 'Invalidity',
      'insurance': 'Employment Insurance',
      'rqap': 'RQAP'
    };
    
    return sources[code] || code;
  };

  // Map pay frequency code to display text
  const getPayFrequencyText = (code: string) => {
    const frequencies = {
      '1month': 'Once a month',
      '2weeks': 'Every 2 weeks',
      'bimonthly': 'Twice a month',
      '1week': 'Every week'
    };
    
    return frequencies[code] || code;
  };

  // Get file treatment method display text
  const getFileTreatmentText = (method: string) => {
    return method === 'priority' ? 'Priority Treatment (4 hours)' : 'Normal Treatment (24 hours)';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Review Your Application</h2>
      <p className="text-gray-600">
        Please review your loan application details before submitting.
      </p>
      
      {/* Personal Information Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Personal Information</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Birth Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.birthDate.year && formData.birthDate.month && formData.birthDate.day
                ? `${formData.birthDate.year}-${formData.birthDate.month}-${formData.birthDate.day}`
                : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Gender</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.gender || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Social Insurance Number</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.socialInsuranceNumber ? '••••••••• (Provided)' : 'Not provided'}
            </dd>
          </div>
        </dl>
      </div>
      
      {/* Address Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Address</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Street Address</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.addressLine1 || '-'}
              {formData.addressLine2 && <span><br />{formData.addressLine2}</span>}
            </dd>
          </div>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">City</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.city || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Province</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.province ? getProvinceName(formData.province) : '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
              <dd className="mt-1 text-sm text-gray-900">{formData.postalCode || '-'}</dd>
            </div>
          </div>
        </dl>
      </div>
      
      {/* References Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-700 mb-3">References</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Reference 1</h4>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.reference1?.name || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.reference1?.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.reference1?.relationship || '-'}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700">Reference 2</h4>
            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.reference2?.name || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.reference2?.phone || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                <dd className="mt-1 text-sm text-gray-900">{formData.reference2?.relationship || '-'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      {/* Income Source Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Income Source</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Income Source</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.incomeSource ? getIncomeSourceName(formData.incomeSource) : '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bank Institution</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.bankInstitution ? getBankName(formData.bankInstitution) : '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Pay Frequency</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.payFrequency ? getPayFrequencyText(formData.payFrequency) : '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Next Pay Date</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.nextPayDate || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Consumer Proposal</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.consumerProposal === 'yes' ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Bankruptcy</dt>
            <dd className="mt-1 text-sm text-gray-900">{formData.bankruptcy === 'yes' ? 'Yes' : 'No'}</dd>
          </div>
        </dl>
      </div>
      
      {/* Loan Details Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Loan Details</h3>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Selected Loan</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {formData.selectedLoan 
                ? `${formatCurrency(formData.selectedLoan.amount)} for ${formData.selectedLoan.duration}`
                : 'No loan selected'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File Treatment Method</dt>
            <dd className="mt-1 text-sm text-gray-900">{getFileTreatmentText(formData.fileTreatmentMethod)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Terms and Conditions</dt>
            <dd className="mt-1 text-sm text-gray-900">
              <ul className="list-disc pl-5 space-y-1">
                <li>Terms and conditions: {formData.termsAccepted ? 'Accepted' : 'Not accepted'}</li>
                <li>Privacy policy: {formData.privacyPolicyAccepted ? 'Accepted' : 'Not accepted'}</li>
                <li>Marketing communications: {formData.marketingOptIn ? 'Opted in' : 'Opted out'}</li>
              </ul>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ReviewStep;