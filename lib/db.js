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

export default pool;
