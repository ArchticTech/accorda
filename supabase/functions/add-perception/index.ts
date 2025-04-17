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
    const { loanId, stage } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if perception already exists
    const { data: existingPerception, error: fetchError } = await supabase
      .from("perceptions")
      .select("*")
      .eq("loan_id", loanId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing perception:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    if (existingPerception) {
      return new Response(
        JSON.stringify({ success: false, message: "Perception for this loan already exists." }),
        { status: 409, headers: corsHeaders }
      );
    }

    // Insert new perception
    const { data, error } = await supabase
      .from("perceptions")
      .insert({
        loan_id: loanId,
        stage: stage,
      })
      .select();

    if (error) {
      console.error("Error adding perception:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
