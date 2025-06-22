const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

const sampleData = [
    {
        ip: '8.8.8.8',
        country: 'United States',
        city: 'Mountain View',
        visit_time: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
    },
    {
        ip: '1.1.1.1',
        country: 'United States',
        city: 'Los Angeles',
        visit_time: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
    },
    {
        ip: '208.67.222.222',
        country: 'United States',
        city: 'San Francisco',
        visit_time: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
    },
    {
        ip: '9.9.9.9',
        country: 'Germany',
        city: 'Berlin',
        visit_time: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8 hours ago
    },
    {
        ip: '149.112.112.112',
        country: 'Canada',
        city: 'Toronto',
        visit_time: new Date(Date.now() - 1000 * 60 * 60 * 10) // 10 hours ago
    },
    {
        ip: '76.76.19.19',
        country: 'United Kingdom',
        city: 'London',
        visit_time: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
    },
    {
        ip: '94.140.14.14',
        country: 'France',
        city: 'Paris',
        visit_time: new Date(Date.now() - 1000 * 60 * 60 * 14) // 14 hours ago
    },
    {
        ip: '185.228.168.9',
        country: 'Sweden',
        city: 'Stockholm',
        visit_time: new Date(Date.now() - 1000 * 60 * 60 * 16) // 16 hours ago
    },
    {
        ip: '76.223.126.88',
        country: 'Japan',
        city: 'Tokyo',
        visit_time: new Date(Date.now() - 1000 * 60 * 60 * 18) // 18 hours ago
    },
    {
        ip: '8.26.56.26',
        country: 'Australia',
        city: 'Sydney',
        visit_time: new Date(Date.now() - 1000 * 60 * 60 * 20) // 20 hours ago
    }
];

async function populateSampleData() {
    try {

        // Clear existing data (optional)
        await pool.query('DELETE FROM visitor_info');

        // Insert sample data
        for (const visitor of sampleData) {
            await pool.query(
                'INSERT INTO visitor_info (ip, country, city, visit_time) VALUES ($1, $2, $3, $4)',
                [visitor.ip, visitor.country, visitor.city, visitor.visit_time]
            );
        }


        // Verify the data
        const result = await pool.query('SELECT COUNT(*) as count FROM visitor_info');

    } catch (error) {
        console.error('Error populating sample data:', error);
    } finally {
        await pool.end();
    }
}

populateSampleData(); 