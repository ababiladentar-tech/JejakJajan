# Additional PostgreSQL migration file for initial setup
# Run this to setup database in production

BEGIN;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_userid ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_lat_lon ON vendors(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_location_history_vendor_date ON location_history(vendor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON reviews(buyer_id);

COMMIT;
