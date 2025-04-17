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

    const { requestId, status } = await req.json();

    if (!requestId || !status) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing requestId or status" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: loanRequestUpdate, error: loanRequestError } = await supabase
      .from("loan_requests")
      .update({ status })
      .eq("id", requestId)
      .select();

    if (loanRequestError) {
      console.error("Error updating loan request:", loanRequestError);
      return new Response(
        JSON.stringify({ success: false, error: loanRequestError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: loanRequestUpdate }),
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
