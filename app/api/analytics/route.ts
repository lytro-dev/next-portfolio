import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export async function GET() {
    try {
        // Get visitor analytics
        const analytics = await pool.query(`
            SELECT 
                COUNT(*) as total_visits,
                COUNT(DISTINCT ip) as unique_visitors,
                COUNT(DISTINCT country) as countries_visited,
                COUNT(DISTINCT city) as cities_visited,
                AVG(EXTRACT(EPOCH FROM (NOW() - visit_time))/3600) as avg_hours_since_visit,
                MIN(visit_time) as first_visit,
                MAX(visit_time) as last_visit
            FROM visitor_info;
        `);
        
        // Get top countries
        const topCountries = await pool.query(`
            SELECT 
                country,
                COUNT(*) as visits,
                COUNT(DISTINCT ip) as unique_visitors
            FROM visitor_info 
            WHERE country != 'Unknown'
            GROUP BY country 
            ORDER BY visits DESC 
            LIMIT 10;
        `);
        
        // Get top cities
        const topCities = await pool.query(`
            SELECT 
                city,
                COUNT(*) as visits,
                COUNT(DISTINCT ip) as unique_visitors
            FROM visitor_info 
            WHERE city != 'Unknown'
            GROUP BY city 
            ORDER BY visits DESC 
            LIMIT 10;
        `);
        
        // Get recent activity (last 24 hours)
        const recentActivity = await pool.query(`
            SELECT 
                COUNT(*) as visits_last_24h,
                COUNT(DISTINCT ip) as unique_visitors_last_24h
            FROM visitor_info 
            WHERE visit_time >= NOW() - INTERVAL '24 hours';
        `);
        
        // Get hourly distribution for the last 24 hours
        const hourlyDistribution = await pool.query(`
            SELECT 
                EXTRACT(HOUR FROM visit_time) as hour,
                COUNT(*) as visits
            FROM visitor_info 
            WHERE visit_time >= NOW() - INTERVAL '24 hours'
            GROUP BY EXTRACT(HOUR FROM visit_time)
            ORDER BY hour;
        `);
        
        // Get daily distribution for the last 7 days
        const dailyDistribution = await pool.query(`
            SELECT 
                DATE(visit_time) as date,
                COUNT(*) as visits,
                COUNT(DISTINCT ip) as unique_visitors
            FROM visitor_info 
            WHERE visit_time >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(visit_time)
            ORDER BY date;
        `);
        
        return NextResponse.json({
            success: true,
            overview: analytics.rows[0],
            topCountries: topCountries.rows,
            topCities: topCities.rows,
            recentActivity: recentActivity.rows[0],
            hourlyDistribution: hourlyDistribution.rows,
            dailyDistribution: dailyDistribution.rows
        });
        
    } catch (err: any) {
        return NextResponse.json({ 
            error: err.message,
            details: err.stack 
        }, { status: 500 });
    }
} 