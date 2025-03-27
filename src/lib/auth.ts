import { supabase, supabaseAdmin } from './supabase';
import { SignupFormData } from './types';

export const signUp = async (data: SignupFormData) => {
  try {
    // Step 1: Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return { success: false, error: authError };
    }

    if (!authData.user) {
      return { success: false, error: { message: 'User creation failed' } };
    }

    // Step 2: Insert the user data into the customers table
    const { error: customerError } = await supabase
      .from('customers')
      .insert({
        auth_id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phoneNumber,
        role: "customer"
      });

    if (customerError) {
      console.error('Error creating customer profile:', customerError);
      return { success: false, error: customerError };
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return { success: false, error };
  }
};


export const signIn = async (email: string, password: string) => {
  try {
    // First, authenticate the user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError };
    }

    // If authentication is successful, check the user's role in the customers table
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('role')
      .eq('auth_id', authData.user?.id)
      .single();

    if (customerError) {
      console.error('Error fetching user role:', customerError);
      return { 
        success: false, 
        error: { message: 'Unable to retrieve user role. Please contact support.' }
      };
    }

    // Return the authentication result with the user's role
    return { 
      success: true, 
      user: authData.user,
      role: customerData?.role || null
    };
  } catch (error) {
    console.error('Unexpected error during signin:', error);
    return { 
      success: false, 
      error: { message: 'An unexpected error occurred. Please try again.' }
    };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error during signout:', error);
    return { success: false, error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Unexpected error getting current user:', error);
    return { success: false, error };
  }
};

export const listOfUsers = async() => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('role' , 'customer')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching loans:', error);
        return { success: false, error };
      }
      console.log(data)
      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error fetching loans:', error);
      return { success: false, error };
    }
}

export const deleteCustomerAdmin = async (customerId , authId) => {
  try {
    // Delete customer from customers_table
    const { error: deleteCustomerError } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (deleteCustomerError) {
      console.error('Error deleting customer:', deleteCustomerError.message);
      return { success: false, message: 'Failed to delete customer' };
    }

    // Delete user from Supabase authentication table
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(authId);

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError.message);
      return { success: false, message: 'Customer deleted, but failed to remove authentication' };
    }

    return { success: true, message: 'Customer and authentication user deleted successfully' };

  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, message: 'Unexpected error occurred' };
  }
};