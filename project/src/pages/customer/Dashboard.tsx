import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Customer } from '../../lib/types';
import { TrendingUp, Users, Clock, CreditCard } from 'lucide-react';

const Dashboard = () => {
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
    <div className="space-y-6">
      {/* Welcome Card */}
      {customerData && (
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-2">Welcome, {customerData.first_name}!</h2>
          <p className="text-gray-600">
            Thank you for using our platform. Here's an overview of your account.
          </p>
        </div>
      )}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Active Loans</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-sm font-medium text-green-600">Good Standing</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Approved Loans</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Total Amount</div>
              <div className="text-sm font-medium text-gray-900">$0.00</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-50 text-yellow-600 mr-4">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">Pending Requests</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Last Request</div>
              <div className="text-sm font-medium text-gray-900">N/A</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">References</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-sm font-medium text-gray-900">Not Verified</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity to display.</p>
            <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Apply for a New Loan
            </button>
          </div>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Links</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <a href="/customer/new-loan" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <h4 className="text-md font-medium text-gray-900">Apply for Loan</h4>
              <p className="mt-1 text-sm text-gray-500">Start a new loan application</p>
            </a>
            <a href="/customer/loan-requests" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <h4 className="text-md font-medium text-gray-900">View Requests</h4>
              <p className="mt-1 text-sm text-gray-500">Check your loan request status</p>
            </a>
            <a href="/customer/profile" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <h4 className="text-md font-medium text-gray-900">Update Profile</h4>
              <p className="mt-1 text-sm text-gray-500">Manage your account details</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;