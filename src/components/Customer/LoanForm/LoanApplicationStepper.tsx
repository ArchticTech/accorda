import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import StepIndicator from './StepIndicator';
import PersonalInfoStep from './steps/PersonalInfoStep';
import IncomeSourceStep from './steps/IncomeSourceStep';
import LoanDetailsStep from './steps/LoanDetailsStep';
import ReviewStep from './steps/ReviewStep';
import { getCustomerIdFromAuthId } from '../../../lib/loans';
import { Loan } from '../../../lib/types';
import { supabase } from "/src/lib/supabase";

// Define validation schemas for each step
const personalInfoSchema = yup.object({
  birthDate: yup.object({
    year: yup.string().required('Year is required').matches(/^\d{4}$/, 'Must be a valid year'),
    month: yup.string().required('Month is required').matches(/^\d{1,2}$/, 'Must be a valid month'),
    day: yup.string().required('Day is required').matches(/^\d{1,2}$/, 'Must be a valid day'),
  }),
  gender: yup.string().required('Gender is required'),
  socialInsuranceNumber: yup.string().optional(),
  addressLine1: yup.string().required('Address line 1 is required'),
  addressLine2: yup.string().optional(),
  city: yup.string().required('City is required'),
  province: yup.string().required('Province is required'),
  postalCode: yup.string().required('Postal code is required')
    .matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Must be a valid Canadian postal code'),
  reference1: yup.object({
    name: yup.string().required('Reference name is required'),
    phone: yup.string().required('Reference phone is required')
      .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
    relationship: yup.string().required('Reference relationship is required'),
  }),
  reference2: yup.object({
    name: yup.string().required('Reference name is required'),
    phone: yup.string().required('Reference phone is required')
      .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
    relationship: yup.string().required('Reference relationship is required'),
  }),
});

const incomeSourceSchema = yup.object({
  incomeSource: yup.string().required('Income source is required'),
  bankInstitution: yup.string().required('Bank institution is required'),
  payFrequency: yup.string().required('Pay frequency is required'),
  nextPayDate: yup.string().required('Next pay date is required'),
  consumerProposal: yup.string().required('Please select an option'),
  bankruptcy: yup.string().required('Please select an option'),
});

const loanDetailsSchema = yup.object({
  selectedLoan: yup.object({
    id: yup.string().required(),
    amount: yup.number().required(),
    duration: yup.string().required(),
  }).required('Please select a loan'),
  fileTreatmentMethod: yup.string().required('Please select a file treatment method'),
  termsAccepted: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
  privacyPolicyAccepted: yup.boolean().oneOf([true], 'You must accept the privacy policy'),
  marketingOptIn: yup.boolean(),
});

// Combine schemas based on current step
const getValidationSchema = (step) => {
  switch (step) {
    case 0:
      return personalInfoSchema;
    case 1:
      return incomeSourceSchema;
    case 2:
      return loanDetailsSchema;
    default:
      return yup.object({});
  }
};

const LoanApplicationStepper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [availableLoans, setAvailableLoans] = useState<Loan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Initialize form with default values
  const methods = useForm({
    defaultValues: {
      // Personal information
      birthDate: {
        year: '',
        month: '',
        day: ''
      },
      gender: '',
      socialInsuranceNumber: '',
      
      // Address
      addressLine1: '',
      addressLine2: '',
      city: '',
      province: '',
      postalCode: '',
      
      // References
      reference1: {
        name: '',
        phone: '',
        relationship: ''
      },
      reference2: {
        name: '',
        phone: '',
        relationship: ''
      },
      
      // Income Source
      incomeSource: '',
      bankInstitution: '',
      payFrequency: '2weeks',
      nextPayDate: '',
      consumerProposal: 'no',
      bankruptcy: 'no',
      
      // Loan details
      selectedLoan: null,
      fileTreatmentMethod: 'normal',
      
      // Terms and conditions
      termsAccepted: false,
      privacyPolicyAccepted: false,
      marketingOptIn: false,
    },
    resolver: yupResolver(getValidationSchema(currentStep)),
    mode: 'all'
  });

  const { handleSubmit, trigger, formState: { isValid, errors } } = methods;

  // Fetch available loans
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-available-loans');
        if (error) {
          console.error('Failed to fetch loans | Function error:', error);
        } else {
          setAvailableLoans(data.data); // because your edge function returns { success, data }
        }
      } catch (err) {
        console.error('Error fetching loans:', err);
      }
    };
    
    fetchLoans();
  }, []);

  const steps = [
    { name: 'Personal Information', description: 'Your personal details' },
    { name: 'Income Source', description: 'Your income and financial details' },
    { name: 'Loan Details', description: 'Select your loan and treatment method' },
    { name: 'Review', description: 'Review your application' }
  ];

  const nextStep = async () => {
    const isStepValid = await trigger();
    
    if (isStepValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        // Update resolver for the next step
        methods.clearErrors();
        methods.resolver = yupResolver(getValidationSchema(currentStep + 1));
        window.scrollTo(0, 0);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Update resolver for the previous step
      methods.clearErrors();
      methods.resolver = yupResolver(getValidationSchema(currentStep - 1));
      window.scrollTo(0, 0);
    }
  };

  const onSubmit = async (formData) => {
    if (!user) {
      setError('You must be logged in to submit a loan application');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Get customer ID from auth ID
      const customerIdResult = await getCustomerIdFromAuthId(user.id);
      
      if (!customerIdResult.success) {
        setError('Failed to fetch customer information');
        setIsSubmitting(false);
        return;
      }
      
      // Create loan request
      const { data, error } = await supabase.functions.invoke('create-loan-request', {
        body: JSON.stringify({
          customerId: customerIdResult.data,
          formData: formData,
        }),
      });
      
      if (error) {
        setError('Failed to submit loan application');
        console.error('Function error:', error);
      } else {
        navigate('/customer/loan-requests', { 
          state: { 
            message: 'Loan application submitted successfully!' 
          } 
        });
      }

    } catch (err) {
      console.error('Error submitting loan application:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoStep />;
      case 1:
        return <IncomeSourceStep />;
      case 2:
        return <LoanDetailsStep loans={availableLoans} />;
      case 3:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-blue-50 border-b border-blue-100">
          <h3 className="text-lg leading-6 font-medium text-blue-900">
            Apply for a New Loan
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-blue-700">
            Please complete all required information to submit your loan application.
          </p>
        </div>

        {/* Step indicators */}
        <div className="px-4 py-4 sm:px-6">
          <StepIndicator steps={steps} currentStep={currentStep} />
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 sm:px-6">
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          </div>
        )}

        {/* Step content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-4 py-5 sm:p-6">
            {renderStepContent()}
          </div>

          {/* Navigation buttons */}
          <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentStep === 0
                  ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </button>
            
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isValid}
                className={`flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                  isValid
                    ? 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                    : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className={`flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting || !isValid
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Finish
                    <Check className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default LoanApplicationStepper;