import { supabase } from "./supabase";
import {
  LoanApplicationFormData,
  LoanRequestWithDetails,
  LoanRequestListItem,
} from "./types";

/**
 * Fetch all available loans
 */
// export const getAvailableLoans = async () => {
//   try {
//     const { data, error } = await supabase
//       .from("loans")
//       .select("*")
//       .eq("is_active", true)
//       .order("amount", { ascending: true });

//     if (error) {
//       console.error("Error fetching loans:", error);
//       return { success: false, error };
//     }

//     return { success: true, data };
//   } catch (error) {
//     console.error("Unexpected error fetching loans:", error);
//     return { success: false, error };
//   }
// };

/**
 * Fetch a specific loan by ID
 */
export const getLoanById = async (loanId: string) => {
  try {
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("id", loanId)
      .single();

    if (error) {
      console.error(`Error fetching loan with ID ${loanId}:`, error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error fetching loan:", error);
    return { success: false, error };
  }
};

/**
 * Create a new loan request
 */
// export const createLoanRequest = async (
//   customerId: string,
//   formData: LoanApplicationFormData
// ) => {
//   try {
//     // Start a transaction
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();

//     if (!session) {
//       return {
//         success: false,
//         error: { message: "User not authenticated" },
//       };
//     }

//     // Format birth date
//     const birthDate = `${
//       formData.birthDate.year
//     }-${formData.birthDate.month.padStart(
//       2,
//       "0"
//     )}-${formData.birthDate.day.padStart(2, "0")}`;

//     // Insert loan request
//     const { data: loanRequest, error: loanRequestError } = await supabase
//       .from("loan_requests")
//       .insert({
//         customer_id: customerId,
//         loan_id: formData.selectedLoan.id,

//         // Personal Information
//         birth_date: birthDate,
//         gender: formData.gender,
//         social_insurance_number: formData.socialInsuranceNumber,

//         // Address
//         address_line1: formData.addressLine1,
//         address_line2: formData.addressLine2,
//         city: formData.city,
//         province: formData.province,
//         postal_code: formData.postalCode,

//         // Income Source
//         income_source: formData.incomeSource,
//         bank_institution: formData.bankInstitution,
//         pay_frequency: formData.payFrequency,
//         next_pay_date: formData.nextPayDate,
//         consumer_proposal: formData.consumerProposal === "yes",
//         bankruptcy: formData.bankruptcy === "yes",

//         // Loan Details
//         file_treatment_method: formData.fileTreatmentMethod,
//         terms_accepted: formData.termsAccepted,
//         privacy_policy_accepted: formData.privacyPolicyAccepted,
//         marketing_opt_in: formData.marketingOptIn,

//         // Status (default is 'pending')
//         status: "pending",
//       })
//       .select()
//       .single();

//     if (loanRequestError) {
//       console.error("Error creating loan request:", loanRequestError);
//       return { success: false, error: loanRequestError };
//     }

//     // Insert references
//     const referencesData = [
//       {
//         loan_request_id: loanRequest.id,
//         name: formData.reference1.name,
//         phone: formData.reference1.phone,
//         relationship: formData.reference1.relationship,
//         reference_order: 1,
//       },
//       {
//         loan_request_id: loanRequest.id,
//         name: formData.reference2.name,
//         phone: formData.reference2.phone,
//         relationship: formData.reference2.relationship,
//         reference_order: 2,
//       },
//     ];

//     const { error: referencesError } = await supabase
//       .from("references")
//       .insert(referencesData);

//     if (referencesError) {
//       console.error("Error creating references:", referencesError);
//       return { success: false, error: referencesError };
//     }

//     return { success: true, data: loanRequest };
//   } catch (error) {
//     console.error("Unexpected error creating loan request:", error);
//     return { success: false, error };
//   }
// };

/**
 * Get all loan requests for a customer
 */
// export const getCustomerLoanRequests = async (customerId: string) => {
//   try {
//     // Get loan requests
//     const { data: loanRequests, error: loanRequestsError } = await supabase
//       .from("loan_requests")
//       .select("*")
//       .eq("customer_id", customerId)
//       .order("created_at", { ascending: false });

//     if (loanRequestsError) {
//       console.error("Error fetching loan requests:", loanRequestsError);
//       return { success: false, error: loanRequestsError };
//     }

//     // Get references for all loan requests
//     const loanRequestIds = loanRequests.map((lr) => lr.id);

//     const { data: references, error: referencesError } = await supabase
//       .from("references")
//       .select("*")
//       .in("loan_request_id", loanRequestIds);

//     if (referencesError) {
//       console.error("Error fetching references:", referencesError);
//       return { success: false, error: referencesError };
//     }

//     const formattedRequests: LoanRequestListItem[] = await Promise.all(
//       loanRequests.map(async (lr: any) => {
//         // Find the first reference to display
//         const firstReference = references.find(
//           (ref) => ref.loan_request_id == lr.id && ref.reference_order == 1
//         );

//         // Map pay frequency to display text
//         const payFrequencyMap = {
//           "1month": "Once a month",
//           "2weeks": "Every 2 weeks",
//           bimonthly: "Twice a month",
//           "1week": "Every week",
//         };

//         let loanDetails = await getLoanById(lr?.loan_id);

//         return {
//           id: lr.id,
//           requestDate: lr.request_date,
//           loanPackage: {
//             amount: loanDetails?.data?.amount,
//             duration: loanDetails?.data?.duration,
//           },
//           payFrequency: payFrequencyMap[lr.pay_frequency] || lr.pay_frequency,
//           reference: firstReference ? firstReference.name : "N/A",
//           status: lr.status,
//           nextPayDate: lr.next_pay_date,
//           admin_request_status: lr.admin_request_status,
//         };
//       })
//     );

//     return { success: true, data: formattedRequests };
//   } catch (error) {
//     console.error("Unexpected error fetching customer loan requests:", error);
//     return { success: false, error };
//   }
// };

// export const getAllLoanRequests = async (admin_request_status) => {
//   try {
//     // Get loan requests
//     const { data: loanRequests, error: loanRequestsError } =
//       admin_request_status
//         ? await supabase
//             .from("loan_requests")
//             .select("*")
//             .eq("admin_request_status", admin_request_status)
//             .order("created_at", { ascending: false })
//         : await supabase
//             .from("loan_requests")
//             .select("*")
//             .order("created_at", { ascending: false });

//     if (loanRequestsError) {
//       console.error("Error fetching loan requests:", loanRequestsError);
//       return { success: false, error: loanRequestsError };
//     }

//     // Get references for all loan requests
//     const loanRequestIds = loanRequests.map((lr) => lr.id);

//     const { data: references, error: referencesError } = await supabase
//       .from("references")
//       .select("*")
//       .in("loan_request_id", loanRequestIds);

//     if (referencesError) {
//       console.error("Error fetching references:", referencesError);
//       return { success: false, error: referencesError };
//     }

//     const formattedRequests: LoanRequestListItem[] = await Promise.all(
//       loanRequests.map(async (lr) => {
//         // Map pay frequency to display text
//         let loanDetails = await getLoanById(lr?.loan_id);

//         let customerDetails = await allCustomers(lr?.customer_id);

//         const payFrequencyMap = {
//           "1month": "Once a month",
//           "2weeks": "Every 2 weeks",
//           bimonthly: "Twice a month",
//           "1week": "Every week",
//         };

//         return {
//           id: lr.id,
//           customerData: customerDetails?.data,
//           loanDetails: lr,
//           loanPackage: {
//             amount: loanDetails?.data?.amount,
//             duration: loanDetails?.data?.duration,
//           },
//           payFrequency: payFrequencyMap[lr.pay_frequency] || lr.pay_frequency,

//           // requestDate: lr.request_date,
//           // loanPackage: {
//           //   amount: loanDetails?.data?.amount,
//           //   duration: loanDetails?.data?.duration,
//           // },
//           // reference: firstReference ? firstReference.name : "N/A",
//           // status: lr.status,
//           // nextPayDate: lr.next_pay_date,
//         };
//       })
//     );

//     return { success: true, data: formattedRequests };
//   } catch (error) {
//     console.error("Unexpected error fetching customer loan requests:", error);
//     return { success: false, error };
//   }
// };

export const getAllPerceptions = async () => {
  try {
    // Get loan requests
    const { data: loanRequests, error: loanRequestsError } = await supabase
      .from("perceptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (loanRequestsError) {
      console.error("Error fetching loan requests:", loanRequestsError);
      return { success: false, error: loanRequestsError };
    }

    // Get references for all loan requests
    const loanRequestIds = loanRequests.map((lr) => lr.id);

    const { data: references, error: referencesError } = await supabase
      .from("references")
      .select("*")
      .in("loan_request_id", loanRequestIds);

    if (referencesError) {
      console.error("Error fetching references:", referencesError);
      return { success: false, error: referencesError };
    }

    const formattedRequests: LoanRequestListItem[] = await Promise.all(
      loanRequests.map(async (lr) => {
        // Map pay frequency to display text
        let loanDetails = await getLoanById(lr?.loan_id);

        let customerDetails = await allCustomers(lr?.customer_id);

        const payFrequencyMap = {
          "1month": "Once a month",
          "2weeks": "Every 2 weeks",
          bimonthly: "Twice a month",
          "1week": "Every week",
        };

        return {
          id: lr.id,
          customerData: customerDetails?.data,
          loanDetails: lr,
          loanPackage: {
            amount: loanDetails?.data?.amount,
            duration: loanDetails?.data?.duration,
          },
          payFrequency: payFrequencyMap[lr.pay_frequency] || lr.pay_frequency,
        };
      })
    );

    return { success: true, data: formattedRequests };
  } catch (error) {
    console.error("Unexpected error fetching customer loan requests:", error);
    return { success: false, error };
  }
};

/**
 * Get detailed information about a specific loan request
 */
export const getLoanRequestDetails = async (loanRequestId: string) => {
  try {
    // Get loan request with loan details
    const { data: loanRequest, error: loanRequestError } = await supabase
      .from("loan_requests")
      .select(
        `
        *,
        loans:loan_id (*)
      `
      )
      .eq("id", loanRequestId)
      .single();

    if (loanRequestError) {
      console.error(
        `Error fetching loan request with ID ${loanRequestId}:`,
        loanRequestError
      );
      return { success: false, error: loanRequestError };
    }

    // Get references
    const { data: references, error: referencesError } = await supabase
      .from("references")
      .select("*")
      .eq("loan_request_id", loanRequestId)
      .order("reference_order", { ascending: true });

    if (referencesError) {
      console.error("Error fetching references:", referencesError);
      return { success: false, error: referencesError };
    }

    // Get status history
    const { data: statusHistory, error: statusHistoryError } = await supabase
      .from("loan_status_history")
      .select("*")
      .eq("loan_request_id", loanRequestId)
      .order("created_at", { ascending: true });

    if (statusHistoryError) {
      console.error("Error fetching status history:", statusHistoryError);
      return { success: false, error: statusHistoryError };
    }

    // Get documents
    const { data: documents, error: documentsError } = await supabase
      .from("loan_documents")
      .select("*")
      .eq("loan_request_id", loanRequestId)
      .order("created_at", { ascending: false });

    if (documentsError) {
      console.error("Error fetching documents:", documentsError);
      return { success: false, error: documentsError };
    }

    // Format the response
    const result: LoanRequestWithDetails = {
      loanRequest: {
        ...loanRequest,
        loan_id: loanRequest.loan_id,
      },
      loan: loanRequest.loans,
      references,
      statusHistory,
      documents: documents.length > 0 ? documents : undefined,
    };

    return { success: true, data: result };
  } catch (error) {
    console.error("Unexpected error fetching loan request details:", error);
    return { success: false, error };
  }
};

/**
 * Upload a document for a loan request
 */
export const uploadLoanDocument = async (
  loanRequestId: string,
  file: File,
  documentType: string
) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        error: { message: "User not authenticated" },
      };
    }

    // Generate a unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const filePath = `loan_documents/${loanRequestId}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from("loan_documents")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading document:", uploadError);
      return { success: false, error: uploadError };
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("loan_documents").getPublicUrl(filePath);

    // Insert document record
    const { data: document, error: documentError } = await supabase
      .from("loan_documents")
      .insert({
        loan_request_id: loanRequestId,
        document_type: documentType,
        file_name: file.name,
        file_path: publicUrl,
        uploaded_by: session.user.id,
      })
      .select()
      .single();

    if (documentError) {
      console.error("Error creating document record:", documentError);
      return { success: false, error: documentError };
    }

    return { success: true, data: document };
  } catch (error) {
    console.error("Unexpected error uploading document:", error);
    return { success: false, error };
  }
};

/**
 * Get customer ID from auth ID
 */
export const allCustomers = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (error) {
      console.error("Error fetching customer ID:", error);
      return { success: false, error };
    }
    return { success: true, data: data };
  } catch (error) {
    console.error("Unexpected error fetching customer ID:", error);
    return { success: false, error };
  }
};

export const getCustomerIdFromAuthId = async (authId: string) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("id")
      .eq("auth_id", authId)
      .single();

    if (error) {
      console.error("Error fetching customer ID:", error);
      return { success: false, error };
    }

    return { success: true, data: data.id };
  } catch (error) {
    console.error("Unexpected error fetching customer ID:", error);
    return { success: false, error };
  }
};

/**
 * Format loan request data for display
 */
export const formatLoanRequestForDisplay = (
  loanRequest: LoanRequestWithDetails
) => {
  // Map pay frequency to display text
  const payFrequencyMap = {
    "1month": "Once a month",
    "2weeks": "Every 2 weeks",
    bimonthly: "Twice a month",
    "1week": "Every week",
  };

  // Map bank institution code to name
  const getBankName = (code: string) => {
    const banks = {
      "001": "Bank of Montreal",
      "002": "Scotiabank",
      "003": "RBC Royal Bank",
      "004": "Toronto-Dominion Bank",
      "006": "National Bank",
      "010": "CIBC Bank",
      "016": "HSBC Bank",
      "030": "Canadian Western Bank",
      "039": "Laurentian Bank of Canada",
      "219": "Alberta Treasury Branch",
      "310": "First National Bank",
      "320": "PC Financial",
      "540": "Manulife Bank",
      "568": "Peace Hills Trust",
      "614": "Tangerine Bank",
      "621": "KOHO Bank",
      "809": "Credit Union British Columbia",
      "815": "Desjardins Quebec",
      "828": "Credit Union Ontario",
      "829": "Desjardins Ontario",
      "837": "Credit Union Meridian",
      "839": "Credit Union Heritage Brunswick",
      "849": "Brunswick Credit Union",
      "879": "Credit Union Manitoba",
      "899": "Credit Union Alberta",
      "000": "Other",
    };

    return banks[code] || code;
  };

  // Map income source code to name
  const getIncomeSourceName = (code: string) => {
    const sources = {
      employed: "Employed",
      saaq: "SAAQ",
      CSST: "CSST",
      pension: "Pension",
      invalidity: "Invalidity",
      insurance: "Employment Insurance",
      rqap: "RQAP",
    };

    return sources[code] || code;
  };

  // Format the data
  return {
    id: loanRequest.loanRequest.id,
    requestDate: loanRequest.loanRequest.request_date,
    loanPackage: {
      amount: loanRequest.loan.amount,
      duration: loanRequest.loan.duration,
    },
    payFrequency:
      payFrequencyMap[loanRequest.loanRequest.pay_frequency] ||
      loanRequest.loanRequest.pay_frequency,
    reference:
      loanRequest.references.length > 0
        ? loanRequest.references[0].name
        : "N/A",
    status: loanRequest.loanRequest.status,
    nextPayDate: loanRequest.loanRequest.next_pay_date,
    personalInfo: {
      birthDate: loanRequest.loanRequest.birth_date,
      gender: loanRequest.loanRequest.gender,
      addressLine1: loanRequest.loanRequest.address_line1,
      addressLine2: loanRequest.loanRequest.address_line2,
      city: loanRequest.loanRequest.city,
      province: loanRequest.loanRequest.province,
      postalCode: loanRequest.loanRequest.postal_code,
      reference1:
        loanRequest.references.length > 0
          ? {
              name: loanRequest.references[0].name,
              phone: loanRequest.references[0].phone,
              relationship: loanRequest.references[0].relationship,
            }
          : null,
      reference2:
        loanRequest.references.length > 1
          ? {
              name: loanRequest.references[1].name,
              phone: loanRequest.references[1].phone,
              relationship: loanRequest.references[1].relationship,
            }
          : null,
    },
    incomeSource: {
      source: getIncomeSourceName(loanRequest.loanRequest.income_source),
      bankInstitution: getBankName(loanRequest.loanRequest.bank_institution),
      payFrequency:
        payFrequencyMap[loanRequest.loanRequest.pay_frequency] ||
        loanRequest.loanRequest.pay_frequency,
      nextPayDate: loanRequest.loanRequest.next_pay_date,
      consumerProposal: loanRequest.loanRequest.consumer_proposal
        ? "yes"
        : "no",
      bankruptcy: loanRequest.loanRequest.bankruptcy ? "yes" : "no",
    },
    loanDetails: {
      selectedLoan: {
        id: loanRequest.loan.id,
        amount: loanRequest.loan.amount,
        duration: loanRequest.loan.duration,
      },
      fileTreatmentMethod: loanRequest.loanRequest.file_treatment_method,
      termsAccepted: loanRequest.loanRequest.terms_accepted,
      privacyPolicyAccepted: loanRequest.loanRequest.privacy_policy_accepted,
      marketingOptIn: loanRequest.loanRequest.marketing_opt_in,
    },
    statusHistory: loanRequest.statusHistory.map((status) => ({
      status: status.status,
      date: status.created_at,
      notes: status.notes,
    })),
    documents: loanRequest.documents
      ? loanRequest.documents.map((doc) => ({
          id: doc.id,
          type: doc.document_type,
          fileName: doc.file_name,
          url: doc.file_path,
          uploadedAt: doc.created_at,
        }))
      : [],
  };
};

export const approveRequest = async (loanId: string, requestStatus: string) => {
  try {
    // Get loan requests
    const { data: loanRequestUpdate, error: loanRequestError } = await supabase
      .from("loan_requests")
      .update({ admin_request_status: requestStatus })
      .eq("id", loanId)
      .select();

    const { data: statusData, error: statusErrror } = await supabase
      .from("loan_requests")
      .update({ status: "reviewing documents" })
      .eq("id", loanId)
      .select();

    if (loanRequestError) {
      console.error("Error fetching loan requests:", loanRequestError);
      return { success: false, error: loanRequestError };
    }

    if (statusErrror) {
      console.error("Error fetching loan requests:", statusErrror);
      return { success: false, error: statusErrror };
    }

    return { success: true, data: loanRequestUpdate, status: statusData };
  } catch (err) {}
};

export const LoanDetailsFromId = async (loanId: string) => {
  try {
    // Get loan requests
    const { data: loanRequests, error: loanRequestsError } = await supabase
      .from("loan_requests")
      .select("*")
      .eq("id", loanId)
      .order("created_at", { ascending: false });

    if (loanRequestsError) {
      console.error("Error fetching loan requests:", loanRequestsError);
      return { success: false, error: loanRequestsError };
    }

    // Get references for all loan requests
    const loanRequestIds = loanRequests.map((lr) => lr.id);

    const { data: references, error: referencesError } = await supabase
      .from("references")
      .select("*")
      .in("loan_request_id", loanRequestIds);

    if (referencesError) {
      console.error("Error fetching references:", referencesError);
      return { success: false, error: referencesError };
    }

    const formattedRequests: LoanRequestListItem[] = await Promise.all(
      loanRequests.map(async (lr) => {
        // Map pay frequency to display text
        let loanDetails = await getLoanById(lr?.loan_id);

        let customerDetails = await allCustomers(lr?.customer_id);

        const payFrequencyMap = {
          "1month": "Once a month",
          "2weeks": "Every 2 weeks",
          bimonthly: "Twice a month",
          "1week": "Every week",
        };

        return {
          id: lr.id,
          customerData: customerDetails?.data,
          loanDetails: lr,
          loanPackage: {
            amount: loanDetails?.data?.amount,
            duration: loanDetails?.data?.duration,
          },
          payFrequency: payFrequencyMap[lr.pay_frequency] || lr.pay_frequency,
          reference: references,
        };
      })
    );

    return { success: true, data: formattedRequests };
  } catch (error) {
    console.error("Unexpected error fetching customer loan requests:", error);
    return { success: false, error };
  }
};

export async function updateLoanStage(requestId, status) {
  try {
    // Get loan requests
    const { data: loanRequestUpdate, error: loanRequestError } = await supabase
      .from("loan_requests")
      .update({ status: status })
      .eq("id", requestId)
      .select();

    if (loanRequestError) {
      console.error("Error fetching loan requests:", loanRequestError);
      return { success: false, error: loanRequestError };
    }
    return { success: true, data: loanRequestUpdate };
  } catch (err) {}
}

export async function updateRequestStage(requestId, stage) {
  try {
    // Get loan requests
    const { data: loanRequestUpdate, error: loanRequestError } = await supabase
      .from("loan_requests")
      .update({ request_stage: stage })
      .eq("id", requestId)
      .select();

    if (loanRequestError) {
      console.error("Error fetching loan requests:", loanRequestError);
      return { success: false, error: loanRequestError };
    }
    return { success: true, data: loanRequestUpdate };
  } catch (err) {}
}

export async function updatePerceptionStage(perId, stage) {
  try {
    // Get loan requests
    const { data: loanRequestUpdate, error: loanRequestError } = await supabase
      .from("perceptions")
      .update({ stage: stage })
      .eq("id", perId)
      .select();

    if (loanRequestError) {
      console.error("Error fetching loan requests:", loanRequestError);
      return { success: false, error: loanRequestError };
    }
    return { success: true, data: loanRequestUpdate };
  } catch (err) {}
}

export const fetchPerceptionStage = async (perId) => {
  try {
    const { data, error } = await supabase
      .from("perceptions")
      .select("stage")
      .eq("id", perId);
    if (error) {
      console.error(`Error fetching status:`, error);
      return { success: false, error };
    }
    return { success: true, data: data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error };
  }
};

export const fetchLoanRequests = async () => {
  try {
    const { data, error } = await supabase.from("loan_requests").select("*"); // Select all columns, or you can specify the ones you need
    // .not('admin_request_status', 'eq', 'pending')
    // .not('admin_request_status', 'eq', 'rejected');

    if (error) {
      console.error(`Error fetching status:`, error);
      return { success: false, error };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error };
  }
};

export const fetchPerceptionRequests = async () => {
  try {
    const { data, error } = await supabase.from("perceptions").select("*"); // Select all columns, or specify needed ones

    if (error) {
      console.error(`Error fetching perception data:`, error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error };
  }
};

export const getLoanIds = async () => {
  try {
    const { data, error } = await supabase
      .from("loan_requests")
      .select("id")
      .not("admin_request_status", "eq", "pending")
      .not("admin_request_status", "eq", "rejected")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching loan id:", error);
      return { success: false, error };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Unexpected error fetching loan ids:", error);
    return { success: false, error: error };
  }
};

export const addPerception = async (loanId, stage) => {
  try {
    // Check if a perception already exists for the given loanId
    const { data: existingPerception, error: fetchError } = await supabase
      .from("perceptions")
      .select("*")
      .eq("loan_id", loanId)
      .single(); // Assuming only one perception should exist per loanId

    if (fetchError && fetchError.code !== "PGRST116") {
      // Ignore "No rows found" error
      console.error("Error checking existing perception:", fetchError);
      return { success: false, error: fetchError };
    }

    if (existingPerception) {
      return {
        success: false,
        message: "Perception for this loan already exists.",
      };
    }

    // Insert new perception if it doesn't already exist
    const { data, error } = await supabase
      .from("perceptions")
      .insert({
        loan_id: loanId,
        stage: stage,
      })
      .select();

    if (error) {
      console.error("Error adding perception:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error };
  }
};

export const getPerceptionDetails = async () => {
  try {
    // 1️⃣ Fetch all perceptions
    const { data: perceptions, error: perceptionError } = await supabase
      .from("perceptions")
      .select("*");

    if (perceptionError || !perceptions || perceptions.length === 0) {
      console.error("Error fetching perceptions:", perceptionError);
      return { success: false, error: "No perceptions found" };
    }

    const results = await Promise.all(
      perceptions.map(async (perception) => {
        const loanId = perception.loan_id;
        const { data: loanData, error: loanError } = await supabase
          .from("loan_requests")
          .select("*")
          .eq("id", loanId);

        if (loanError || !loanData) {
          console.error(
            `Error fetching loan request for loan_id ${loanId}:`,
            loanError
          );
          return null;
        }

        const customerId = loanData[0]?.customer_id;
        const loan_id = loanData[0]?.loan_id;

        // 4️⃣ Fetch loan details
        const loanPackage = await getLoanById(loan_id);
        if (!loanPackage) {
          console.error(`Loan package not found for loan_id ${loan_id}`);
          return null;
        }

        // 5️⃣ Fetch customer details
        const customerDetails = await allCustomers(customerId);
        if (!customerDetails) {
          console.error(`Customer not found for customer_id ${customerId}`);
          return null;
        }

        // 6️⃣ Return structured object for each perception
        return {
          perceptionData: perception, // Perception details
          loanData, // Loan request details
          loanPackage, // Loan details (amount, duration)
          customerData: customerDetails, // Customer info
        };
      })
    );

    // 7️⃣ Filter out any null values (failed fetches)
    const filteredResults = results.filter((item) => item !== null);
    return { success: true, data: filteredResults };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
};

export const getSinglePerception = async (perceptionId) => {
  try {
    // 1️⃣ Fetch all perceptions
    const { data: perceptions, error: perceptionError } = await supabase
      .from("perceptions")
      .select("*")
      .eq("id", perceptionId);

    if (perceptionError || !perceptions || perceptions.length === 0) {
      console.error("Error fetching perceptions:", perceptionError);
      return { success: false, error: "No perceptions found" };
    }

    const results = await Promise.all(
      perceptions.map(async (perception) => {
        const loanId = perception.loan_id;
        const { data: loanData, error: loanError } = await supabase
          .from("loan_requests")
          .select("*")
          .eq("id", loanId);

        if (loanError || !loanData) {
          console.error(
            `Error fetching loan request for loan_id ${loanId}:`,
            loanError
          );
          return null;
        }

        const customerId = loanData[0]?.customer_id;
        const loan_id = loanData[0]?.loan_id;

        // 4️⃣ Fetch loan details
        const loanPackage = await getLoanById(loan_id);
        if (!loanPackage) {
          console.error(`Loan package not found for loan_id ${loan_id}`);
          return null;
        }

        // 5️⃣ Fetch customer details
        const customerDetails = await allCustomers(customerId);
        if (!customerDetails) {
          console.error(`Customer not found for customer_id ${customerId}`);
          return null;
        }

        const { data: references, error: referencesError } = await supabase
          .from("references")
          .select("*")
          .eq("loan_request_id", loanId);

        if (referencesError) {
          console.error("Error fetching references:", referencesError);
          return { success: false, error: referencesError };
        }

        // 6️⃣ Return structured object for each perception
        return {
          perceptionData: perception, // Perception details
          loanData, // Loan request details
          loanPackage, // Loan details (amount, duration)
          customerData: customerDetails, // Customer info,
          reference: references,
        };
      })
    );

    // 7️⃣ Filter out any null values (failed fetches)
    const filteredResults = results.filter((item) => item !== null);
    return { success: true, data: filteredResults };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
};
