-- Add analytics preferences to notification settings
ALTER TABLE notification_settings
ADD COLUMN analytics_enabled boolean DEFAULT true;