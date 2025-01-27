-- Agregar el campo device_id a party_registrations
ALTER TABLE party_registrations
ADD COLUMN device_id TEXT NOT NULL;