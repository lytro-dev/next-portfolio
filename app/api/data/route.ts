import { NextResponse } from 'next/server';
import { Pool } from 'pg';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const useragent = require('express-useragent');

const pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

// Function to detect device type
function detectDevice(userAgentString: string): string {
    const ua = userAgentString.toLowerCase();
    
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
        return 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
        return 'Tablet';
    } else if (ua.includes('tv') || ua.includes('smart-tv')) {
        return 'TV';
    } else {
        return 'Desktop';
    }
}

// Function to detect VPN (basic detection)
function detectVPN(): boolean {
    // Basic VPN detection - you can enhance this with more sophisticated methods
    // For now, we'll return false as a placeholder
    // You can integrate with VPN detection APIs or databases
    return false;
}

// Function to parse user agent and return structured data
function parseUserAgent(userAgentString: string) {
    if (!userAgentString || userAgentString === 'Unknown') {
        return {
            browser: 'Unknown',
            version: 'Unknown',
            os: 'Unknown',
            platform: 'Unknown',
            device: 'Unknown',
            isVPN: false,
            source: userAgentString || 'Unknown'
        };
    }

    const ua = useragent.parse(userAgentString);
    const device = detectDevice(userAgentString);
    const isVPN = detectVPN();
    
    return {
        browser: ua.browser || 'Unknown',
        version: ua.version || 'Unknown',
        os: ua.os || 'Unknown',
        platform: ua.platform || 'Unknown',
        device: device,
        isVPN: isVPN,
        source: userAgentString
    };
}

export async function GET() {
    try {
        // First, let's check what columns actually exist
        const schemaQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'visitor_info'
            ORDER BY ordinal_position;
        `;
        
        const schemaResult = await pool.query(schemaQuery);
        const availableColumns = schemaResult.rows.map(row => row.column_name);
        
        // Build a comprehensive query with all available fields
        let selectQuery = 'SELECT ';
        const selectParts = [];
        
        // Always include id if it exists
        if (availableColumns.includes('id')) {
            selectParts.push('id');
        } else {
            selectParts.push('ROW_NUMBER() OVER() as id');
        }
        
        // Handle IP address
        if (availableColumns.includes('ip')) {
            selectParts.push('ip');
        } else if (availableColumns.includes('ip_address')) {
            selectParts.push('ip_address as ip');
        } else {
            selectParts.push("'Unknown' as ip");
        }
        
        // Handle country
        if (availableColumns.includes('country')) {
            selectParts.push('COALESCE(country, \'Unknown\') as country');
        } else if (availableColumns.includes('country_code')) {
            selectParts.push('COALESCE(country_code, \'Unknown\') as country');
        } else {
            selectParts.push("'Unknown' as country");
        }
        
        // Handle city
        if (availableColumns.includes('city')) {
            selectParts.push('COALESCE(city, \'Unknown\') as city');
        } else if (availableColumns.includes('city_name')) {
            selectParts.push('COALESCE(city_name, \'Unknown\') as city');
        } else {
            selectParts.push("'Unknown' as city");
        }
        
        // Handle client_timestamp
        if (availableColumns.includes('client_timestamp')) {
            selectParts.push('client_timestamp');
        } else if (availableColumns.includes('created_at')) {
            selectParts.push('created_at as client_timestamp');
        } else if (availableColumns.includes('timestamp')) {
            selectParts.push('timestamp as client_timestamp');
        } else {
            selectParts.push('NOW() as client_timestamp');
        }
        
        // Handle language
        if (availableColumns.includes('language')) {
            selectParts.push('COALESCE(language, \'Unknown\') as language');
        } else {
            selectParts.push("'Unknown' as language");
        }
        
        // Handle platform
        if (availableColumns.includes('platform')) {
            selectParts.push('COALESCE(platform, \'Unknown\') as platform');
        } else {
            selectParts.push("'Unknown' as platform");
        }
        
        // Handle user_agent
        if (availableColumns.includes('user_agent')) {
            selectParts.push('COALESCE(user_agent, \'Unknown\') as user_agent');
        } else {
            selectParts.push("'Unknown' as user_agent");
        }
        
        // Handle browser
        if (availableColumns.includes('browser')) {
            selectParts.push('COALESCE(browser, \'Unknown\') as browser');
        } else {
            selectParts.push("'Unknown' as browser");
        }
        
        // Handle os
        if (availableColumns.includes('os')) {
            selectParts.push('COALESCE(os, \'Unknown\') as os');
        } else {
            selectParts.push("'Unknown' as os");
        }
        
        // Handle device
        if (availableColumns.includes('device')) {
            selectParts.push('COALESCE(device, \'Unknown\') as device');
        } else {
            selectParts.push("'Unknown' as device");
        }
        
        // Handle referrer
        if (availableColumns.includes('referrer')) {
            selectParts.push('COALESCE(referrer, \'Direct\') as referrer');
        } else {
            selectParts.push("'Direct' as referrer");
        }
        
        // Handle page_name
        if (availableColumns.includes('page_name')) {
            selectParts.push('COALESCE(page_name, \'Unknown\') as page_name');
        } else {
            selectParts.push("'Unknown' as page_name");
        }
        
        selectQuery += selectParts.join(', ') + ' FROM visitor_info ORDER BY client_timestamp DESC';
        
        const result = await pool.query(selectQuery);
        
        // Parse user agent data for each row
        const processedRows = result.rows.map(row => {
            const userAgentData = parseUserAgent(row.user_agent);
            
            return {
                ...row,
                browser: userAgentData.browser,
                version: userAgentData.version,
                os: userAgentData.os,
                platform: userAgentData.platform,
                device: userAgentData.device,
                isVPN: userAgentData.isVPN,
                source: userAgentData.source
            };
        });
        
        return NextResponse.json(processedRows);
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
