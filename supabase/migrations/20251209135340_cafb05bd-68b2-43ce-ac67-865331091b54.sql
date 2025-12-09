-- Create rainfall_history table to store rain sensor data
CREATE TABLE public.rainfall_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_raining BOOLEAN NOT NULL DEFAULT false,
  rain_intensity NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rainfall_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (sensor data is not sensitive)
CREATE POLICY "Anyone can read rainfall history" 
ON public.rainfall_history 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert rainfall history" 
ON public.rainfall_history 
FOR INSERT 
WITH CHECK (true);

-- Create cleanup function for old rainfall data (keep 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_rainfall_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rainfall_history 
  WHERE recorded_at < NOW() - INTERVAL '30 days';
END;
$$;