SET search_path TO public;

CREATE TABLE IF NOT EXISTS events(
  id bigserial PRIMARY KEY,
  name varchar(255) NOT NULL,
  description varchar(500) NOT NULL,
  date DATE NOT NULL,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_expenses(
  id bigserial PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  description varchar(255) NOT NULL,
  created_at timestamp(0) with time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp(0) with time zone NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_event_expenses_event_id ON event_expenses(event_id);