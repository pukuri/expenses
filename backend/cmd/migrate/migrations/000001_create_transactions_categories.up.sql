SET search_path TO public;

CREATE TABLE IF NOT EXISTS categories(
  id bigserial PRIMARY KEY,
  name varchar(100) UNIQUE NOT NULL,
  color varchar(20) UNIQUE NOT NULL,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions(
  id bigserial PRIMARY KEY,
  category_id BIGINT NULL REFERENCES categories(id) ON DELETE SET NULL,
  amount INT NOT NULL,
  running_balance INT NOT NULL,
  description varchar(255) NOT NULL,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
