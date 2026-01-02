import { data } from './mockData.js';
import { addOffice } from './lib/db.js';

const offices = data.offices;

for (const office of offices) {
    try {
        const insertedOffice = await addOffice(office);
        console.log('Inserted office:', insertedOffice);
    } catch (err) {
        console.error('Failed to insert office:', err);
    }
}
