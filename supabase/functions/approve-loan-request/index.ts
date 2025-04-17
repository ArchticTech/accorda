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

    const { loanId, requestStatus } = await req.json();

    if (!loanId || !requestStatus) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing loanId or requestStatus in request body" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // First update admin_request_status
    const { data: loanRequestUpdate, error: loanRequestError } = await supabase
      .from("loan_requests")
      .update({ admin_request_status: requestStatus })
      .eq("id", loanId)
      .select();

    if (loanRequestError) {
      console.error("Error updating admin_request_status:", loanRequestError);
      return new Response(
        JSON.stringify({ success: false, error: loanRequestError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Then update status to "reviewing documents"
    const { data: statusData, error: statusError } = await supabase
      .from("loan_requests")
      .update({ status: "reviewing documents" })
      .eq("id", loanId)
      .select();

    if (statusError) {
      console.error("Error updating status:", statusError);
      return new Response(
        JSON.stringify({ success: false, error: statusError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: loanRequestUpdate, status: statusData }),
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
