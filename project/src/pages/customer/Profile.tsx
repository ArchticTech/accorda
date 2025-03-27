import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Customer } from '../../lib/types';

const Profile = () => {
  const { user } = useAuth();
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('auth_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching customer data:', error);
        } else {
          setCustomerData(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching customer data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchCustomerData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Customer Profile
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Personal details and information.
        </p>
      </div>
      
      {customerData ? (
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customerData.first_name} {customerData.last_name}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customerData.email}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {customerData.phone}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Account created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(customerData.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
          No customer data found.
        </div>
      )}
    </div>
  );
};

export default Profile;