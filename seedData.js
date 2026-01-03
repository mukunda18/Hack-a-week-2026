import { data } from './mockData.js';
import { addOfficeType, addOffice, query, end } from './lib/db.js';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // First, check if data already exists
    const existingTypes = await query('SELECT COUNT(*) as count FROM office_types');
    const existingOffices = await query('SELECT COUNT(*) as count FROM offices');

    if (existingTypes.rows[0].count > 0 || existingOffices.rows[0].count > 0) {
      console.log('Database already contains data. Skipping seed.');
      console.log(`Office types: ${existingTypes.rows[0].count}, Offices: ${existingOffices.rows[0].count}`);
      return;
    }

    // Seed office types
    console.log('Seeding office types...');
    const officeTypeMap = new Map(); // Map old ID to new ID

    for (const officeType of data.office_types) {
      try {
        const newOfficeType = await addOfficeType(officeType.name);
        officeTypeMap.set(officeType.id, newOfficeType.id);
        console.log(`  ✓ Added office type: ${officeType.name} (ID: ${newOfficeType.id})`);
      } catch (error) {
        if (error.code === '23505') {
          // Already exists, get the existing one
          const existing = await query('SELECT id FROM office_types WHERE name = $1', [officeType.name]);
          if (existing.rows.length > 0) {
            officeTypeMap.set(officeType.id, existing.rows[0].id);
            console.log(`  ⊙ Office type already exists: ${officeType.name} (ID: ${existing.rows[0].id})`);
          }
        } else {
          console.error(`  ✗ Error adding office type ${officeType.name}:`, error.message);
        }
      }
    }

    // Seed offices
    console.log('\nSeeding offices...');
    let successCount = 0;
    let errorCount = 0;

    for (const office of data.offices) {
      try {
        // Map the old office_type_id to the new one
        const newOfficeTypeId = officeTypeMap.get(office.office_type_id);
        
        if (!newOfficeTypeId) {
          console.error(`  ✗ Office type ID ${office.office_type_id} not found for office: ${office.name}`);
          errorCount++;
          continue;
        }

        const officeData = {
          office_type_id: newOfficeTypeId,
          name: office.name,
          province: office.province || null,
          district: office.district || null,
          municipality: office.municipality || null,
          latitude: office.latitude,
          longitude: office.longitude
        };

        await addOffice(officeData);
        successCount++;
        
        if (successCount % 100 === 0) {
          console.log(`  ✓ Processed ${successCount} offices...`);
        }
      } catch (error) {
        errorCount++;
        if (errorCount <= 10) {
          console.error(`  ✗ Error adding office ${office.name}:`, error.message);
        } else if (errorCount === 11) {
          console.error(`  ✗ ... (suppressing further error messages)`);
        }
      }
    }

    console.log(`\n✓ Seeding completed!`);
    console.log(`  - Office types: ${data.office_types.length}`);
    console.log(`  - Offices: ${successCount} successful, ${errorCount} errors`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await end();
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('Seeding script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding script failed:', error);
    process.exit(1);
  });

