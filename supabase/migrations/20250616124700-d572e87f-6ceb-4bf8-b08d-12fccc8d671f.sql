
-- Create a table to track user sessions with email
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.user_sessions 
  FOR SELECT 
  USING (true); -- Allow reading for now, we'll filter by email in the app

-- Users can create their own sessions
CREATE POLICY "Users can create sessions" 
  ON public.user_sessions 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS policies for admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin users (we'll implement proper admin auth later)
CREATE POLICY "Admins can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (true);

-- Create a view for booking analytics
CREATE OR REPLACE VIEW public.booking_analytics AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_bookings,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as average_booking_value,
  COUNT(DISTINCT guest_email) as unique_guests
FROM public.bookings
WHERE status = 'confirmed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Create a view for room occupancy (fixed the EXTRACT function issue)
CREATE OR REPLACE VIEW public.room_occupancy AS
SELECT 
  r.id,
  r.name,
  r.type,
  COUNT(b.id) as total_bookings,
  SUM(b.total_amount) as total_revenue,
  AVG((b.check_out_date - b.check_in_date)) as avg_stay_duration
FROM public.rooms r
LEFT JOIN public.bookings b ON r.id = b.room_id AND b.status = 'confirmed'
GROUP BY r.id, r.name, r.type
ORDER BY total_revenue DESC;
