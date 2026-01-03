import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : {
      rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false
    }
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

export const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Query error:', err.message);
    throw err;
  }
};

export const addOffice = async (office) => {
  try {
    const lat = parseFloat(office.latitude);
    const lon = parseFloat(office.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    const sqlText = `
      INSERT INTO offices (
        office_type_id, name, province, district, municipality, geom
      ) VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($7, $6), 4326)::geography)
      RETURNING id, office_type_id, name, province, district, municipality, 
                ST_Y(geom::geometry) as latitude, ST_X(geom::geometry) as longitude, 
                created_at, updated_at;
    `;
    const values = [
      office.office_type_id,
      office.name,
      office.province || null,
      office.district || null,
      office.municipality || null,
      lat,
      lon
    ];

    const res = await pool.query(sqlText, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error inserting office:', err.message);
    throw err;
  }
};

export const getOrCreateIpHash = async (ipHash) => {
  try {
    const res = await pool.query(
      `INSERT INTO ip_hashes (ip_hash, first_seen, last_seen)
       VALUES ($1, NOW(), NOW())
       ON CONFLICT (ip_hash) 
       DO UPDATE SET last_seen = NOW()
       RETURNING id`,
      [ipHash]
    );
    return res.rows[0].id;
  } catch (err) {
    console.error('Error in getOrCreateIpHash:', err.message);
    throw err;
  }
};

export const createReport = async (report) => {
  const ipHashId = await getOrCreateIpHash(report.ipHash);

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const today = new Date().toISOString().split('T')[0];

    const dailyCheck = await client.query(
      'SELECT report_count FROM daily_limits WHERE ip_hash_id = $1 AND report_date = $2 FOR UPDATE',
      [ipHashId, today]
    );

    if (dailyCheck.rows.length > 0 && dailyCheck.rows[0].report_count >= 3) {
      throw new Error('Daily report limit reached');
    }

    let delay = null;
    if (report.delay !== undefined && report.delay !== null && report.delay !== '') {
      delay = parseInt(report.delay);
      if (isNaN(delay) || delay < 0) {
        throw new Error('Delay must be a non-negative integer');
      }
    }

    let bribeAmount = null;
    if (report.bribe_amount !== undefined && report.bribe_amount !== null && report.bribe_amount !== '') {
      bribeAmount = parseFloat(report.bribe_amount);
      if (isNaN(bribeAmount) || bribeAmount < 0) {
        throw new Error('Bribe amount must be non-negative');
      }
    }

    const reportResult = await client.query(
      `INSERT INTO reports (
        office_id, ip_hash_id, bribe_amount, delay, report_date, confidence_score
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        report.office_id,
        ipHashId,
        bribeAmount,
        delay,
        report.report_date,
        report.confidence_score || 0.1
      ]
    );

    await client.query(
      `INSERT INTO daily_limits (ip_hash_id, report_date, report_count)
       VALUES ($1, $2, 1)
       ON CONFLICT (ip_hash_id, report_date)
       DO UPDATE SET report_count = daily_limits.report_count + 1`,
      [ipHashId, today]
    );

    await client.query('COMMIT');
    return reportResult.rows[0];
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error creating report:', err.message);

    if (err.code === '23505') {
      throw new Error('A report for this office and day already exists from this IP');
    } else if (err.code === '23514') {
      if (err.message.includes('delay')) {
        throw new Error('Delay must be a non-negative integer');
      } else if (err.message.includes('bribe_amount')) {
        throw new Error('Bribe amount must be non-negative');
      } else if (err.message.includes('confidence_score')) {
        throw new Error('Confidence score must be between 0 and 1');
      }
      throw new Error('Invalid data: constraint violation');
    } else if (err.code === '23502') {
      throw new Error('Missing required field');
    }

    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getOfficesByType = async (officeTypeId) => {
  const result = await pool.query(
    `SELECT id, office_type_id, name, province, district, municipality, 
            ST_Y(geom::geometry) as latitude, ST_X(geom::geometry) as longitude, 
            created_at, updated_at 
     FROM offices 
     WHERE office_type_id = $1 
     ORDER BY name`,
    [officeTypeId]
  );
  return result.rows;
};

export const getOfficeTypes = async () => {
  const result = await pool.query(
    'SELECT * FROM office_types ORDER BY name'
  );
  return result.rows;
};

export const getOfficesNearby = async (latitude, longitude, radiusMeters = 5000) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const radius = parseFloat(radiusMeters);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (isNaN(lon) || lon < -180 || lon > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }
  if (isNaN(radius) || radius <= 0 || radius > 100000) {
    throw new Error('Radius must be between 0 and 100000 meters');
  }

  const result = await pool.query(
    `SELECT 
      o.id, o.office_type_id, o.name, o.province, o.district, o.municipality,
      ST_Y(o.geom::geometry) as latitude, ST_X(o.geom::geometry) as longitude,
      o.created_at, o.updated_at,
      ot.name as office_type_name,
      ST_Distance(
        o.geom,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
      ) as distance
    FROM offices o
    JOIN office_types ot ON o.office_type_id = ot.id
    WHERE ST_DWithin(
      o.geom,
      ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
      $3
    )
    ORDER BY distance`,
    [lat, lon, radius]
  );
  return result.rows;
};

export const getReportsByOffice = async (officeId, limit = 50) => {
  const sanitizedLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 1000);

  const result = await pool.query(
    `SELECT 
      r.*,
      o.name as office_name,
      ot.name as office_type_name
    FROM reports r
    JOIN offices o ON r.office_id = o.id
    JOIN office_types ot ON o.office_type_id = ot.id
    WHERE r.office_id = $1
    ORDER BY r.created_at DESC
    LIMIT $2`,
    [officeId, sanitizedLimit]
  );
  return result.rows;
};

export const addIpHash = async (ipHashData) => {
  const queryText = `
    INSERT INTO ip_hashes (id, ip_hash, first_seen, last_seen)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (id) DO NOTHING
    RETURNING *;
  `;
  const values = [
    ipHashData.id,
    ipHashData.ip_hash,
    ipHashData.first_seen || new Date(),
    ipHashData.last_seen || new Date()
  ];
  return pool.query(queryText, values);
};

export const addReportRaw = async (report) => {
  let delay = null;
  if (report.delay !== undefined && report.delay !== null) {
    delay = parseInt(report.delay);
    if (isNaN(delay) || delay < 0) {
      throw new Error('Delay must be a non-negative integer');
    }
  }

  const queryText = `
    INSERT INTO reports (
      office_id, ip_hash_id, bribe_amount, delay, report_date, confidence_score, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    report.office_id,
    report.ip_hash_id,
    report.bribe_amount || null,
    delay,
    report.report_date,
    report.confidence_score || 0.1,
    report.created_at || new Date()
  ];
  return pool.query(queryText, values);
};

export const end = async () => {
  await pool.end();
  console.log('Database pool has ended');
};

export const getOfficeTypeById = async (id) => {
  const res = await pool.query('SELECT * FROM office_types WHERE id = $1', [id]);
  return res.rows[0];
};

export const addOfficeType = async (name) => {
  const res = await pool.query(
    'INSERT INTO office_types (name) VALUES ($1) RETURNING *',
    [name]
  );
  return res.rows[0];
};

export const updateOfficeType = async (id, name) => {
  const res = await pool.query(
    'UPDATE office_types SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  );
  return res.rows[0];
};

export const deleteOfficeType = async (id) => {
  const res = await pool.query(
    'DELETE FROM office_types WHERE id = $1 RETURNING *',
    [id]
  );
  return res.rows[0];
};

export const getAllOffices = async () => {
  const result = await pool.query(
    `SELECT o.id, o.office_type_id, o.name, o.province, o.district, o.municipality, 
            ST_Y(o.geom::geometry) as latitude, ST_X(o.geom::geometry) as longitude, 
            o.created_at, o.updated_at, ot.name as office_type_name 
     FROM offices o
     JOIN office_types ot ON o.office_type_id = ot.id
     ORDER BY o.name`
  );
  return result.rows;
};

export const getFilteredOffices = async ({ officeTypeId }) => {
  let queryText = `
    SELECT o.id, o.office_type_id, o.name, o.province, o.district, o.municipality, 
           ST_Y(o.geom::geometry) as latitude, ST_X(o.geom::geometry) as longitude, 
           o.created_at, o.updated_at, ot.name as office_type_name 
    FROM offices o
    JOIN office_types ot ON o.office_type_id = ot.id
    WHERE 1=1
  `;
  const values = [];

  if (officeTypeId && officeTypeId !== 'all') {
    values.push(officeTypeId);
    queryText += ` AND o.office_type_id = $${values.length}`;
  }

  queryText += ` ORDER BY o.name`;

  const result = await pool.query(queryText, values);
  return result.rows;
};

export const getOfficeById = async (id) => {
  const res = await pool.query(
    `SELECT o.id, o.office_type_id, o.name, o.province, o.district, o.municipality, 
            ST_Y(o.geom::geometry) as latitude, ST_X(o.geom::geometry) as longitude, 
            o.created_at, o.updated_at, ot.name as office_type_name 
     FROM offices o
     JOIN office_types ot ON o.office_type_id = ot.id
     WHERE o.id = $1`,
    [id]
  );
  return res.rows[0];
};

export const updateOffice = async (id, updates) => {
  const fields = Object.keys(updates);

  if (fields.length === 0) return null;

  if (updates.latitude !== undefined) {
    const lat = parseFloat(updates.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    updates.latitude = lat;
  }
  if (updates.longitude !== undefined) {
    const lon = parseFloat(updates.longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
    updates.longitude = lon;
  }

  // Separate regular fields from coordinate fields
  const filteredFields = fields.filter(field =>
    field !== 'updated_at' && field !== 'latitude' && field !== 'longitude'
  );
  const values = filteredFields.map(field => updates[field]);

  // Build SET clauses for regular fields
  let setClauses = filteredFields.map((field, index) => `${field} = $${index + 2}`);

  // Handle coordinate updates separately for clarity
  const hasCoordUpdates = updates.latitude !== undefined || updates.longitude !== undefined;

  if (hasCoordUpdates) {
    // Get current or new values
    let latParam, lonParam;
    let paramIndex = values.length + 2;

    if (updates.latitude !== undefined && updates.longitude !== undefined) {
      // Both coordinates provided
      latParam = `$${paramIndex}`;
      lonParam = `$${paramIndex + 1}`;
      values.push(updates.latitude, updates.longitude);
    } else if (updates.latitude !== undefined) {
      // Only latitude provided
      latParam = `$${paramIndex}`;
      lonParam = 'ST_X(geom::geometry)';
      values.push(updates.latitude);
    } else {
      // Only longitude provided
      latParam = 'ST_Y(geom::geometry)';
      lonParam = `$${paramIndex}`;
      values.push(updates.longitude);
    }

    setClauses.push(`geom = ST_SetSRID(ST_MakePoint(${lonParam}, ${latParam}), 4326)::geography`);
  }

  if (setClauses.length === 0) {
    return getOfficeById(id);
  }

  const setString = setClauses.join(', ');

  const res = await pool.query(
    `UPDATE offices SET ${setString} WHERE id = $1 
     RETURNING id, office_type_id, name, province, district, municipality, 
               ST_Y(geom::geometry) as latitude, ST_X(geom::geometry) as longitude, 
               created_at, updated_at`,
    [id, ...values]
  );
  return res.rows[0];
};

export const deleteOffice = async (id) => {
  const res = await pool.query(
    'DELETE FROM offices WHERE id = $1 RETURNING *',
    [id]
  );
  return res.rows[0];
};

export const searchOfficesByName = async (searchTerm) => {
  const res = await pool.query(
    `SELECT o.id, o.office_type_id, o.name, o.province, o.district, o.municipality, 
            ST_Y(o.geom::geometry) as latitude, ST_X(o.geom::geometry) as longitude, 
            o.created_at, o.updated_at, ot.name as office_type_name
     FROM offices o
     JOIN office_types ot ON o.office_type_id = ot.id
     WHERE o.name ILIKE $1
     ORDER BY o.name`,
    [`%${searchTerm}%`]
  );
  return res.rows;
};

export const getOfficesByProvince = async (province) => {
  const res = await pool.query(
    `SELECT id, office_type_id, name, province, district, municipality, 
            ST_Y(geom::geometry) as latitude, ST_X(geom::geometry) as longitude, 
            created_at, updated_at 
     FROM offices 
     WHERE province = $1 
     ORDER BY name`,
    [province]
  );
  return res.rows;
};

export const getOfficesByDistrict = async (district) => {
  const res = await pool.query(
    `SELECT id, office_type_id, name, province, district, municipality, 
            ST_Y(geom::geometry) as latitude, ST_X(geom::geometry) as longitude, 
            created_at, updated_at 
     FROM offices 
     WHERE district = $1 
     ORDER BY name`,
    [district]
  );
  return res.rows;
};

export const getProvinces = async () => {
  const res = await pool.query(
    'SELECT DISTINCT province FROM offices WHERE province IS NOT NULL ORDER BY province'
  );
  return res.rows.map(row => row.province);
};

export const getOfficesByMunicipality = async (municipality) => {
  const res = await pool.query(
    `SELECT id, office_type_id, name, province, district, municipality, 
            ST_Y(geom::geometry) as latitude, ST_X(geom::geometry) as longitude, 
            created_at, updated_at 
     FROM offices 
     WHERE municipality = $1 
     ORDER BY name`,
    [municipality]
  );
  return res.rows;
};

export const getIpHashInfo = async (ipHashStr) => {
  const res = await pool.query(
    'SELECT * FROM ip_hashes WHERE ip_hash = $1',
    [ipHashStr]
  );
  return res.rows[0];
};

export const getIpHashById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM ip_hashes WHERE id = $1',
    [id]
  );
  return res.rows[0];
};

export const getReportById = async (id) => {
  console.log('Fetching report by ID:', id);
  try {
    const res = await pool.query(
      `SELECT r.*, o.name as office_name, ot.name as office_type_name
       FROM reports r
       JOIN offices o ON r.office_id = o.id
       JOIN office_types ot ON o.office_type_id = ot.id
       WHERE r.id = $1`,
      [id]
    );
    console.log(`Found ${res.rowCount} reports for ID: ${id}`);
    return res.rows[0];
  } catch (error) {
    console.error('Database error in getReportById:', error);
    throw error;
  }
};

export const getReportsByIpHash = async (ipHash, limit = 50) => {
  const res = await pool.query(
    `SELECT r.*, o.name as office_name
     FROM reports r
     JOIN ip_hashes ip ON r.ip_hash_id = ip.id
     JOIN offices o ON r.office_id = o.id
     WHERE ip.ip_hash = $1
     ORDER BY r.created_at DESC
     LIMIT $2`,
    [ipHash, limit]
  );
  return res.rows;
};

export const deleteReport = async (id) => {
  const res = await pool.query(
    'DELETE FROM reports WHERE id = $1 RETURNING *',
    [id]
  );
  return res.rows[0];
};

export const getOfficeStats = async (officeId) => {
  const res = await pool.query(
    `SELECT 
       COUNT(*) as total_reports,
       AVG(bribe_amount) as avg_bribe_amount,
       MIN(bribe_amount) as min_bribe,
       MAX(bribe_amount) as max_bribe,
       AVG(delay) as avg_delay,
       MIN(delay) as min_delay,
       MAX(delay) as max_delay,
       MAX(created_at) as last_reported
     FROM reports
     WHERE office_id = $1`,
    [officeId]
  );
  return res.rows[0];
};

export const getTopCorruptOffices = async (limit = 10) => {
  const res = await pool.query(
    `SELECT 
       o.id, 
       o.name, 
       o.province, 
       o.district, 
       ot.name as office_type,
       COUNT(r.id) as report_count,
       AVG(r.bribe_amount) as avg_bribe
     FROM offices o
     JOIN reports r ON o.id = r.office_id
     JOIN office_types ot ON o.office_type_id = ot.id
     GROUP BY o.id, ot.name
     ORDER BY report_count DESC
     LIMIT $1`,
    [limit]
  );
  return res.rows;
};

export const getRecentReports = async (limit = 20) => {
  const res = await pool.query(
    `SELECT 
       r.*, 
       o.name as office_name,
       o.district
     FROM reports r
     JOIN offices o ON r.office_id = o.id
     ORDER BY r.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return res.rows;
};

export const getDailyLimitStatus = async (ipHash, date) => {
  const res = await pool.query(
    `SELECT dl.* 
     FROM daily_limits dl
     JOIN ip_hashes ip ON dl.ip_hash_id = ip.id
     WHERE ip.ip_hash = $1 AND dl.report_date = $2`,
    [ipHash, date]
  );
  return res.rows[0];
};


export const getOfficesSeverityMap = async () => {
  const res = await pool.query(
    `SELECT 
       o.id,
       o.name,
       o.province,
       o.district,
       o.municipality,
       ST_Y(o.geom::geometry) as latitude,
       ST_X(o.geom::geometry) as longitude,
       ot.name as office_type,
       COUNT(r.id) as report_count,
       COALESCE(AVG(r.bribe_amount), 0) as avg_bribe,
       COALESCE(AVG(r.delay), 0) as avg_delay,
       COALESCE(AVG(r.confidence_score), 0) as avg_confidence,
       MAX(r.created_at) as last_report_date,
       -- Calculate severity score (0-100)
       LEAST(100, 
         (COUNT(r.id) * 10) + 
         (COALESCE(AVG(r.bribe_amount), 0) / 100) + 
         (COALESCE(AVG(r.delay), 0) / 10) +
         (COALESCE(AVG(r.confidence_score), 0) * 20)
       ) as severity_score
     FROM offices o
     JOIN office_types ot ON o.office_type_id = ot.id
     LEFT JOIN reports r ON o.id = r.office_id
     GROUP BY o.id, ot.name
     ORDER BY severity_score DESC`
  );

  // Calculate min/max for normalization
  const scores = res.rows.map(row => parseFloat(row.severity_score) || 0);
  const maxScore = Math.max(...scores, 1);
  const minScore = Math.min(...scores.filter(s => s > 0), 0);

  // Add visualization properties to each office
  return res.rows.map(office => {
    const score = parseFloat(office.severity_score) || 0;
    const reportCount = parseInt(office.report_count) || 0;

    // Normalize score to 0-1 range
    const normalizedScore = maxScore > minScore
      ? (score - minScore) / (maxScore - minScore)
      : 0;

    const radius = reportCount > 0
      ? Math.min(10 + (reportCount * 3), 40)
      : 0;

    const opacity = 0.3 + (normalizedScore * 0.5);
    const red = Math.floor(255 - (normalizedScore * 55));
    const green = Math.floor(100 - (normalizedScore * 100));
    const color = `rgba(${red}, ${green}, 0, ${opacity})`;
    const borderColor = `rgba(${red - 50}, 0, 0, 0.9)`;

    return {
      ...office,
      report_count: reportCount,
      avg_bribe: parseFloat(office.avg_bribe) || 0,
      avg_delay: parseFloat(office.avg_delay) || 0,
      avg_confidence: parseFloat(office.avg_confidence) || 0,
      severity_score: score,
      normalized_score: normalizedScore,
      circle: {
        radius,
        color,
        borderColor,
        show: reportCount > 0
      }
    };
  });
};

export const getGlobalStatsForToday = async () => {
  const today = new Date().toISOString().split('T')[0];
  const res = await pool.query(
    `SELECT 
       COUNT(*) as total_reports,
       COALESCE(AVG(bribe_amount), 0) as avg_bribe,
       COALESCE(AVG(delay), 0) as avg_delay
     FROM reports
     WHERE report_date = $1`,
    [today]
  );
  return res.rows[0];
};

export default pool;
