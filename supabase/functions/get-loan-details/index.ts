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

    const { loanId } = await req.json();

    if (!loanId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing loanId in request body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch loan requests
    const { data: loanRequests, error: loanRequestsError } = await supabase
      .from("loan_requests")
      .select("*")
      .eq("id", loanId)
      .order("created_at", { ascending: false });

    if (loanRequestsError) {
      console.error("Error fetching loan requests:", loanRequestsError);
      return new Response(
        JSON.stringify({ success: false, error: loanRequestsError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    const loanRequestIds = loanRequests.map((lr) => lr.id);

    // Fetch references
    const { data: references, error: referencesError } = await supabase
      .from("references")
      .select("*")
      .in("loan_request_id", loanRequestIds);

    if (referencesError) {
      console.error("Error fetching references:", referencesError);
      return new Response(
        JSON.stringify({ success: false, error: referencesError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    const payFrequencyMap: Record<string, string> = {
      "1month": "Once a month",
      "2weeks": "Every 2 weeks",
      "bimonthly": "Twice a month",
      "1week": "Every week",
    };

    // You may need to create internal helper functions here
    const getLoanById = async (loanId: string) => {
      const { data, error } = await supabase
        .from("loans")
        .select("amount, duration")
        .eq("id", loanId)
        .single();
      if (error) {
        console.error("Error fetching loan:", error);
      }
      return { data };
    };

    const getCustomer = async (customerId: string) => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .single();
      if (error) {
        console.error("Error fetching customer:", error);
      }
      return { data };
    };

    const formattedRequests = await Promise.all(
      loanRequests.map(async (lr) => {
        const loanDetails = await getLoanById(lr?.loan_id);
        const customerDetails = await getCustomer(lr?.customer_id);

        return {
          id: lr.id,
          customerData: customerDetails?.data,
          loanDetails: lr,
          loanPackage: {
            amount: loanDetails?.data?.amount,
            duration: loanDetails?.data?.duration,
          },
          payFrequency: payFrequencyMap[lr.pay_frequency] || lr.pay_frequency,
          reference: references.filter((ref) => ref.loan_request_id === lr.id),
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
