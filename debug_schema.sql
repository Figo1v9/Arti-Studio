-- 1. Check Data Type of the ID column
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'id';

-- 2. Force PostgREST to reload the schema cache
-- This fixes 400 errors that happen when the API still thinks a column is UUID but it was changed to TEXT
NOTIFY pgrst, 'reload schema';
