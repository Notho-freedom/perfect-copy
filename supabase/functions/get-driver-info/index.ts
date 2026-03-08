const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hardware_keywords, os } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all drivers from catalog
    const { data: allDrivers, error } = await supabase
      .from('driver_catalog')
      .select('*')
      .order('category');

    if (error) {
      throw new Error(`DB error: ${error.message}`);
    }

    if (!allDrivers || allDrivers.length === 0) {
      return new Response(
        JSON.stringify({ outdated: [], upToDate: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter drivers based on hardware keywords
    const keywords = (hardware_keywords || []).map((k: string) => k.toLowerCase());
    
    let relevantDrivers = allDrivers;
    if (keywords.length > 0) {
      // Score each driver by keyword match
      relevantDrivers = allDrivers
        .map(driver => {
          const driverKeywords = (driver.hardware_keywords || []).map((k: string) => k.toLowerCase());
          const score = keywords.filter((kw: string) => 
            driverKeywords.some((dk: string) => dk.includes(kw) || kw.includes(dk))
          ).length;
          return { ...driver, score };
        })
        .filter(d => d.score > 0)
        .sort((a, b) => b.score - a.score);
      
      // If too few matched, add some generic ones
      if (relevantDrivers.length < 8) {
        const genericDrivers = allDrivers
          .filter(d => !relevantDrivers.find(r => r.id === d.id))
          .slice(0, 8 - relevantDrivers.length);
        relevantDrivers = [...relevantDrivers, ...genericDrivers];
      }
    }

    // Split into outdated (version mismatch) and up-to-date
    const outdated = relevantDrivers
      .filter(d => d.installed_version !== d.latest_version)
      .map(d => ({
        id: d.id,
        name: d.name,
        category: d.category,
        currentVersion: d.installed_version,
        currentDate: d.installed_date,
        newVersion: d.latest_version,
        newDate: d.latest_date,
        isPro: d.is_pro,
        icon: d.icon,
        vendor: d.vendor,
        downloadSizeMb: d.download_size_mb,
        whqlCertified: d.whql_certified,
      }));

    const upToDate = allDrivers
      .filter(d => d.installed_version === d.latest_version)
      .map(d => d.name);

    return new Response(
      JSON.stringify({ outdated, upToDate }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
