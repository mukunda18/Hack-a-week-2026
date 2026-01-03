import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
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
    const sqlText = `
      INSERT INTO offices (
        office_type_id, name, province, district, municipality, latitude, longitude
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      office.office_type_id,
      office.name,
      office.province || null,
      office.district || null,
      office.municipality || null,
      office.latitude,
      office.longitude
    ];

    const res = await pool.query(sqlText, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error inserting office:', err.message);
    throw err;
  }
};

export const getOrCreateIpHash = async (ipHash) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let result = await client.query(
      'SELECT id FROM ip_hashes WHERE ip_hash = $1',
      [ipHash]
    );

    if (result.rows.length > 0) {
      await client.query(
        'UPDATE ip_hashes SET last_seen = NOW() WHERE ip_hash = $1',
        [ipHash]
      );
      await client.query('COMMIT');
      return result.rows[0].id;
    }

    result = await client.query(
      'INSERT INTO ip_hashes (ip_hash) VALUES ($1) RETURNING id',
      [ipHash]
    );

    await client.query('COMMIT');
    return result.rows[0].id;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const createReport = async (report) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ipHashId = await getOrCreateIpHash(report.ipHash);

    const today = new Date().toISOString().split('T')[0];
    const dailyCheck = await client.query(
      'SELECT report_count FROM daily_limits WHERE ip_hash_id = $1 AND report_date = $2',
      [ipHashId, today]
    );

    if (dailyCheck.rows.length > 0 && dailyCheck.rows[0].report_count >= 3) {
      throw new Error('Daily report limit reached');
    }

    const reportResult = await client.query(
      `INSERT INTO reports (
        office_id, ip_hash_id, bribe_amount, amount_range, report_week, confidence_score
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        report.office_id,
        ipHashId,
        report.bribe_amount || null,
        report.amount_range || null,
        report.report_week,
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
    await client.query('ROLLBACK');
    console.error('Error creating report:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

export const getOfficesByType = async (officeTypeId) => {
  const result = await pool.query(
    'SELECT * FROM offices WHERE office_type_id = $1 ORDER BY name',
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
  const result = await pool.query(
    `SELECT 
      o.*,
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
    [latitude, longitude, radiusMeters]
  );
  return result.rows;
};

export const getReportsByOffice = async (officeId, limit = 50) => {
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
    [officeId, limit]
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
    ipHashData.first_seen,
    ipHashData.last_seen
  ];
  return pool.query(queryText, values);
};

export const addReportRaw = async (report) => {
  const queryText = `
    INSERT INTO reports (
      office_id, ip_hash_id, bribe_amount, amount_range, report_week, confidence_score, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    report.office_id,
    report.ip_hash_id,
    report.bribe_amount || null,
    report.amount_range || null,
    report.report_week,
    report.confidence_score || 0.1,
    report.created_at || new Date()
  ];
  return pool.query(queryText, values);
};

export const end = async () => {
  await pool.end();
  console.log('Database pool has ended');
};

// --- Office Types ---

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

// --- Offices ---

export const getOfficeById = async (id) => {
  const res = await pool.query(
    `SELECT o.*, ot.name as office_type_name 
     FROM offices o
     JOIN office_types ot ON o.office_type_id = ot.id
     WHERE o.id = $1`,
    [id]
  );
  return res.rows[0];
};

export const updateOffice = async (id, updates) => {
  // updates is an object like { name: 'New Name', district: 'New District' }
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) return null;

  const setString = fields
    .map((field, index) => `${field} = $${index + 2}`)
    .join(', ');

  const res = await pool.query(
    `UPDATE offices SET ${setString} WHERE id = $1 RETURNING *`,
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
    `SELECT o.*, ot.name as office_type_name
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
    'SELECT * FROM offices WHERE province = $1 ORDER BY name',
    [province]
  );
  return res.rows;
};

export const getOfficesByDistrict = async (district) => {
  const res = await pool.query(
    'SELECT * FROM offices WHERE district = $1 ORDER BY name',
    [district]
  );
  return res.rows;
};

export const getOfficesByMunicipality = async (municipality) => {
  const res = await pool.query(
    'SELECT * FROM offices WHERE municipality = $1 ORDER BY name',
    [municipality]
  );
  return res.rows;
};

// --- IP Hashes ---

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

// --- Reports ---

export const getReportById = async (id) => {
  const res = await pool.query(
    `SELECT r.*, o.name as office_name, ot.name as office_type_name
     FROM reports r
     JOIN offices o ON r.office_id = o.id
     JOIN office_types ot ON o.office_type_id = ot.id
     WHERE r.id = $1`,
    [id]
  );
  return res.rows[0];
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
  // Be careful with this as it affects stats
  const res = await pool.query(
    'DELETE FROM reports WHERE id = $1 RETURNING *',
    [id]
  );
  return res.rows[0];
};

// --- Analytics & Stats ---

export const getOfficeStats = async (officeId) => {
  // Returns aggregated stats for a specific office
  const res = await pool.query(
    `SELECT 
       COUNT(*) as total_reports,
       AVG(bribe_amount) as avg_bribe_amount,
       MIN(bribe_amount) as min_bribe,
       MAX(bribe_amount) as max_bribe,
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

export default pool;
