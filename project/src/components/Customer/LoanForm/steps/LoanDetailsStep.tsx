import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Loan } from '../../../../lib/types';

interface LoanDetailsStepProps {
  loans?: Loan[];
}

const LoanDetailsStep: React.FC<LoanDetailsStepProps> = ({ loans = [] }) => {
  const { register, setValue, watch, formState: { errors } } = useFormContext();
  const selectedLoan = watch('selectedLoan');
  const fileTreatmentMethod = watch('fileTreatmentMethod');
  
  // Use the provided loans or fallback to default options if not available
  const loanOptions = loans.length > 0 ? loans : [
    { id: 'loan1', amount: 400, duration: '3 Months' },
    { id: 'loan2', amount: 600, duration: '4 Months' },
    { id: 'loan3', amount: 800, duration: '5 Months' },
    { id: 'loan4', amount: 1000, duration: '5 Months' },
    { id: 'loan5', amount: 1200, duration: '6 Months' },
    { id: 'loan6', amount: 1400, duration: '6 Months' },
  ];
  
  const handleLoanSelect = (loan) => {
    setValue('selectedLoan', loan, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Loans</h2>
      <p className="text-gray-600">
        Select the desired product:
      </p>
      
      {/* Loan Options */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {loanOptions.map((loan) => (
          <div 
            key={loan.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedLoan && selectedLoan.id === loan.id
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
            }`}
            onClick={() => handleLoanSelect(loan)}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id={loan.id}
                name="selectedLoan"
                checked={selectedLoan && selectedLoan.id === loan.id}
                onChange={() => handleLoanSelect(loan)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor={loan.id} className="ml-3 block text-lg font-medium text-gray-700">
                {loan.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}
              </label>
            </div>
            <div className="text-sm text-gray-500 ml-7">
              {loan.duration}
            </div>
          </div>
        ))}
      </div>
      {errors.selectedLoan && (
        <p className="text-sm text-red-600">{errors.selectedLoan.message}</p>
      )}
      
      {/* File Treatment Method */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">File Treatment Method</h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Priority Treatment */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              fileTreatmentMethod === 'priority' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
            }`}
            onClick={() => setValue('fileTreatmentMethod', 'priority', { shouldValidate: true })}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="priorityTreatment"
                {...register('fileTreatmentMethod')}
                value="priority"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="priorityTreatment" className="ml-3 block text-md font-medium text-gray-700">
                Priority Treatment
              </label>
            </div>
            <div className="text-sm text-gray-600 ml-7 mb-3">
              We will process your file within 4 working hours. Your file will be processed as a priority during our opening hours.
            </div>
            <div className="text-sm font-medium text-gray-700 ml-7">
              10.00 $
            </div>
            <div className="text-xs text-gray-500 ml-7">
              (payable only if application approved)
            </div>
          </div>
          
          {/* Normal Treatment */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              fileTreatmentMethod === 'normal' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
            }`}
            onClick={() => setValue('fileTreatmentMethod', 'normal', { shouldValidate: true })}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="normalTreatment"
                {...register('fileTreatmentMethod')}
                value="normal"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="normalTreatment" className="ml-3 block text-md font-medium text-gray-700">
                Normal Treatment
              </label>
            </div>
            <div className="text-sm text-gray-600 ml-7 mb-3">
              We will process your file within 24 working hours.
            </div>
            <div className="text-sm font-medium text-gray-700 ml-7">
              Free
            </div>
          </div>
        </div>
        {errors.fileTreatmentMethod && (
          <p className="mt-1 text-sm text-red-600">{errors.fileTreatmentMethod.message }</p>
        )}
      </div>
      
      {/* Terms and Conditions */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Terms and Conditions</h3>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="termsAccepted"
                {...register('termsAccepted')}
                type="checkbox"
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${errors.termsAccepted ? 'border-red-300' : ''}`}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="termsAccepted" className="font-medium text-gray-700">
                I confirm that the information provided is current and accurate and that I understand and accept the <span className="text-blue-600">terms and conditions</span>. 
                I agree that Prêt Uniflex may contact me by email using the contact information submitted in this form for loan related purposes. <span className="text-red-500">*</span>
              </label>
              {errors.termsAccepted && (
                <p className="mt-1 text-sm text-red-600">{errors.termsAccepted.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="privacyPolicyAccepted"
                {...register('privacyPolicyAccepted')}
                type="checkbox"
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${errors.privacyPolicyAccepted ? 'border-red-300' : ''}`}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="privacyPolicyAccepted" className="font-medium text-gray-700">
                I confirm that I have read the <span className="text-blue-600">Fin Expert inc. consent form</span>, accept the terms and understand the information relating to the collection, 
                use and retention of my personal information by Fin Expert inc. <span className="text-red-500">*</span>
              </label>
              {errors.privacyPolicyAccepted && (
                <p className="mt-1 text-sm text-red-600">{errors.privacyPolicyAccepted.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="marketingOptIn"
                {...register('marketingOptIn')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="marketingOptIn" className="font-medium text-gray-700">
                I also agree to opt into receiving marketing-related communications.
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetailsStep;