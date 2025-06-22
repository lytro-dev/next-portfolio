import { NextResponse } from 'next/server';
import { Pool } from 'pg';
const useragent = require('express-useragent');

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

// Parse user agent string to get device and version
function parseUserAgent(userAgentString: string) {
    if (!userAgentString || userAgentString === 'Unknown') {
        return {
            browser: 'Unknown',
            version: 'Unknown',
            os: 'Unknown',
            platform: 'Unknown',
            device: 'Unknown',
        };
    }
    const ua = useragent.parse(userAgentString);
    let device = 'Unknown';
    const uaStr = userAgentString.toLowerCase();
    if (uaStr.includes('mobile') || uaStr.includes('android') || uaStr.includes('iphone') || uaStr.includes('ipad')) {
        device = 'Mobile';
    } else if (uaStr.includes('tablet') || uaStr.includes('ipad')) {
        device = 'Tablet';
    } else if (uaStr.includes('tv') || uaStr.includes('smart-tv')) {
        device = 'TV';
    } else {
        device = 'Desktop';
    }
    return {
        browser: ua.browser || 'Unknown',
        version: ua.version || 'Unknown',
        os: ua.os || 'Unknown',
        platform: ua.platform || 'Unknown',
        device,
    };
}

async function ensureTableExists() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS visitor_info (
                id SERIAL PRIMARY KEY,
                ip VARCHAR(64),
                country VARCHAR(128),
                city VARCHAR(128),
                device VARCHAR(64),
                version VARCHAR(64),
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
        const body = await request.json();
        const userAgent = body.userAgent || request.headers.get('user-agent') || 'Unknown';
        const page = body.page || 'Unknown';
        const timestamp = body.timestamp || new Date().toISOString();
        
        // Get geolocation data
        const geoData = await getGeolocationData(clientIP);
        // Parse device and version
        const uaData = parseUserAgent(userAgent);
        
        // Ensure table exists
        await ensureTableExists();
        
        // Insert into database
        const insertQuery = `
            INSERT INTO visitor_info (ip, country, city, device, version, visit_time)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const result = await pool.query(insertQuery, [
            clientIP,
            geoData.country,
            geoData.city,
            uaData.device,
            uaData.version,
            timestamp
        ]);
        
        return NextResponse.json({
            success: true,
            visitor: result.rows[0],
            geolocation: geoData,
            device: uaData.device,
            version: uaData.version
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