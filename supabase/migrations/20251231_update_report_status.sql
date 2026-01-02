-- Function to update report status securely
-- This is needed because direct table updates might be blocked by RLS policies
CREATE OR REPLACE FUNCTION update_report_status(p_report_id UUID, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE reports
  SET status = p_status
  WHERE id = p_report_id;
END;
$$;
