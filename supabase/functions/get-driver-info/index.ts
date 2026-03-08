const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// GPU vendor categories to exclude competing vendors
const GPU_VENDOR_EXCLUSIONS: Record<string, string[]> = {
  nvidia: ['amd', 'radeon'],
  amd: ['nvidia', 'geforce'],
  intel: [], // Intel iGPU users may still need other GPU drivers
};

function normalizeOS(os: string): string {
  const lower = os.toLowerCase();
  if (lower.includes('windows')) return 'windows';
  if (lower.includes('mac')) return 'macos';
  if (lower.includes('linux') || lower.includes('ubuntu') || lower.includes('fedora')) return 'linux';
  if (lower.includes('chrome')) return 'chromeos';
  return lower;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hardware_keywords, os, gpu_vendor } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const normalizedOS = normalizeOS(os || '');

    // Query with OS compatibility filter
    let query = supabase
      .from('driver_catalog')
      .select('*')
      .order('category');

    // Filter by OS compatibility using the array contains operator
    if (normalizedOS) {
      query = query.contains('os_compatibility', [normalizedOS]);
    }

    const { data: allDrivers, error } = await query;

    if (error) {
      throw new Error(`DB error: ${error.message}`);
    }

    if (!allDrivers || allDrivers.length === 0) {
      return new Response(
        JSON.stringify({ outdated: [], upToDate: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine GPU vendor exclusions
    const gpuVendorLower = (gpu_vendor || '').toLowerCase();
    let excludedKeywords: string[] = [];
    for (const [vendor, exclusions] of Object.entries(GPU_VENDOR_EXCLUSIONS)) {
      if (gpuVendorLower.includes(vendor)) {
        excludedKeywords = exclusions;
        break;
      }
    }

    // Parse keywords with their categories
    interface KeywordHint {
      keyword: string;
      category: string;
    }
    const keywordHints: KeywordHint[] = (hardware_keywords || []).map((k: any) => {
      if (typeof k === 'object' && k.keyword) {
        return { keyword: k.keyword.toLowerCase(), category: (k.category || 'generic').toLowerCase() };
      }
      return { keyword: String(k).toLowerCase(), category: 'generic' };
    });

    const keywords = keywordHints.map(kh => kh.keyword);

    // Score each driver with improved matching
    const scoredDrivers = allDrivers.map(driver => {
      const driverKeywords = (driver.hardware_keywords || []).map((k: string) => k.toLowerCase());
      const driverCategory = (driver.category || '').toLowerCase();
      let score = 0;
      let matchType: 'exact' | 'partial' | 'generic' = 'generic';

      // Check if this driver belongs to an excluded GPU vendor
      if (excludedKeywords.length > 0 && (driverCategory.includes('display') || driverCategory.includes('graphics') || driverCategory.includes('video'))) {
        const isExcluded = excludedKeywords.some(ek =>
          driverKeywords.some(dk => dk.includes(ek)) || driver.name.toLowerCase().includes(ek)
        );
        if (isExcluded) {
          return { ...driver, score: -1, matchType: 'generic' as const };
        }
      }

      // Score by keyword matching
      for (const hint of keywordHints) {
        const kw = hint.keyword;
        for (const dk of driverKeywords) {
          // Exact match: keyword equals driver keyword
          if (dk === kw) {
            score += 3;
            matchType = 'exact';
          }
          // Strong partial: one contains the other, and both are 4+ chars (avoid short false positives)
          else if (kw.length >= 4 && dk.length >= 4 && (dk.includes(kw) || kw.includes(dk))) {
            score += 2;
            if (matchType !== 'exact') matchType = 'partial';
          }
          // Weak partial: shorter keywords
          else if (dk.includes(kw) || kw.includes(dk)) {
            score += 1;
            if (matchType === 'generic') matchType = 'partial';
          }
        }

        // Category alignment bonus: if the keyword's category hint matches the driver's category
        if (hint.category !== 'generic') {
          if (driverCategory.includes(hint.category)) {
            score += 2;
          }
        }
      }

      return { ...driver, score, matchType };
    });

    // Filter out excluded drivers (score = -1) and unmatched drivers
    let relevantDrivers = scoredDrivers
      .filter(d => d.score > 0)
      .sort((a, b) => b.score - a.score);

    // If too few matched, add some generic compatible ones (but NOT excluded vendors)
    if (relevantDrivers.length < 8 && keywords.length > 0) {
      const genericDrivers = scoredDrivers
        .filter(d => d.score === 0 && !relevantDrivers.find(r => r.id === d.id))
        .slice(0, 8 - relevantDrivers.length)
        .map(d => ({ ...d, matchType: 'generic' as const }));
      relevantDrivers = [...relevantDrivers, ...genericDrivers];
    }

    // If no keywords provided, use all OS-compatible drivers
    if (keywords.length === 0) {
      relevantDrivers = scoredDrivers.filter(d => d.score >= 0);
    }

    // Split into outdated and up-to-date
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
        matchConfidence: d.matchType || 'generic',
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
