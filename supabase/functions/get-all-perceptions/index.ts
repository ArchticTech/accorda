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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch perceptions
    const { data: loanRequests, error: loanRequestsError } = await supabase
      .from("perceptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (loanRequestsError) {
      return new Response(
        JSON.stringify({ success: false, error: loanRequestsError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Fetch references
    const loanRequestIds = loanRequests.map((lr) => lr.id);

    const { data: references, error: referencesError } = await supabase
      .from("references")
      .select("*")
      .in("loan_request_id", loanRequestIds);

    if (referencesError) {
      return new Response(
        JSON.stringify({ success: false, error: referencesError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Helper: Fetch loan by id
    const getLoanById = async (loanId: string) => {
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("id", loanId)
        .single();
      if (error) {
        console.error(`Error fetching loan with id ${loanId}:`, error);
        return null;
      }
      return data;
    };

    // Helper: Fetch customer by id
    const getCustomerById = async (customerId: string) => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();
      if (error) {
        console.error(`Error fetching customer with id ${customerId}:`, error);
        return null;
      }
      return data;
    };

    const payFrequencyMap: Record<string, string> = {
      "1month": "Once a month",
      "2weeks": "Every 2 weeks",
      bimonthly: "Twice a month",
      "1week": "Every week",
    };

    // Format all perceptions
    const formattedRequests = await Promise.all(
      loanRequests.map(async (lr) => {
        const loanDetails = await getLoanById(lr.loan_id);
        const customerDetails = await getCustomerById(lr.customer_id);

        return {
          id: lr.id,
          customerData: customerDetails,
          loanDetails: lr,
          loanPackage: {
            amount: loanDetails?.amount,
            duration: loanDetails?.duration,
          },
          payFrequency: payFrequencyMap[lr.pay_frequency] || lr.pay_frequency,
        };
      })
    );

    return new Response(
      JSON.stringify({ success: true, data: formattedRequests }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
