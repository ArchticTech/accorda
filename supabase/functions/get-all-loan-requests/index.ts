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

    const { admin_request_status } = await req.json();

    // 1. Get loan requests
    const loanQuery = supabase
      .from("loan_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (admin_request_status) {
      loanQuery.eq("admin_request_status", admin_request_status);
    }

    const { data: loanRequests, error: loanRequestsError } = await loanQuery;

    if (loanRequestsError) {
      return new Response(JSON.stringify({ success: false, error: loanRequestsError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // 2. Get all references
    const loanRequestIds = loanRequests.map((lr) => lr.id);
    const { data: references, error: referencesError } = await supabase
      .from("references")
      .select("*")
      .in("loan_request_id", loanRequestIds);

    if (referencesError) {
      return new Response(JSON.stringify({ success: false, error: referencesError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // 3. Get loan and customer details, then format
    const payFrequencyMap: Record<string, string> = {
      "1month": "Once a month",
      "2weeks": "Every 2 weeks",
      bimonthly: "Twice a month",
      "1week": "Every week",
    };

    const formattedRequests = await Promise.all(
      loanRequests.map(async (lr) => {
        const { data: loanDetails } = await supabase
          .from("loans")
          .select("amount, duration")
          .eq("id", lr.loan_id)
          .single();

        const { data: customerDetails } = await supabase
          .from("customers")
          .select("*")
          .eq("id", lr.customer_id)
          .single();

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

    return new Response(JSON.stringify({ success: true, data: formattedRequests }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
