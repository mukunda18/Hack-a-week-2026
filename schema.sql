CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tables
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
    geom GEOGRAPHY(Point, 4326) NOT NULL,
    severity_score FLOAT DEFAULT 0,
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
    bribe_amount NUMERIC(15,2)
        CHECK (bribe_amount IS NULL OR bribe_amount >= 0),
    delay INT
        CHECK (delay IS NULL OR delay >= 0),
    service_type VARCHAR(100),
    description TEXT,
    visit_time TIME,
    interaction_method VARCHAR(50),
    outcome VARCHAR(50),          
    report_date DATE NOT NULL,
    confidence_score FLOAT DEFAULT 0.5 NOT NULL
        CHECK (confidence_score BETWEEN 0 AND 1),
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,

    CONSTRAINT unique_daily_report_per_ip 
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

-- Indexes
CREATE INDEX idx_offices_geom ON offices USING GIST (geom);
CREATE INDEX idx_offices_office_type_id ON offices (office_type_id);
CREATE INDEX idx_offices_province ON offices (province) WHERE province IS NOT NULL;
CREATE INDEX idx_offices_district ON offices (district) WHERE district IS NOT NULL;
CREATE INDEX idx_offices_municipality ON offices (municipality) WHERE municipality IS NOT NULL;
CREATE INDEX idx_offices_name ON offices (name);

CREATE INDEX idx_reports_service_type ON reports (service_type);
CREATE INDEX idx_reports_interaction_method ON reports (interaction_method);
CREATE INDEX idx_reports_outcome ON reports (outcome);
CREATE INDEX idx_reports_office_recency ON reports (office_id, created_at DESC);
CREATE INDEX idx_reports_visit_time ON reports (visit_time);
CREATE INDEX idx_reports_office_week ON reports (office_id, report_date DESC);
CREATE INDEX idx_reports_created_at ON reports (created_at DESC);
CREATE INDEX idx_reports_ip_hash_id ON reports (ip_hash_id);

CREATE INDEX idx_daily_limits_report_date ON daily_limits (report_date DESC);


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

CREATE OR REPLACE FUNCTION recalculate_office_severity(off_id INT)
RETURNS VOID AS $$
DECLARE
    total_system_reports INT;
BEGIN
    SELECT COUNT(*) INTO total_system_reports 
    FROM reports 
    WHERE created_at > NOW() - INTERVAL '90 days';

    UPDATE offices
    SET severity_score = (
        SELECT 
            COALESCE(
                SUM((r.bribe_amount / 100.0 + r.delay * 10.0) * r.confidence_score) * 
                (COUNT(r.id)::float / NULLIF(total_system_reports, 0)) * 100.0,
                0
            )
        FROM reports r
        WHERE r.office_id = off_id 
        AND r.created_at > NOW() - INTERVAL '90 days'
    )
    WHERE id = off_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trg_func_update_office_severity()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        PERFORM recalculate_office_severity(NEW.office_id);
    ELSIF (TG_OP = 'DELETE') THEN
        PERFORM recalculate_office_severity(OLD.office_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
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

CREATE TRIGGER trg_update_office_severity
AFTER INSERT OR UPDATE OR DELETE ON reports
FOR EACH ROW
EXECUTE FUNCTION trg_func_update_office_severity();