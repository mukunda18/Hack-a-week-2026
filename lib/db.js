import pkg from 'pg';
const { Pool } = pkg;

const isDev = process.env.NODE_ENV !== 'production';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isDev
    ? false
    : {
      rejectUnauthorized: true
    }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

export const query = async (text, params = []) => {
  try {
    const res = await pool.query(text, params);
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

export const createReport = async (report, select = {}) => {
  const ipHashId = await getOrCreateIpHash(report.ipHash);

  const { fields } = select;

  const fieldMapping = {
    id: 'id',
    office_id: 'office_id',
    ip_hash_id: 'ip_hash_id',
    bribe_amount: 'bribe_amount',
    delay: 'delay',
    report_date: 'report_date',
    confidence_score: 'confidence_score',
    service_type: 'service_type',
    description: 'description',
    visit_time: 'visit_time',
    interaction_method: 'interaction_method',
    outcome: 'outcome',
    created_at: 'created_at',
    updated_at: 'updated_at'
  };

  let returningClause = '*';
  if (fields) {
    const requestedFields = Array.isArray(fields) ? fields : fields.split(',').map(f => f.trim());
    returningClause = requestedFields
      .map(f => fieldMapping[f] || null)
      .filter(f => f !== null)
      .join(', ');

    if (!returningClause) returningClause = '*';
  }

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
        office_id, ip_hash_id, bribe_amount, delay, report_date, 
        confidence_score, service_type, description, visit_time, 
        interaction_method, outcome
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING ${returningClause}`,
      [
        report.office_id,
        ipHashId,
        bribeAmount,
        delay,
        report.report_date || today,
        report.confidence_score || 0.1,
        report.service_type || null,
        report.description || null,
        report.visit_time || null,
        report.interaction_method || null,
        report.outcome || null
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

export const getOffices = async (filters = {}, select = {}) => {
  const {
    id, office_type_id, province, district, municipality, name,
    latitude, longitude, radius = 5000
  } = filters;

  const { fields, limit, offset } = select;
  const rawOrderBy = select.orderBy || 'name';
  const rawOrderDir = (select.orderDir || 'ASC').toUpperCase();

  const fieldMapping = {
    id: 'o.id',
    office_type_id: 'o.office_type_id',
    name: 'o.name',
    province: 'o.province',
    district: 'o.district',
    municipality: 'o.municipality',
    latitude: 'ST_Y(o.geom::geometry)',
    longitude: 'ST_X(o.geom::geometry)',
    created_at: 'o.created_at',
    updated_at: 'o.updated_at',
    office_type_name: 'ot.name',
    severity_score: 'o.severity_score'
  };

  // Validate Order By and Order Dir
  const orderBy = fieldMapping[rawOrderBy] ? fieldMapping[rawOrderBy] : 'o.name';
  const orderDir = ['ASC', 'DESC'].includes(rawOrderDir) ? rawOrderDir : 'ASC';

  const hasCoords = latitude !== undefined && longitude !== undefined;

  let selectClause = '';
  if (fields) {
    const requestedFields = Array.isArray(fields) ? fields : fields.split(',').map(f => f.trim());
    selectClause = requestedFields
      .map(f => fieldMapping[f] ? `${fieldMapping[f]} as ${f}` : null)
      .filter(f => f !== null)
      .join(', ');
  }

  if (!selectClause) {
    selectClause = `
      o.id, o.office_type_id, o.name, o.province, o.district, o.municipality, 
      ST_Y(o.geom::geometry) as latitude, ST_X(o.geom::geometry) as longitude, 
      o.created_at, o.updated_at, ot.name as office_type_name,
      o.severity_score
    `;
  }

  if (hasCoords) {
    selectClause += `, ST_Distance(o.geom, ST_SetSRID(ST_MakePoint($$LON_IDX$$, $$LAT_IDX$$), 4326)::geography) as distance`;
  }

  let queryText = `
    SELECT ${selectClause}
    FROM offices o
    JOIN office_types ot ON o.office_type_id = ot.id
    WHERE 1=1
  `;
  const values = [];

  if (id) {
    values.push(id);
    queryText += ` AND o.id = $${values.length}`;
  }
  if (office_type_id && office_type_id !== 'all') {
    values.push(office_type_id);
    queryText += ` AND o.office_type_id = $${values.length}`;
  }
  if (province) {
    values.push(province);
    queryText += ` AND o.province = $${values.length}`;
  }
  if (district) {
    values.push(district);
    queryText += ` AND o.district = $${values.length}`;
  }
  if (municipality) {
    values.push(municipality);
    queryText += ` AND o.municipality = $${values.length}`;
  }
  if (name) {
    values.push(`%${name}%`);
    queryText += ` AND o.name ILIKE $${values.length}`;
  }

  if (hasCoords) {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseFloat(radius);

    values.push(lon, lat, rad);
    const lonIdx = values.length - 2;
    const latIdx = values.length - 1;
    const radIdx = values.length;

    queryText = queryText.replace('$$LON_IDX$$', lonIdx).replace('$$LAT_IDX$$', latIdx);
    queryText += ` AND ST_DWithin(o.geom, ST_SetSRID(ST_MakePoint($${lonIdx}, $${latIdx}), 4326)::geography, $${radIdx})`;
  }

  queryText += ` ORDER BY ${orderBy} ${orderDir}`;

  if (limit) {
    values.push(limit);
    queryText += ` LIMIT $${values.length}`;
  }
  if (offset) {
    values.push(offset);
    queryText += ` OFFSET $${values.length}`;
  }

  const result = await pool.query(queryText, values);
  return result.rows;
};

export const getOffice = async (filters = {}, select = {}) => {
  const results = await getOffices(filters, { ...select, limit: 1 });
  return results[0] || null;
};

export const getOfficeTypes = async (filters = {}, select = {}) => {
  const { id, name } = filters;
  const { fields } = select;

  let selectList = '*';
  if (fields) {
    const requestedFields = Array.isArray(fields) ? fields : fields.split(',').map(f => f.trim());
    selectList = requestedFields
      .filter(f => /^[a-zA-Z0-9_]+$/.test(f))
      .join(', ') || '*';
  }

  let queryText = `SELECT ${selectList} FROM office_types WHERE 1=1`;
  const values = [];

  if (id) {
    values.push(id);
    queryText += ` AND id = $${values.length}`;
  }
  if (name) {
    values.push(name);
    queryText += ` AND name = $${values.length}`;
  }

  queryText += ' ORDER BY name';
  const result = await pool.query(queryText, values);
  return result.rows;
};

export const getOfficeType = async (filters = {}, select = {}) => {
  const results = await getOfficeTypes(filters, select);
  return results[0] || null;
};

export const getReports = async (filters = {}, select = {}) => {
  const {
    id, office_id, ip_hash_id, ip_hash, service_type, interaction_method, outcome,
    bribe_min, bribe_max, delay_min, delay_max,
    date_from, date_to, report_date,
    confidence_min, description, visit_time,
    province, district, municipality
  } = filters;

  const { fields, limit = 50, offset } = select;
  const rawOrderBy = select.orderBy || 'created_at';
  const rawOrderDir = (select.orderDir || 'DESC').toUpperCase();

  const sanitizedLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 1000);

  const fieldMapping = {
    id: 'r.id',
    office_id: 'r.office_id',
    ip_hash_id: 'r.ip_hash_id',
    bribe_amount: 'r.bribe_amount',
    delay: 'r.delay',
    report_date: 'r.report_date',
    created_at: 'r.created_at',
    confidence_score: 'r.confidence_score',
    service_type: 'r.service_type',
    description: 'r.description',
    visit_time: 'r.visit_time',
    interaction_method: 'r.interaction_method',
    outcome: 'r.outcome',
    office_name: 'o.name',
    province: 'o.province',
    district: 'o.district',
    municipality: 'o.municipality',
    office_type_name: 'ot.name'
  };

  // Validate Order By and Order Dir
  const orderBy = fieldMapping[rawOrderBy] ? fieldMapping[rawOrderBy] : 'r.created_at';
  const orderDir = ['ASC', 'DESC'].includes(rawOrderDir) ? rawOrderDir : 'DESC';

  let selectClause = '';
  if (fields) {
    const requestedFields = Array.isArray(fields) ? fields : fields.split(',').map(f => f.trim());
    selectClause = requestedFields
      .map(f => fieldMapping[f] ? `${fieldMapping[f]} as ${f}` : null)
      .filter(f => f !== null)
      .join(', ');
  }

  if (!selectClause) {
    selectClause = `
      r.*,
      o.name as office_name,
      o.province,
      o.district,
      o.municipality,
      ot.name as office_type_name
    `;
  }

  let queryText = `
    SELECT ${selectClause}
    FROM reports r
    JOIN offices o ON r.office_id = o.id
    JOIN office_types ot ON o.office_type_id = ot.id
    LEFT JOIN ip_hashes ip ON r.ip_hash_id = ip.id
    WHERE 1=1
  `;
  const values = [];

  if (id) {
    values.push(id);
    queryText += ` AND r.id = $${values.length}`;
  }
  if (office_id) {
    values.push(office_id);
    queryText += ` AND r.office_id = $${values.length}`;
  }
  if (ip_hash_id) {
    values.push(ip_hash_id);
    queryText += ` AND r.ip_hash_id = $${values.length}`;
  }
  if (ip_hash) {
    values.push(ip_hash);
    queryText += ` AND ip.ip_hash = $${values.length}`;
  }
  if (service_type) {
    values.push(service_type);
    queryText += ` AND r.service_type = $${values.length}`;
  }
  if (interaction_method) {
    values.push(interaction_method);
    queryText += ` AND r.interaction_method = $${values.length}`;
  }
  if (outcome) {
    values.push(outcome);
    queryText += ` AND r.outcome = $${values.length}`;
  }
  if (bribe_min !== undefined) {
    values.push(bribe_min);
    queryText += ` AND r.bribe_amount >= $${values.length}`;
  }
  if (bribe_max !== undefined) {
    values.push(bribe_max);
    queryText += ` AND r.bribe_amount <= $${values.length}`;
  }
  if (delay_min !== undefined) {
    values.push(delay_min);
    queryText += ` AND r.delay >= $${values.length}`;
  }
  if (delay_max !== undefined) {
    values.push(delay_max);
    queryText += ` AND r.delay <= $${values.length}`;
  }
  if (report_date) {
    values.push(report_date);
    queryText += ` AND r.report_date = $${values.length}`;
  }
  if (date_from) {
    values.push(date_from);
    queryText += ` AND r.report_date >= $${values.length}`;
  }
  if (date_to) {
    values.push(date_to);
    queryText += ` AND r.report_date <= $${values.length}`;
  }
  if (confidence_min !== undefined) {
    values.push(confidence_min);
    queryText += ` AND r.confidence_score >= $${values.length}`;
  }
  if (description) {
    values.push(`%${description}%`);
    queryText += ` AND r.description ILIKE $${values.length}`;
  }
  if (visit_time) {
    values.push(visit_time);
    queryText += ` AND r.visit_time = $${values.length}`;
  }
  if (province) {
    values.push(province);
    queryText += ` AND o.province = $${values.length}`;
  }
  if (district) {
    values.push(district);
    queryText += ` AND o.district = $${values.length}`;
  }
  if (municipality) {
    values.push(municipality);
    queryText += ` AND o.municipality = $${values.length}`;
  }

  queryText += ` ORDER BY ${orderBy} ${orderDir} LIMIT $${values.length + 1}`;
  values.push(sanitizedLimit);

  if (offset) {
    values.push(offset);
    queryText += ` OFFSET $${values.length}`;
  }

  const result = await pool.query(queryText, values);
  return result.rows;
};

export const getReport = async (filters = {}, select = {}) => {
  const results = await getReports(filters, { ...select, limit: 1 });
  return results[0] || null;
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

  const filteredFields = fields.filter(field =>
    field !== 'updated_at' && field !== 'latitude' && field !== 'longitude'
  );
  const values = filteredFields.map(field => updates[field]);

  let setClauses = filteredFields.map((field, index) => `${field} = $${index + 2}`);

  const hasCoordUpdates = updates.latitude !== undefined || updates.longitude !== undefined;

  if (hasCoordUpdates) {
    let latParam, lonParam;
    let paramIndex = values.length + 2;

    if (updates.latitude !== undefined && updates.longitude !== undefined) {
      latParam = `$${paramIndex}`;
      lonParam = `$${paramIndex + 1}`;
      values.push(updates.latitude, updates.longitude);
    } else if (updates.latitude !== undefined) {
      latParam = `$${paramIndex}`;
      lonParam = 'ST_X(geom::geometry)';
      values.push(updates.latitude);
    } else {
      latParam = 'ST_Y(geom::geometry)';
      lonParam = `$${paramIndex}`;
      values.push(updates.longitude);
    }

    setClauses.push(`geom = ST_SetSRID(ST_MakePoint(${lonParam}, ${latParam}), 4326)::geography`);
  }

  if (setClauses.length === 0) {
    return getOffice({ id });
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

export const getOfficesSeverityMap = async (filters = {}) => {
  const {
    office_type_id, province, district, municipality,
    service_type, interaction_method, outcome
  } = filters;

  const values = [];
  let officeWhere = '';
  let reportWhere = "r.created_at > NOW() - INTERVAL '90 days'";

  if (office_type_id) {
    values.push(office_type_id);
    officeWhere += ` AND o.office_type_id = $${values.length}`;
  }
  if (province) {
    values.push(province);
    officeWhere += ` AND o.province = $${values.length}`;
  }
  if (district) {
    values.push(district);
    officeWhere += ` AND o.district = $${values.length}`;
  }
  if (municipality) {
    values.push(municipality);
    officeWhere += ` AND o.municipality = $${values.length}`;
  }

  if (service_type) {
    values.push(service_type);
    reportWhere += ` AND r.service_type = $${values.length}`;
  }
  if (interaction_method) {
    values.push(interaction_method);
    reportWhere += ` AND r.interaction_method = $${values.length}`;
  }
  if (outcome) {
    values.push(outcome);
    reportWhere += ` AND r.outcome = $${values.length}`;
  }

  const queryText = `
    SELECT 
       o.id,
       o.name,
       o.province,
       o.district,
       o.municipality,
       o.severity_score,
       ST_Y(o.geom::geometry) as latitude,
       ST_X(o.geom::geometry) as longitude,
       ot.name as office_type,
       COUNT(r.id) as report_count,
       COALESCE(AVG(r.bribe_amount), 0) as avg_bribe,
       COALESCE(AVG(r.delay), 0) as avg_delay,
       MAX(r.created_at) as last_report_date
     FROM offices o
     JOIN office_types ot ON o.office_type_id = ot.id
     LEFT JOIN reports r ON o.id = r.office_id AND ${reportWhere}
     WHERE 1=1 ${officeWhere}
     GROUP BY o.id, ot.name
     ORDER BY o.severity_score DESC
  `;

  const res = await pool.query(queryText, values);

  const scores = res.rows.map(row => parseFloat(row.severity_score) || 0);
  const maxScore = Math.max(...scores, 1);
  const minScore = Math.min(...scores.filter(s => s > 0), 0);

  return res.rows.map(office => {
    const score = parseFloat(office.severity_score) || 0;
    const reportCount = parseInt(office.report_count) || 0;

    const normalizedScore = maxScore > minScore
      ? (score - minScore) / (maxScore - minScore)
      : 0;

    const opacity = Math.sqrt(normalizedScore);
    const radius = 500 + (reportCount * 100);
    const color = `hsla(0, 100%, 50%, ${opacity})`;
    const borderColor = `hsla(0, 100%, 30%, 0.8)`;

    return {
      ...office,
      report_count: reportCount,
      avg_bribe: parseFloat(office.avg_bribe) || 0,
      avg_delay: parseFloat(office.avg_delay) || 0,
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

export const getGlobalStatsForToday = async (filters = {}) => {
  const today = new Date().toISOString().split('T')[0];
  const { office_type_id, province, district, municipality } = filters;

  const values = [today];
  let whereClause = 'WHERE r.report_date = $1';

  if (office_type_id) {
    values.push(office_type_id);
    whereClause += ` AND o.office_type_id = $${values.length}`;
  }
  if (province) {
    values.push(province);
    whereClause += ` AND o.province = $${values.length}`;
  }
  if (district) {
    values.push(district);
    whereClause += ` AND o.district = $${values.length}`;
  }
  if (municipality) {
    values.push(municipality);
    whereClause += ` AND o.municipality = $${values.length}`;
  }

  const queryText = `
    SELECT 
       COUNT(r.id) as total_reports,
       COALESCE(AVG(r.bribe_amount), 0) as avg_bribe,
       COALESCE(AVG(r.delay), 0) as avg_delay
     FROM reports r
     JOIN offices o ON r.office_id = o.id
     ${whereClause}
  `;

  const res = await pool.query(queryText, values);
  return res.rows[0];
};

export const end = async () => {
  await pool.end();
};

export default pool;
