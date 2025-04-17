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

    const { loanRequestId } = await req.json();

    if (!loanRequestId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing loanRequestId" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch Loan Request with loan details
    const { data: loanRequest, error: loanRequestError } = await supabase
      .from("loan_requests")
      .select(`
        *,
        loans:loan_id (*)
      `)
      .eq("id", loanRequestId)
      .single();

    if (loanRequestError) {
      console.error(`Error fetching loan request with ID ${loanRequestId}:`, loanRequestError);
      return new Response(
        JSON.stringify({ success: false, error: loanRequestError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Fetch References
    const { data: references, error: referencesError } = await supabase
      .from("references")
      .select("*")
      .eq("loan_request_id", loanRequestId)
      .order("reference_order", { ascending: true });

    if (referencesError) {
      console.error("Error fetching references:", referencesError);
      return new Response(
        JSON.stringify({ success: false, error: referencesError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Fetch Status History
    const { data: statusHistory, error: statusHistoryError } = await supabase
      .from("loan_status_history")
      .select("*")
      .eq("loan_request_id", loanRequestId)
      .order("created_at", { ascending: true });

    if (statusHistoryError) {
      console.error("Error fetching status history:", statusHistoryError);
      return new Response(
        JSON.stringify({ success: false, error: statusHistoryError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Fetch Documents
    const { data: documents, error: documentsError } = await supabase
      .from("loan_documents")
      .select("*")
      .eq("loan_request_id", loanRequestId)
      .order("created_at", { ascending: false });

    if (documentsError) {
      console.error("Error fetching documents:", documentsError);
      return new Response(
        JSON.stringify({ success: false, error: documentsError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Format the final result
    const result = {
      loanRequest: {
        ...loanRequest,
        loan_id: loanRequest.loan_id,
      },
      loan: loanRequest.loans,
      references: references || [],
      statusHistory: statusHistory || [],
      documents: documents.length > 0 ? documents : undefined,
    };

    return new Response(
      JSON.stringify({ success: true, data: result }),
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
