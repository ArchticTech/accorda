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

    const { perId, stage } = await req.json();

    if (!perId || !stage) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing perId or stage" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { data: perceptionUpdate, error: perceptionError } = await supabase
      .from("perceptions")
      .update({ stage: stage })
      .eq("id", perId)
      .select();

    if (perceptionError) {
      console.error("Error updating perception stage:", perceptionError);
      return new Response(
        JSON.stringify({ success: false, error: perceptionError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: perceptionUpdate }),
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
