-- Create table for trading signals
CREATE TABLE public.signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset VARCHAR(50) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('CALL', 'PUT')),
  probability DECIMAL(5,2) NOT NULL CHECK (probability >= 0 AND probability <= 100),
  market_type VARCHAR(20) NOT NULL CHECK (market_type IN ('OTC', 'OPEN')),
  expiration_time INTEGER NOT NULL DEFAULT 5,
  indicators_used TEXT[],
  ai_reasoning TEXT,
  result VARCHAR(10) CHECK (result IN ('WIN', 'LOSS', 'PENDING', NULL)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE
);

-- Create table for AI learning data
CREATE TABLE public.ai_learning_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id UUID REFERENCES public.signals(id) ON DELETE CASCADE,
  pattern_type VARCHAR(100),
  market_conditions JSONB,
  success_rate DECIMAL(5,2),
  learned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for performance metrics
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_signals INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  accuracy DECIMAL(5,2) DEFAULT 0,
  market_type VARCHAR(20) CHECK (market_type IN ('OTC', 'OPEN')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date, market_type)
);

-- Enable RLS
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Public read access for signals (app is public)
CREATE POLICY "Anyone can read signals" ON public.signals FOR SELECT USING (true);
CREATE POLICY "Anyone can insert signals" ON public.signals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update signals" ON public.signals FOR UPDATE USING (true);

-- Public access for AI learning data
CREATE POLICY "Anyone can read learning data" ON public.ai_learning_data FOR SELECT USING (true);
CREATE POLICY "Anyone can insert learning data" ON public.ai_learning_data FOR INSERT WITH CHECK (true);

-- Public access for performance metrics
CREATE POLICY "Anyone can read metrics" ON public.performance_metrics FOR SELECT USING (true);
CREATE POLICY "Anyone can insert metrics" ON public.performance_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update metrics" ON public.performance_metrics FOR UPDATE USING (true);

-- Enable realtime for signals
ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;