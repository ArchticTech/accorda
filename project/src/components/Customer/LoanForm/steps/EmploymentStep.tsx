import React from 'react';

interface EmploymentStepProps {
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  handleNestedInputChange: (parent: string, field: string, value: any) => void;
}

const EmploymentStep: React.FC<EmploymentStepProps> = ({ 
  formData, 
  handleInputChange,
  handleNestedInputChange
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Employment Information</h2>
      
      {/* Employment Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Employment Details</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700">
              Employment Status <span className="text-red-500">*</span>
            </label>
            <select
              id="employmentStatus"
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={(e) => handleInputChange('employmentStatus', e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select status</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Retired">Retired</option>
              <option value="Student">Student</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="employerName" className="block text-sm font-medium text-gray-700">
              Employer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="employerName"
              name="employerName"
              value={formData.employerName}
              onChange={(e) => handleInputChange('employerName', e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700">
                Monthly Income (USD) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="monthlyIncome"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                  className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="employmentLength" className="block text-sm font-medium text-gray-700">
                Length of Employment <span className="text-red-500">*</span>
              </label>
              <select
                id="employmentLength"
                name="employmentLength"
                value={formData.employmentLength}
                onChange={(e) => handleInputChange('employmentLength', e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Select length</option>
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1-2 years">1-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="More than 10 years">More than 10 years</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* References */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">References</h3>
        <p className="text-sm text-gray-500 mb-4">
          Please provide two references who can verify your information.
        </p>
        
        {/* Reference 1 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h4 className="text-md font-medium text-gray-700 mb-3">Reference 1</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reference1Name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reference1Name"
                name="reference1Name"
                value={formData.reference1.name}
                onChange={(e) => handleNestedInputChange('reference1', 'name', e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="reference1Relationship" className="block text-sm font-medium text-gray-700">
                Relationship <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reference1Relationship"
                name="reference1Relationship"
                value={formData.reference1.relationship}
                onChange={(e) => handleNestedInputChange('reference1', 'relationship', e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Friend, Family, Colleague"
                required
              />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="reference1Phone" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="reference1Phone"
                name="reference1Phone"
                value={formData.reference1.phone}
                onChange={(e) => handleNestedInputChange('reference1', 'phone', e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="(123) 456-7890"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Reference 2 */}
        <div className="p-4 bg-gray-50 rounded-md">
          <h4 className="text-md font-medium text-gray-700 mb-3">Reference 2</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reference2Name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reference2Name"
                name="reference2Name"
                value={formData.reference2.name}
                onChange={(e) => handleNestedInputChange('reference2', 'name', e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="reference2Relationship" className="block text-sm font-medium text-gray-700">
                Relationship <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reference2Relationship"
                name="reference2Relationship"
                value={formData.reference2.relationship}
                onChange={(e) => handleNestedInputChange('reference2', 'relationship', e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Friend, Family, Colleague"
                required
              />
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="reference2Phone" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="reference2Phone"
                name="reference2Phone"
                value={formData.reference2.phone}
                onChange={(e) => handleNestedInputChange('reference2', 'phone', e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="(123) 456-7890"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmploymentStep;