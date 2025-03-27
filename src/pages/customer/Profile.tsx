// import React, { useEffect, useState } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { supabase } from '../../lib/supabase';
// import { Customer } from '../../lib/types';

// const Profile = () => {
//   const { user } = useAuth();
//   const [customerData, setCustomerData] = useState<Customer | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchCustomerData = async () => {
//       if (!user) return;

//       try {
//         const { data, error } = await supabase
//           .from('customers')
//           .select('*')
//           .eq('auth_id', user.id)
//           .single();

//         if (error) {
//           console.error('Error fetching customer data:', error);
//         } else {
//           setCustomerData(data);
//         }
//       } catch (err) {
//         console.error('Unexpected error fetching customer data:', err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     if (user) {
//       fetchCustomerData();
//     }
//   }, [user]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white shadow rounded-lg overflow-hidden">
//       <div className="px-4 py-5 sm:px-6 bg-gray-50">
//         <h3 className="text-lg leading-6 font-medium text-gray-900">
//           Customer Profile
//         </h3>
//         <p className="mt-1 max-w-2xl text-sm text-gray-500">
//           Personal details and information.
//         </p>
//       </div>

//       {customerData ? (
//         <div className="border-t border-gray-200">
//           <dl>
//             <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//               <dt className="text-sm font-medium text-gray-500">Full name</dt>
//               <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                 {customerData.first_name} {customerData.last_name}
//               </dd>
//             </div>
//             <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//               <dt className="text-sm font-medium text-gray-500">Email address</dt>
//               <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                 {customerData.email}
//               </dd>
//             </div>
//             <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//               <dt className="text-sm font-medium text-gray-500">Phone number</dt>
//               <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                 {customerData.phone}
//               </dd>
//             </div>
//             <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//               <dt className="text-sm font-medium text-gray-500">Account created</dt>
//               <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                 {new Date(customerData.created_at).toLocaleDateString()}
//               </dd>
//             </div>
//           </dl>
//         </div>
//       ) : (
//         <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
//           No customer data found.
//         </div>
//       )}
//     </div>
//   );
// };

// export default Profile;

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { Calendar } from "lucide-react";

// Define types based on the form fields from your examples
type CustomerProfile = {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  // Personal Info
  birth_date: {
    year: string;
    month: string;
    day: string;
  };
  gender: string;
  social_insurance_number: string;
  // Address
  address_line1: string;
  address_line2: string;
  city: string;
  province: string;
  postal_code: string;
  // References
    reference1_name: string;
    reference1_phone: string;
    reference1_relationship: string;
    reference2_name: string;
    reference2_phone: string;
    reference2_relationship: string;
  // Income Source
  income_source: string;
  bank_institution: string;
  pay_frequency: string;
  next_pay_date: string;
  bank_transit: string;
  bank_account: string;
  monthly_pay_amount: string;
  consumer_proposal: boolean;
  bankruptcy: boolean;
};

// Canadian provinces
const provinces = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" },
];

const Profile = () => {
  const { user } = useAuth();
  const [customerData, setCustomerData] = useState<CustomerProfile | null>(
    null
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<CustomerProfile | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("auth_id", user.id)
          .single();

          console.log(data)

        if (error) {
          console.error("Error fetching customer data:", error);
        } else {
          // Transform data to match our expected structure if needed
          const formattedData: CustomerProfile = {
            ...data,
            birth_date: data.birth_date
              ? data.birth_date
              : { year: "", month: "", day: "" },
            reference1: data.reference1
              ? data.reference1
              : { name: "", phone: "", relationship: "" },
            reference2: data.reference2
              ? data.reference2
              : { name: "", phone: "", relationship: "" },
          };

          console.log(formattedData)
          setCustomerData(formattedData);
          setFormData(formattedData);
        }
      } catch (err) {
        console.error("Unexpected error fetching customer data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCustomerData();
    }
  }, [user]);

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    if (!formData) return;

    // Handle nested fields (e.g., "reference1.name")
    if (id.includes(".")) {
      const [parent, child] = id.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof CustomerProfile],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  // Handle radio buttons
  const handleRadioChange = (name: string, value: string) => {
    if (!formData) return;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Save updated profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData || !user) return;

    setIsSaving(true);
    setUpdateSuccess(false);
    setUpdateError(null);

    try {
      const { error } = await supabase
        .from("customers")
        .update(formData)
        .eq("auth_id", user.id);

      if (error) {
        console.error("Error updating customer data:", error);
        setUpdateError("Failed to update profile. Please try again.");
      } else {
        setCustomerData(formData);
        setUpdateSuccess(true);
        setEditMode(false);
      }
    } catch (err) {
      console.error("Unexpected error updating customer data:", err);
      setUpdateError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel edit mode
  const handleCancel = () => {
    setFormData(customerData);
    setEditMode(false);
    setUpdateError(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!customerData) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
          No customer data found.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Customer Profile
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Personal details and information.
          </p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Profile
          </button>
        ) : null}
      </div>

      {updateSuccess && (
        <div className="m-4 p-3 bg-green-100 text-green-700 rounded">
          Profile updated successfully!
        </div>
      )}

      {updateError && (
        <div className="m-4 p-3 bg-red-100 text-red-700 rounded">
          {updateError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>
          </div>
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">First name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="text"
                    id="first_name"
                    value={formData?.first_name || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  customerData.first_name
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="text"
                    id="last_name"
                    value={formData?.last_name || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  customerData.last_name
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="email"
                    id="email"
                    value={formData?.email || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  customerData.email
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Phone number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="tel"
                    id="phone"
                    value={formData?.phone || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  customerData.phone
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Personal Information */}
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">
              Personal Information
            </h3>
          </div>
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Birth date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      id="birth_date.year"
                      placeholder="YYYY"
                      value={formData?.birth_date.year || ""}
                      onChange={handleChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      maxLength={4}
                    />
                    <input
                      type="text"
                      id="birth_date.month"
                      placeholder="MM"
                      value={formData?.birth_date.month || ""}
                      onChange={handleChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      maxLength={2}
                    />
                    <input
                      type="text"
                      id="birth_date.day"
                      placeholder="DD"
                      value={formData?.birth_date.day || ""}
                      onChange={handleChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      maxLength={2}
                    />
                  </div>
                ) : customerData.birth_date ? (
                  `${customerData.birth_date.year}-${customerData.birth_date.month}-${customerData.birth_date.day}`
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <select
                    id="gender"
                    value={formData?.gender || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                ) : (
                  customerData.gender || "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Social Insurance Number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="text"
                    id="social_insurance_number"
                    value={formData?.social_insurance_number || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="XXX-XXX-XXX"
                  />
                ) : (
                  customerData.social_insurance_number || "Not provided"
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Address Information */}
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Address</h3>
          </div>
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Address line 1
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="text"
                    id="address_line1"
                    value={formData?.address_line1 || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  customerData.address_line1 || "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Address line 2
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="text"
                    id="address_line2"
                    value={formData?.address_line2 || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  customerData.address_line2 || "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">City</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="text"
                    id="city"
                    value={formData?.city || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  customerData.city || "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Province</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <select
                    id="province"
                    value={formData?.province || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select province</option>
                    {provinces.map((province) => (
                      <option key={province.value} value={province.value}>
                        {province.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  provinces.find((p) => p.value === customerData.province)
                    ?.label ||
                  customerData.province ||
                  "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Postal code</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="text"
                    id="postal_code"
                    value={formData?.postal_code || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="A1A 1A1"
                  />
                ) : (
                  customerData.postal_code || "Not provided"
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* References */}
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">References</h3>
          </div>

          {/* Reference 1 */}
          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">
              Reference 1
            </h4>
            <dl>
              <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {editMode ? (
                    <input
                      type="text"
                      id="reference1.name"
                      value={formData?.reference1_name || ""}
                      onChange={handleChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    customerData.reference1_name || "Not provided"
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {editMode ? (
                    <input
                      type="tel"
                      id="reference1.phone"
                      value={formData?.reference1_phone || ""}
                      onChange={handleChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    customerData.reference1_phone || "Not provided"
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Relationship
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {editMode ? (
                    <input
                      type="text"
                      id="reference1.relationship"
                      value={formData?.reference1_relationship || ""}
                      onChange={handleChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    customerData.reference1_relationship || "Not provided"
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Reference 2 */}
          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">
              Reference 2
            </h4>
            <dl>
              <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {editMode ? (
                    <input
                      type="text"
                      id="reference2.name"
                      value={formData?.reference2_name || ""}
                      onChange={handleChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    customerData.reference2_name || "Not provided"
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {editMode ? (
                    <input
                      type="tel"
                      id="reference2.phone"
                      value={formData?.reference2_phone || ""}
                      onChange={handleChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    customerData.reference2_phone || "Not provided"
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Relationship
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {editMode ? (
                    <input
                      type="text"
                      id="reference2.relationship"
                      value={formData?.reference2_relationship || ""}
                      onChange={handleChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  ) : (
                    customerData.reference2_relationship || "Not provided"
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Income Source Information */}
        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Income Source</h3>
          </div>
          <dl>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Income source
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <select
                    id="income_source"
                    value={formData?.income_source || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                ) : (
                  customerData.income_source || "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Bank institution
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <select
                    id="bank_institution"
                    value={formData?.bank_institution || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    <option value="039">Laurentian Bank of Canada (039)</option>
                    <option value="219">Alberta Treasury Branch (219)</option>
                    <option value="310">First National Bank (310)</option>
                    <option value="320">PC Financial (320)</option>
                    <option value="540">Manulife Bank (540)</option>
                    <option value="568">Peace Hills Trust (568)</option>
                    <option value="614">Tangerine Bank (614)</option>
                    <option value="621">KOHO Bank (621)</option>
                    <option value="809">
                      Credit Union British Columbia (809)
                    </option>
                    <option value="815">Desjardins Quebec (815)</option>
                    <option value="828">Credit Union Ontario (828)</option>
                    <option value="829">Desjardins Ontario (829)</option>
                    <option value="837">Credit Union Meridian (837)</option>
                    <option value="839">
                      Credit Union Heritage Brunswick (839)
                    </option>
                    <option value="849">Brunswick Credit Union (849)</option>
                    <option value="879">Credit Union Manitoba (879)</option>
                    <option value="899">Credit Union Alberta (899)</option>
                    <option value="000">Other</option>
                  </select>
                ) : (
                  customerData.bank_institution || "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Pay frequency
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <select
                    id="pay_frequency"
                    value={formData?.pay_frequency || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="1month">Once a month</option>
                    <option value="2weeks">Every 2 weeks</option>
                    <option value="bimonthly">Twice a month</option>
                    <option value="1week">Every week</option>
                  </select>
                ) : (
                  customerData.pay_frequency || "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Next pay date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="date"
                      id="next_pay_date"
                      value={formData?.next_pay_date || ""}
                      onChange={handleChange}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  customerData.next_pay_date || "Not provided"
                )}
              </dd>
            </div>

            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Bank Transit
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="text"
                    id="bank_transit"
                    value={formData?.bank_transit || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  customerData.bank_transit || "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Bank Account
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="text"
                    id="bank_account"
                    value={formData?.bank_account || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  customerData.bank_account || "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Monthly Pay Amount
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <input
                    type="text"
                    id="monthly_pay_amount"
                    value={formData?.monthly_pay_amount || ""}
                    onChange={handleChange}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                ) : (
                  customerData.monthly_pay_amount || "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Consumer proposal in the last 6 months
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="consumerProposalYes"
                        type="radio"
                        name="consumer_proposal"
                        value="yes"
                        checked={formData?.consumer_proposal === "yes"}
                        onChange={() =>
                          handleRadioChange("consumer_proposal", "yes")
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="consumerProposalYes"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="consumerProposalNo"
                        type="radio"
                        name="consumer_proposal"
                        value="no"
                        checked={formData?.consumer_proposal === "no"}
                        onChange={() =>
                          handleRadioChange("consumer_proposal", "no")
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="consumerProposalNo"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        No
                      </label>
                    </div>
                  </div>
                ) : (
                  customerData?.consumer_proposal || "Not provided"
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Ever filed for bankruptcy
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {editMode ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="bankruptcyYes"
                        type="radio"
                        name="bankruptcy"
                        value="yes"
                        checked={formData?.bankruptcy === "yes"}
                        onChange={() => handleRadioChange("bankruptcy", "yes")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="bankruptcyYes"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="bankruptcyNo"
                        type="radio"
                        name="bankruptcy"
                        value="no"
                        checked={formData?.bankruptcy === "no"}
                        onChange={() => handleRadioChange("bankruptcy", "no")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <label
                        htmlFor="bankruptcyNo"
                        className="ml-3 block text-sm font-medium text-gray-700"
                      >
                        No
                      </label>
                    </div>
                  </div>
                ) : (
                  customerData.bankruptcy || "Not provided"
                )}
              </dd>
            </div>
          </dl>
        </div>

        {editMode && (
          <div className="px-4 py-5 sm:px-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
