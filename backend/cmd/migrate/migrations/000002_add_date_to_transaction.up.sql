SET search_path TO public;

ALTER TABLE transactions
ADD COLUMN date timestamp(0) with time zone NOT NULL DEFAULT NOW();
