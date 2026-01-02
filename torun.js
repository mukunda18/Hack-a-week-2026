import { data } from './mockData.js';
import { addOffice, end, query, addIpHash, addReportRaw } from './lib/db.js';

(async () => {
    try {
        const officeTypes = data.office_types;
        console.log(`Starting to insert ${officeTypes.length} office types...`);

        for (const officeType of officeTypes) {
            try {
                await query(
                    'INSERT INTO office_types (id, name) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
                    [officeType.id, officeType.name]
                );
                console.log('Inserted office type:', officeType.name);
            } catch (err) {
                console.error('Failed to insert office type:', officeType.name, err.message);
            }
        }

        console.log('Finished inserting office types\n');

        const offices = data.offices;

        console.log(`Starting to insert ${offices.length} offices...`);

        let successCount = 0;
        let failCount = 0;

        for (const office of offices) {
            try {
                await addOffice(office);
                console.log(`✓ Inserted office: ${office.name}`);
                successCount++;
            } catch (err) {
                console.error(`✗ Failed to insert office: ${office.name} - ${err.message}`);
                failCount++;
            }
        }

        console.log(`\nFinished inserting offices: ${successCount} succeeded, ${failCount} failed`);

        // Seed IP Hashes
        const ipHashes = data.ip_hashes || [];
        console.log(`\nStarting to insert ${ipHashes.length} IP hashes...`);
        let ipSuccess = 0;
        for (const ip of ipHashes) {
            try {
                await addIpHash(ip);
                // console.log(`✓ Inserted IP hash: ${ip.ip_hash.substring(0, 10)}...`);
                ipSuccess++;
            } catch (err) {
                console.error(`✗ Failed to insert IP hash ${ip.id}:`, err.message);
            }
        }
        console.log(`Finished inserting IP hashes: ${ipSuccess} succeeded`);

        // Seed Reports (Synthetic)
        console.log('\nGenerating and inserting synthetic reports...');
        const NUM_REPORTS = 100;
        let reportSuccess = 0;

        // Helper to get random item from array
        const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
        // Helper to random integer
        const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        if (offices.length > 0 && ipHashes.length > 0) {
            for (let i = 0; i < NUM_REPORTS; i++) {
                try {
                    const office = randomChoice(offices);
                    const ip = randomChoice(ipHashes);
                    const amount = randomInt(1000, 50000);

                    const report = {
                        office_id: office.id,
                        ip_hash_id: ip.id,
                        bribe_amount: amount,
                        amount_range: amount < 5000 ? 'Low' : amount < 20000 ? 'Medium' : 'High',
                        report_week: new Date(2025, randomInt(0, 11), randomInt(1, 28)), // Random date in 2025
                        confidence_score: Math.random().toFixed(2),
                        created_at: new Date()
                    };

                    await addReportRaw(report);
                    reportSuccess++;
                } catch (err) {
                    console.error('✗ Failed to insert report:', err.message);
                }
            }
            console.log(`Finished inserting reports: ${reportSuccess} generated and inserted`);
        } else {
            console.log('Skipping report generation: requires both offices and IP hashes to be present.');
        }

    } catch (err) {
        console.error('Fatal error:', err);
    } finally {
        await end();
        process.exit(0);
    }
})();
