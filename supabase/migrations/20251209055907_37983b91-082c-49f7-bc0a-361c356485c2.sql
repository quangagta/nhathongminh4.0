-- Create table to store temperature history for 1 week
CREATE TABLE public.temperature_history (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2),
    gas_level DECIMAL(5,2),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.temperature_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access (sensor data is not sensitive)
CREATE POLICY "Anyone can read temperature history" 
ON public.temperature_history 
FOR SELECT 
USING (true);

-- Allow public insert (for edge functions to write data)
CREATE POLICY "Anyone can insert temperature history" 
ON public.temperature_history 
FOR INSERT 
WITH CHECK (true);

-- Create index for efficient querying by time
CREATE INDEX idx_temperature_history_recorded_at ON public.temperature_history(recorded_at DESC);

-- Create function to clean up old data (older than 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_temperature_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.temperature_history 
  WHERE recorded_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Enable realtime for temperature history
ALTER PUBLICATION supabase_realtime ADD TABLE public.temperature_history;