import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const { customerId, formData } = body;

    if (!customerId || !formData) {
      return new Response(JSON.stringify({ success: false, error: "Missing customerId or formData" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Format birth date
    const birthDate = `${formData.birthDate.year}-${formData.birthDate.month.padStart(2, "0")}-${formData.birthDate.day.padStart(2, "0")}`;

    // Insert loan request
    const { data: loanRequest, error: loanRequestError } = await supabase
      .from("loan_requests")
      .insert({
        customer_id: customerId,
        loan_id: formData.selectedLoan.id,
        birth_date: birthDate,
        gender: formData.gender,
        social_insurance_number: formData.socialInsuranceNumber,
        address_line1: formData.addressLine1,
        address_line2: formData.addressLine2,
        city: formData.city,
        province: formData.province,
        postal_code: formData.postalCode,
        income_source: formData.incomeSource,
        bank_institution: formData.bankInstitution,
        pay_frequency: formData.payFrequency,
        next_pay_date: formData.nextPayDate,
        consumer_proposal: formData.consumerProposal === "yes",
        bankruptcy: formData.bankruptcy === "yes",
        file_treatment_method: formData.fileTreatmentMethod,
        terms_accepted: formData.termsAccepted,
        privacy_policy_accepted: formData.privacyPolicyAccepted,
        marketing_opt_in: formData.marketingOptIn,
        status: "pending",
      })
      .select()
      .single();

    if (loanRequestError) {
      return new Response(JSON.stringify({ success: false, error: loanRequestError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const referencesData = [
      {
        loan_request_id: loanRequest.id,
        name: formData.reference1.name,
        phone: formData.reference1.phone,
        relationship: formData.reference1.relationship,
        reference_order: 1,
      },
      {
        loan_request_id: loanRequest.id,
        name: formData.reference2.name,
        phone: formData.reference2.phone,
        relationship: formData.reference2.relationship,
        reference_order: 2,
      },
    ];

    const { error: referencesError } = await supabase
      .from("references")
      .insert(referencesData);

    if (referencesError) {
      return new Response(JSON.stringify({ success: false, error: referencesError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true, data: loanRequest }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
