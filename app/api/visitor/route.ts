import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

interface GeolocationData {
    country: string;
    city: string;
    region?: string;
    timezone?: string;
}

async function getGeolocationData(ip: string): Promise<GeolocationData> {
    try {
        // Using ipapi.co (free tier available)
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error('Failed to get geolocation data');
        }
        
        return {
            country: data.country_name || 'Unknown',
            city: data.city || 'Unknown',
            region: data.region || undefined,
            timezone: data.timezone || undefined
        };
    } catch (error) {
        return {
            country: 'Unknown',
            city: 'Unknown'
        };
    }
}

function getClientIP(request: Request): string {
    // Try to get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    if (cfConnectingIP) {
        return cfConnectingIP;
    }
    
    // Fallback for development
    return '127.0.0.1';
}

async function ensureTableExists() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS visitor_info (
                id SERIAL PRIMARY KEY,
                ip VARCHAR(45) NOT NULL,
                country VARCHAR(100),
                city VARCHAR(100),
                visit_time TIMESTAMP DEFAULT NOW()
            );
        `);
    } catch (error) {
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        const clientIP = getClientIP(request);
        
        // Get geolocation data
        const geoData = await getGeolocationData(clientIP);
        
        // Ensure table exists
        await ensureTableExists();
        
        // Insert into database
        const insertQuery = `
            INSERT INTO visitor_info (ip, country, city, visit_time)
            VALUES ($1, $2, $3, NOW())
            RETURNING *
        `;
        
        const result = await pool.query(insertQuery, [
            clientIP,
            geoData.country,
            geoData.city
        ]);
        
        return NextResponse.json({
            success: true,
            visitor: result.rows[0],
            geolocation: geoData
        });
        
    } catch (err: any) {
        return NextResponse.json({ 
            error: err.message,
            details: err.stack 
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const clientIP = getClientIP(request);
        
        // Get geolocation data without inserting
        const geoData = await getGeolocationData(clientIP);
        
        return NextResponse.json({
            ip: clientIP,
            geolocation: geoData
        });
        
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
} 