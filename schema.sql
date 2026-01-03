CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE office_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE offices (
    id SERIAL PRIMARY KEY,

    office_type_id INT NOT NULL
        REFERENCES office_types(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    name VARCHAR(150) NOT NULL,

    province VARCHAR(50),
    district VARCHAR(50),
    municipality VARCHAR(50),

    latitude DOUBLE PRECISION NOT NULL
        CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL
        CHECK (longitude BETWEEN -180 AND 180),

    geom GEOGRAPHY(Point, 4326) NOT NULL,

    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE ip_hashes (
    id SERIAL PRIMARY KEY,

    ip_hash VARCHAR(64) UNIQUE NOT NULL,
    
    first_seen TIMESTAMP DEFAULT now() NOT NULL,
    last_seen TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    office_id INT NOT NULL
        REFERENCES offices(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    ip_hash_id INT NOT NULL
        REFERENCES ip_hashes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    bribe_amount NUMERIC(10,2)
        CHECK (bribe_amount IS NULL OR bribe_amount >= 0),

    delay INT
        CHECK (delay IS NULL OR delay >= 0),

    report_date DATE NOT NULL,
    confidence_score FLOAT DEFAULT 0.1 NOT NULL
        CHECK (confidence_score BETWEEN 0 AND 1),

    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,

    CONSTRAINT unique_weekly_report_per_ip 
        UNIQUE (office_id, ip_hash_id, report_date)
);

CREATE TABLE daily_limits (
    ip_hash_id INT NOT NULL
        REFERENCES ip_hashes(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    report_date DATE NOT NULL,
    report_count INT DEFAULT 1 NOT NULL
        CHECK (report_count >= 0),

    PRIMARY KEY (ip_hash_id, report_date)
);

CREATE INDEX idx_offices_geom
ON offices
USING GIST (geom);

CREATE INDEX idx_offices_office_type_id
ON offices (office_type_id);

CREATE INDEX idx_reports_office_id
ON reports (office_id);

CREATE INDEX idx_reports_ip_hash_id
ON reports (ip_hash_id);

CREATE INDEX idx_daily_limits_ip_hash_id
ON daily_limits (ip_hash_id);

CREATE INDEX idx_offices_province
ON offices (province)
WHERE province IS NOT NULL;

CREATE INDEX idx_offices_district
ON offices (district)
WHERE district IS NOT NULL;

CREATE INDEX idx_offices_municipality
ON offices (municipality)
WHERE municipality IS NOT NULL;

CREATE INDEX idx_offices_name
ON offices (name);

CREATE INDEX idx_reports_office_week
ON reports (office_id, report_date DESC);

CREATE INDEX idx_reports_created_at
ON reports (created_at DESC);

CREATE INDEX idx_daily_limits_report_date
ON daily_limits (report_date DESC);

CREATE INDEX idx_ip_hashes_hash
ON ip_hashes (ip_hash);

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

CREATE OR REPLACE FUNCTION update_ip_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ip_hashes 
    SET last_seen = now()
    WHERE id = NEW.ip_hash_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_office_geom
BEFORE INSERT OR UPDATE OF latitude, longitude ON offices
FOR EACH ROW
EXECUTE FUNCTION set_office_geom();

CREATE TRIGGER trg_update_ip_last_seen
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION update_ip_last_seen();

CREATE TRIGGER trg_office_types_updated_at
BEFORE UPDATE ON office_types
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_offices_updated_at
BEFORE UPDATE ON offices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();