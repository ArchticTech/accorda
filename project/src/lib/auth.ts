import { supabase } from './supabase';
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Unexpected error during signin:', error);
    return { success: false, error };
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