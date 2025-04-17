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

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // 1️⃣ Fetch all perceptions
    const { data: perceptions, error: perceptionError } = await supabase
      .from("perceptions")
      .select("*");

    if (perceptionError || !perceptions || perceptions.length === 0) {
      console.error("Error fetching perceptions:", perceptionError);
      return new Response(
        JSON.stringify({ success: false, error: "No perceptions found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    const results = await Promise.all(
      perceptions.map(async (perception) => {
        const loanId = perception.loan_id;

        // 2️⃣ Fetch loan request
        const { data: loanData, error: loanError } = await supabase
          .from("loan_requests")
          .select("*")
          .eq("id", loanId);

        if (loanError || !loanData || loanData.length === 0) {
          console.error(`Error fetching loan request for loan_id ${loanId}:`, loanError);
          return null;
        }

        const customerId = loanData[0]?.customer_id;
        const loan_id = loanData[0]?.loan_id;

        // 3️⃣ Fetch loan package
        const { data: loanPackage, error: loanPackageError } = await supabase
          .from("loans")
          .select("*")
          .eq("id", loan_id)
          .single();

        if (loanPackageError || !loanPackage) {
          console.error(`Loan package not found for loan_id ${loan_id}`, loanPackageError);
          return null;
        }

        // 4️⃣ Fetch customer details
        const { data: customerDetails, error: customerError } = await supabase
          .from("customers")
          .select("*")
          .eq("id", customerId)
          .single();

        if (customerError || !customerDetails) {
          console.error(`Customer not found for customer_id ${customerId}`, customerError);
          return null;
        }

        // 5️⃣ Return structured object
        return {
          perceptionData: perception,
          loanData: loanData[0],
          loanPackage,
          customerData: customerDetails,
        };
      })
    );

    const filteredResults = results.filter((item) => item !== null);

    return new Response(
      JSON.stringify({ success: true, data: filteredResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Unexpected server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
