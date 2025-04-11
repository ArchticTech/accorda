// supabase/functions/get-customer-loan-requests/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return new Response(JSON.stringify({ success: false, error: "Missing customerId" }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // use service role for full access (secure on backend only)
    );

    // 1. Get loan requests
    const { data: loanRequests, error: loanRequestsError } = await supabase
      .from("loan_requests")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (loanRequestsError) {
      return new Response(JSON.stringify({ success: false, error: loanRequestsError.message }), { status: 500 });
    }

    const loanRequestIds = loanRequests.map((lr) => lr.id);

    // 2. Get references
    const { data: references, error: referencesError } = await supabase
      .from("references")
      .select("*")
      .in("loan_request_id", loanRequestIds);

    if (referencesError) {
      return new Response(JSON.stringify({ success: false, error: referencesError.message }), { status: 500 });
    }

    // Pay frequency map
    const payFrequencyMap: Record<string, string> = {
      "1month": "Once a month",
      "2weeks": "Every 2 weeks",
      bimonthly: "Twice a month",
      "1week": "Every week",
    };

    // 3. Format and enrich each request
    const formattedRequests = await Promise.all(
      loanRequests.map(async (lr) => {
        const firstReference = references.find(
          (ref) => ref.loan_request_id === lr.id && ref.reference_order === 1
        );

        const { data: loanDetails, error: loanError } = await supabase
          .from("loans")
          .select("amount, duration")
          .eq("id", lr.loan_id)
          .single();

        return {
          id: lr.id,
          requestDate: lr.request_date,
          loanPackage: {
            amount: loanDetails?.amount || null,
            duration: loanDetails?.duration || null,
          },
          payFrequency: payFrequencyMap[lr.pay_frequency] || lr.pay_frequency,
          reference: firstReference?.name || "N/A",
          status: lr.status,
          nextPayDate: lr.next_pay_date,
          admin_request_status: lr.admin_request_status,
        };
      })
    );

    return new Response(JSON.stringify({ success: true, data: formattedRequests }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
  }
});