import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export async function GET() {
    try {
        // Test basic connection
        const result = await pool.query('SELECT NOW() as current_time');
        
        // Check if visitor_info table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'visitor_info'
            );
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        
        if (tableExists) {
            // Get row count
            const countResult = await pool.query('SELECT COUNT(*) as count FROM visitor_info');
            const rowCount = countResult.rows[0].count;
            
            // Get sample data
            const sampleResult = await pool.query('SELECT * FROM visitor_info LIMIT 5');
            
            return NextResponse.json({
                success: true,
                currentTime: result.rows[0].current_time,
                tableExists,
                rowCount,
                sampleData: sampleResult.rows
            });
        } else {
            return NextResponse.json({
                success: true,
                currentTime: result.rows[0].current_time,
                tableExists: false,
                message: 'Visitor_info table does not exist'
            });
        }
        
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        return NextResponse.json({ 
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
} 