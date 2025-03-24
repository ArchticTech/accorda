import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Calendar } from 'lucide-react';

const IncomeSourceStep = () => {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Income Source</h2>
      
      <div className="grid grid-cols-1 gap-6 mt-4">
        <div>
          <label htmlFor="incomeSource" className="block text-sm font-medium text-gray-700">
            Income source <span className="text-red-500">*</span>
          </label>
          <select
            id="incomeSource"
            {...register('incomeSource')}
            className={`mt-1 block w-full py-2 px-3 border ${errors.incomeSource ? 'border-red-300' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          >
            <option value="">---------</option>
            <option value="employed">Employed</option>
            <option value="saaq">SAAQ</option>
            <option value="CSST">CSST</option>
            <option value="pension">Pension</option>
            <option value="invalidity">Invalidity</option>
            <option value="insurance">Employment Insurance</option>
            <option value="rqap">RQAP</option>
          </select>
          {errors.incomeSource && (
            <p className="mt-1 text-sm text-red-600">{errors.incomeSource.message}</p>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Financial Informations</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="bankInstitution" className="block text-sm font-medium text-gray-700">
              Bank institution <span className="text-red-500">*</span>
            </label>
            <select
              id="bankInstitution"
              {...register('bankInstitution')}
              className={`mt-1 block w-full py-2 px-3 border ${errors.bankInstitution ? 'border-red-300' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            >
              <option value="">---------</option>
              <option value="001">Bank of Montreal (001)</option>
              <option value="002">Scotiabank (002)</option>
              <option value="003">RBC Royal Bank (003)</option>
              <option value="004">Toronto-Dominion Bank (004)</option>
              <option value="006">National Bank (006)</option>
              <option value="010">CIBC Bank (010)</option>
              <option value="016">HSBC Bank (016)</option>
              <option value="030">Canadian Western Bank (030)</option>
              <option value="039">Laurentian Bank of Canada (039)</option>
              <option value="219">Alberta Treasury Branch (219)</option>
              <option value="310">First National Bank (310)</option>
              <option value="320">PC Financial (320)</option>
              <option value="540">Manulife Bank (540)</option>
              <option value="568">Peace Hills Trust (568)</option>
              <option value="614">Tangerine Bank (614)</option>
              <option value="621">KOHO Bank (621)</option>
              <option value="809">Credit Union British Columbia (809)</option>
              <option value="815">Desjardins Quebec (815)</option>
              <option value="828">Credit Union Ontario (828)</option>
              <option value="829">Desjardins Ontario (829)</option>
              <option value="837">Credit Union Meridian (837)</option>
              <option value="839">Credit Union Heritage Brunswick (839)</option>
              <option value="849">Brunswick Credit Union (849)</option>
              <option value="879">Credit Union Manitoba (879)</option>
              <option value="899">Credit Union Alberta (899)</option>
              <option value="000">Other</option>
            </select>
            {errors.bankInstitution && (
              <p className="mt-1 text-sm text-red-600">{errors.bankInstitution.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="payFrequency" className="block text-sm font-medium text-gray-700">
              Pay frequency <span className="text-red-500">*</span>
            </label>
            <select
              id="payFrequency"
              {...register('payFrequency')}
              className={`mt-1 block w-full py-2 px-3 border ${errors.payFrequency ? 'border-red-300' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            >
              <option value="1month">Once a month</option>
              <option value="2weeks">Every 2 weeks</option>
              <option value="bimonthly">Twice a month</option>
              <option value="1week">Every week</option>
            </select>
            {errors.payFrequency && (
              <p className="mt-1 text-sm text-red-600">{errors.payFrequency.message}</p>
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <label htmlFor="nextPayDate" className="block text-sm font-medium text-gray-700">
            Next pay date <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="date"
              id="nextPayDate"
              {...register('nextPayDate')}
              className={`block w-full py-2 px-3 border ${errors.nextPayDate ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          {errors.nextPayDate && (
            <p className="mt-1 text-sm text-red-600">{errors.nextPayDate.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <p className="block text-sm font-medium text-gray-700">
            In the last 6 months, have you made a consumer proposal? <span className="text-red-500">*</span>
          </p>
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input
                id="consumerProposalYes"
                {...register('consumerProposal')}
                type="radio"
                value="yes"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="consumerProposalYes" className="ml-3 block text-sm font-medium text-gray-700">
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="consumerProposalNo"
                {...register('consumerProposal')}
                type="radio"
                value="no"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="consumerProposalNo" className="ml-3 block text-sm font-medium text-gray-700">
                No
              </label>
            </div>
          </div>
          {errors.consumerProposal && (
            <p className="mt-1 text-sm text-red-600">{errors.consumerProposal.message}</p>
          )}
        </div>
        
        <div>
          <p className="block text-sm font-medium text-gray-700">
            Have you ever filed for bankruptcy? <span className="text-red-500">*</span>
          </p>
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input
                id="bankruptcyYes"
                {...register('bankruptcy')}
                type="radio"
                value="yes"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="bankruptcyYes" className="ml-3 block text-sm font-medium text-gray-700">
                Yes
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="bankruptcyNo"
                {...register('bankruptcy')}
                type="radio"
                value="no"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="bankruptcyNo" className="ml-3 block text-sm font-medium text-gray-700">
                No
              </label>
            </div>
          </div>
          {errors.bankruptcy && (
            <p className="mt-1 text-sm text-red-600">{errors.bankruptcy.message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomeSourceStep;