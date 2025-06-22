import { useState, useEffect, useCallback, useRef } from 'react';
import { VisitorInfo, DashboardMetrics } from '../types/dashboard';
import { useGeolocation } from './useGeolocation';

export function useDashboardData() {
    const [visitors, setVisitors] = useState<VisitorInfo[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalVisits: 0,
        uniqueVisitors: 0,
        topCountry: 'Unknown',
        topCity: 'Unknown',
        recentActivity: 0,
        topBrowser: 'Unknown',
        topOS: 'Unknown',
        topDevice: 'Unknown',
        topLanguage: 'Unknown',
        topPlatform: 'Unknown',
        vpnVisits: 0,
        topBrowserVersion: 'Unknown'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const isFetching = useRef(false);

    const { processDataWithGeolocation } = useGeolocation();

    const fetchData = useCallback(async () => {
        // Prevent multiple simultaneous requests
        if (isFetching.current) {
            return;
        }

        try {
            isFetching.current = true;
            setLoading(true);
            setError(null);
            
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
            });
            
            // Create the fetch promise
            const fetchPromise = fetch('/api/data');
            
            // Race between fetch and timeout
            const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rawData = await response.json();
            
            if (!Array.isArray(rawData)) {
                throw new Error('Invalid data format received');
            }
            
            // Process data with geolocation
            const processedData = await processDataWithGeolocation(rawData);
            
            setVisitors(processedData);
            
            // Calculate metrics
            const uniqueIPs = new Set(processedData.map(v => v.ip));
            const recentVisits = processedData.filter(v => {
                const visitTime = new Date(v.client_timestamp);
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                return visitTime > oneHourAgo;
            }).length;
            
            const countryCounts = processedData.reduce((acc, v) => {
                acc[v.country] = (acc[v.country] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const cityCounts = processedData.reduce((acc, v) => {
                acc[v.city] = (acc[v.city] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const browserCounts = processedData.reduce((acc, v) => {
                acc[v.browser] = (acc[v.browser] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const osCounts = processedData.reduce((acc, v) => {
                acc[v.os] = (acc[v.os] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const deviceCounts = processedData.reduce((acc, v) => {
                acc[v.device] = (acc[v.device] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const languageCounts = processedData.reduce((acc, v) => {
                acc[v.language] = (acc[v.language] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const platformCounts = processedData.reduce((acc, v) => {
                acc[v.platform] = (acc[v.platform] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const versionCounts = processedData.reduce((acc, v) => {
                acc[v.version] = (acc[v.version] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const vpnVisits = processedData.filter(v => v.isVPN).length;
            
            setMetrics({
                totalVisits: processedData.length,
                uniqueVisitors: uniqueIPs.size,
                topCountry: Object.entries(countryCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown',
                topCity: Object.entries(cityCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown',
                recentActivity: recentVisits,
                topBrowser: Object.entries(browserCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown',
                topOS: Object.entries(osCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown',
                topDevice: Object.entries(deviceCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown',
                topLanguage: Object.entries(languageCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown',
                topPlatform: Object.entries(platformCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown',
                vpnVisits,
                topBrowserVersion: Object.entries(versionCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown'
            });
            
            setLastUpdated(new Date());
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
            isFetching.current = false;
        }
    }, [processDataWithGeolocation]);

    // Only fetch data once on mount
    useEffect(() => {
        fetchData();
    }, []); // Empty dependency array - only run once

    return {
        visitors,
        metrics,
        loading,
        error,
        lastUpdated,
        refetch: fetchData
    };
} 