
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  category text NOT NULL,
  setting_key text NOT NULL,
  setting_value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, category, setting_key)
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read user settings"
  ON public.user_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert user settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update user settings"
  ON public.user_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);
