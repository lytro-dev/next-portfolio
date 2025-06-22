import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export async function GET() {
    try {
        // Get table structure
        const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'visitor_info'
            ORDER BY ordinal_position;
        `);
        
        // Get sample data
        const sampleData = await pool.query(`
            SELECT * FROM visitor_info 
            ORDER BY id DESC 
            LIMIT 10;
        `);
        
        // Get table statistics
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_rows,
                COUNT(DISTINCT ip) as unique_ips,
                COUNT(DISTINCT country) as unique_countries,
                COUNT(DISTINCT city) as unique_cities,
                MIN(visit_time) as earliest_visit,
                MAX(visit_time) as latest_visit
            FROM visitor_info;
        `);
        
        return NextResponse.json({
            success: true,
            structure: structure.rows,
            sampleData: sampleData.rows,
            statistics: stats.rows[0]
        });
        
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        return NextResponse.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
} 