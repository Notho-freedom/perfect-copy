
CREATE TABLE public.driver_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT NOT NULL,
  installed_version TEXT NOT NULL,
  installed_date DATE NOT NULL,
  latest_version TEXT NOT NULL,
  latest_date DATE NOT NULL,
  is_pro BOOLEAN NOT NULL DEFAULT false,
  icon TEXT NOT NULL DEFAULT 'Monitor',
  hardware_keywords TEXT[] NOT NULL DEFAULT '{}',
  os_compatibility TEXT[] NOT NULL DEFAULT '{windows}',
  download_size_mb NUMERIC(6,2) DEFAULT 0,
  whql_certified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.scan_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  scan_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  os_detected TEXT,
  cpu_detected TEXT,
  gpu_detected TEXT,
  ram_gb NUMERIC(6,1),
  drivers_found INTEGER NOT NULL DEFAULT 0,
  outdated_count INTEGER NOT NULL DEFAULT 0,
  up_to_date_count INTEGER NOT NULL DEFAULT 0,
  scan_duration_ms INTEGER
);

CREATE TABLE public.driver_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  category TEXT NOT NULL,
  from_version TEXT NOT NULL,
  to_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'rolled-back')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read driver catalog" ON public.driver_catalog FOR SELECT USING (true);
CREATE POLICY "Anyone can insert scan history" ON public.scan_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read scan history" ON public.scan_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert driver updates" ON public.driver_updates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read driver updates" ON public.driver_updates FOR SELECT USING (true);
