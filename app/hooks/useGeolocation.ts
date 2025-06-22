import { useState, useRef, useCallback } from 'react';
import { GeolocationData } from '../types/dashboard';

// Function to get geolocation data from IP
async function getGeolocationFromIP(ip: string): Promise<GeolocationData> {
    try {
        // Skip localhost and private IPs
        if (ip === '127.0.0.1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return { 
                country: 'Local', 
                state: 'Development',
                city: 'Development' 
            };
        }
        
        // Try primary service (ipapi.co)
        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(`IP API error: ${data.error}`);
            }
            
            const result = {
                country: data.country_name || 'Unknown',
                state: data.region || data.state || 'Unknown',
                city: data.city || 'Unknown',
                region: data.region || undefined,
                timezone: data.timezone || undefined
            };
            
            return result;
        } catch (primaryError) {
            // Try fallback service (ipinfo.io)
            try {
                const fallbackResponse = await fetch(`https://ipinfo.io/${ip}/json`);
                if (!fallbackResponse.ok) {
                    throw new Error(`Fallback HTTP error! status: ${fallbackResponse.status}`);
                }
                
                const fallbackData = await fallbackResponse.json();
                
                const result = {
                    country: fallbackData.country || 'Unknown',
                    state: fallbackData.region || fallbackData.state || 'Unknown',
                    city: fallbackData.city || 'Unknown',
                    region: fallbackData.region || undefined,
                    timezone: fallbackData.timezone || undefined
                };
                
                return result;
            } catch (fallbackError) {
                throw new Error('All geolocation services failed');
            }
        }
    } catch (error) {
        return {
            country: 'Unknown',
            state: 'Unknown',
            city: 'Unknown'
        };
    }
}

export function useGeolocation() {
    const [geolocationCache, setGeolocationCache] = useState<Record<string, GeolocationData>>({});
    const processedIPs = useRef<Set<string>>(new Set());

    const processDataWithGeolocation = useCallback(async (rawData: any[]) => {
        // Get unique IPs to fetch geolocation data
        const uniqueIPs: string[] = Array.from(new Set(rawData.map((item: any) => String(item.ip || 'Unknown'))));

        // Fetch geolocation data for unique IPs that haven't been processed yet
        const geoData: Record<string, GeolocationData> = {};
        for (const ip of uniqueIPs) {
            if (ip !== 'Unknown' && !processedIPs.current.has(ip)) {
                geoData[ip] = await getGeolocationFromIP(ip);
                processedIPs.current.add(ip);
            }
        }

        // Update cache with new geolocation data
        if (Object.keys(geoData).length > 0) {
            setGeolocationCache(prev => {
                const newCache = { ...prev, ...geoData };
                return newCache;
            });
        }

        // Process data with geolocation
        const processedData = rawData.map((item: any, index: number) => {
            const ip = String(item.ip || 'Unknown');
            
            // Get geolocation data with proper fallback chain
            const currentCache = geolocationCache;
            const allGeoData = { ...currentCache, ...geoData };
            
            let geoInfo: GeolocationData;
            if (allGeoData[ip]) {
                geoInfo = allGeoData[ip];
            } else {
                geoInfo = { country: 'Unknown', state: 'Unknown', city: 'Unknown' };
            }
            
            return {
                id: item.id || index + 1,
                ip: ip,
                country: geoInfo.country,
                state: geoInfo.state,
                city: geoInfo.city,
                client_timestamp: item.client_timestamp || new Date().toISOString(),
                language: item.language || 'Unknown',
                platform: item.platform || 'Unknown',
                user_agent: item.user_agent || 'Unknown',
                browser: item.browser || 'Unknown',
                version: item.version || 'Unknown',
                os: item.os || 'Unknown',
                device: item.device || 'Unknown',
                isVPN: item.isVPN || false,
                referrer: item.referrer || 'Direct',
                page_name: item.page_name || 'Unknown',
                source: item.source || 'Unknown'
            };
        });

        return processedData;
    }, [geolocationCache]);

    return {
        geolocationCache,
        processDataWithGeolocation
    };
} 