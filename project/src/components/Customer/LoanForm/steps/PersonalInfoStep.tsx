import React from 'react';
import { useFormContext } from 'react-hook-form';

// Canadian provinces
const provinces = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' }
];

const PersonalInfoStep = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
      
      {/* Birth Date and Gender */}
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Birth date <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            <div>
              <label htmlFor="birthDate.year" className="sr-only">Year</label>
              <input
                type="text"
                id="birthDate.year"
                {...register('birthDate.year')}
                className={`block w-full py-2 px-3 border ${errors.birthDate?.year ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="YYYY"
                maxLength={4}
              />
              {errors.birthDate?.year && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate.year.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="birthDate.month" className="sr-only">Month</label>
              <input
                type="text"
                id="birthDate.month"
                {...register('birthDate.month')}
                className={`block w-full py-2 px-3 border ${errors.birthDate?.month ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="MM"
                maxLength={2}
              />
              {errors.birthDate?.month && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate.month.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="birthDate.day" className="sr-only">Day</label>
              <input
                type="text"
                id="birthDate.day"
                {...register('birthDate.day')}
                className={`block w-full py-2 px-3 border ${errors.birthDate?.day ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="DD"
                maxLength={2}
              />
              {errors.birthDate?.day && (
                <p className="mt-1 text-sm text-red-600">{errors.birthDate.day.message}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            {...register('gender')}
            className={`mt-1 block w-full py-2 px-3 border ${errors.gender ? 'border-red-300' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>
      </div>
      
      {/* Social Insurance Number */}
      <div className="mb-4">
        <label htmlFor="socialInsuranceNumber" className="block text-sm font-medium text-gray-700">
          Social Insurance Number
        </label>
        <input
          type="text"
          id="socialInsuranceNumber"
          {...register('socialInsuranceNumber')}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="XXX-XXX-XXX"
        />
      </div>
      
      {/* Address Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Address</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
              Address line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="addressLine1"
              {...register('addressLine1')}
              className={`mt-1 block w-full py-2 px-3 border ${errors.addressLine1 ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {errors.addressLine1 && (
              <p className="mt-1 text-sm text-red-600">{errors.addressLine1.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
              Address line 2
            </label>
            <input
              type="text"
              id="addressLine2"
              {...register('addressLine2')}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                {...register('city')}
                className={`mt-1 block w-full py-2 px-3 border ${errors.city ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                Province <span className="text-red-500">*</span>
              </label>
              <select
                id="province"
                {...register('province')}
                className={`mt-1 block w-full py-2 px-3 border ${errors.province ? 'border-red-300' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              >
                <option value="">Select province</option>
                {provinces.map(province => (
                  <option key={province.value} value={province.value}>
                    {province.label}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                Postal code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                {...register('postalCode')}
                className={`mt-1 block w-full py-2 px-3 border ${errors.postalCode ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="A1A 1A1"
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* References Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">References</h3>
        
        {/* Reference 1 */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Reference 1</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="reference1.name" className="block text-sm font-medium text-gray-700">
                Reference Fullname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reference1.name"
                {...register('reference1.name')}
                className={`mt-1 block w-full py-2 px-3 border ${errors.reference1?.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.reference1?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.reference1.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="reference1.phone" className="block text-sm font-medium text-gray-700">
                Reference Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="reference1.phone"
                {...register('reference1.phone')}
                className={`mt-1 block w-full py-2 px-3 border ${errors.reference1?.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="1234567890"
              />
              {errors.reference1?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.reference1.phone.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="reference1.relationship" className="block text-sm font-medium text-gray-700">
                Reference Relationship <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reference1.relationship"
                {...register('reference1.relationship')}
                className={`mt-1 block w-full py-2 px-3 border ${errors.reference1?.relationship ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="e.g., Friend, Family, Colleague"
              />
              {errors.reference1?.relationship && (
                <p className="mt-1 text-sm text-red-600">{errors.reference1.relationship.message}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Reference 2 */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Reference 2</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="reference2.name" className="block text-sm font-medium text-gray-700">
                Reference Fullname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reference2.name"
                {...register('reference2.name')}
                className={`mt-1 block w-full py-2 px-3 border ${errors.reference2?.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              />
              {errors.reference2?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.reference2.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="reference2.phone" className="block text-sm font-medium text-gray-700">
                Reference Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="reference2.phone"
                {...register('reference2.phone')}
                className={`mt-1 block w-full py-2 px-3 border ${errors.reference2?.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="1234567890"
              />
              {errors.reference2?.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.reference2.phone.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="reference2.relationship" className="block text-sm font-medium text-gray-700">
                Reference Relationship <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reference2.relationship"
                {...register('reference2.relationship')}
                className={`mt-1 block w-full py-2 px-3 border ${errors.reference2?.relationship ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="e.g., Friend, Family, Colleague"
              />
              {errors.reference2?.relationship && (
                <p className="mt-1 text-sm text-red-600">{errors.reference2.relationship.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;