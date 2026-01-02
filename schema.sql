CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE office_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE offices (
    id SERIAL PRIMARY KEY,

    office_type_id INT NOT NULL
        REFERENCES office_types(id)
        ON DELETE RESTRICT,

    name VARCHAR(150) NOT NULL,

    province VARCHAR(50),
    district VARCHAR(50),
    municipality VARCHAR(50),

    latitude DOUBLE PRECISION NOT NULL
        CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL
        CHECK (longitude BETWEEN -180 AND 180),

    geom GEOGRAPHY(Point, 4326) NOT NULL
);

CREATE TABLE ip_hashes (
    id SERIAL PRIMARY KEY,

    ip_hash VARCHAR(64) UNIQUE NOT NULL,
    first_seen TIMESTAMP DEFAULT now(),
    last_seen TIMESTAMP DEFAULT now()
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    office_id INT NOT NULL
        REFERENCES offices(id)
        ON DELETE CASCADE,

    ip_hash_id INT NOT NULL
        REFERENCES ip_hashes(id)
        ON DELETE CASCADE,

    bribe_amount NUMERIC(10,2),
    amount_range VARCHAR(20),

    report_week DATE NOT NULL,

    confidence_score FLOAT DEFAULT 0.1
        CHECK (confidence_score BETWEEN 0 AND 1),

    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE daily_limits (
    ip_hash_id INT NOT NULL
        REFERENCES ip_hashes(id)
        ON DELETE CASCADE,

    report_date DATE NOT NULL,
    report_count INT DEFAULT 1,

    PRIMARY KEY (ip_hash_id, report_date)
);

CREATE INDEX idx_offices_geom
ON offices
USING GIST (geom);

CREATE INDEX idx_offices_office_type
ON offices (office_type_id);

CREATE OR REPLACE FUNCTION set_office_geom()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(
    ST_MakePoint(NEW.longitude, NEW.latitude),
    4326
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_office_geom
BEFORE INSERT OR UPDATE ON offices
FOR EACH ROW
EXECUTE FUNCTION set_office_geom();

CREATE OR REPLACE FUNCTION update_ip_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ip_hashes SET last_seen = now()
  WHERE id = NEW.ip_hash_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_ip_last_seen
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION update_ip_last_seen();

CREATE INDEX idx_reports_office_week
ON reports (office_id, report_week);

CREATE INDEX idx_reports_ip_hash
ON reports (ip_hash_id);

CREATE UNIQUE INDEX uniq_weekly_report_per_ip
ON reports (office_id, ip_hash_id, report_week);
CREATE INDEX idx_daily_limits_report_date
ON daily_limits (report_date);

CREATE INDEX idx_daily_limits_ip_hash
ON daily_limits (ip_hash_id);