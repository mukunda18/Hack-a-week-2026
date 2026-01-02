import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: "postgresql://postgres:B!k3sh@2026@db.hzywgqcxrpclprxfcpwq.supabase.co:5432/postgres",
});

export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

export const addOffice = async (office) => {
  try {
    const sql = `
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
      office.longitude,
    ];

    const res = await pool.query(sql, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error inserting office:', err.message);
    throw err;
  }
};
