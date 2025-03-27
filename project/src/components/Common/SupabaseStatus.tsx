import React, { useEffect, useState } from 'react';
import { testSupabaseConnection, supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Database } from 'lucide-react';

const SupabaseStatus = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [envStatus, setEnvStatus] = useState<boolean>(false);

  useEffect(() => {
    // Check if environment variables are loaded
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      setEnvStatus(true);
      console.log('Environment variables are loaded');
    } else {
      console.error('Environment variables are missing');
      setStatus('error');
      setErrorMessage('Environment variables not properly loaded');
      return;
    }

    const checkConnection = async () => {
      try {
        const result = await testSupabaseConnection();
        
        if (result.success) {
          setStatus('connected');
        } else {
          setStatus('error');
          setErrorMessage(result.error?.message || 'Unknown error');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('Unexpected error occurred');
        console.error(err);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg bg-white border">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-blue-500" />
        <span className="font-medium">Supabase Status:</span>
        {status === 'loading' && (
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
            <span>Connecting...</span>
          </div>
        )}
        {status === 'connected' && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-1" />
            <span>Connected</span>
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center text-red-600">
            <XCircle className="h-5 w-5 mr-1" />
            <span>Error: {errorMessage}</span>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        <div className="flex items-center">
          <span className={envStatus ? "text-green-600" : "text-red-600"}>
            {envStatus ? "✓" : "✗"} Environment variables: {envStatus ? "Loaded" : "Missing"}
          </span>
        </div>
        <div className="mt-1">
          Project URL: {import.meta.env.VITE_SUPABASE_URL ? 
            import.meta.env.VITE_SUPABASE_URL.split('https://')[1] : 
            'Not available'}
        </div>
      </div>
    </div>
  );
};

export default SupabaseStatus;