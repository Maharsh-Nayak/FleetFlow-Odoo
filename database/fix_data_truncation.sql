-- Fix Data Truncation Issue in FleetFlow Database
-- This script cleans up data that doesn't match the ENUM values

-- First, check what data exists in vehicles table
SELECT id, model, vehicle_type, status 
FROM vehicles 
WHERE vehicle_type NOT IN ('TRUCK', 'VAN', 'CAR', 'TRAILER', 'CONTAINER')
   OR status NOT IN ('AVAILABLE', 'IN_TRANSIT', 'IN_MAINTENANCE', 'INACTIVE');

-- Option 1: Delete vehicles with invalid types (RECOMMENDED)
-- Uncomment the line below to delete invalid records
-- DELETE FROM vehicles WHERE vehicle_type NOT IN ('TRUCK', 'VAN', 'CAR', 'TRAILER', 'CONTAINER');

-- Option 2: Update invalid types to valid values
-- UPDATE vehicles SET vehicle_type = 'TRUCK' WHERE vehicle_type NOT IN ('TRUCK', 'VAN', 'CAR', 'TRAILER', 'CONTAINER');
-- UPDATE vehicles SET status = 'AVAILABLE' WHERE status NOT IN ('AVAILABLE', 'IN_TRANSIT', 'IN_MAINTENANCE', 'INACTIVE');

-- After cleaning data, you can restart the server
