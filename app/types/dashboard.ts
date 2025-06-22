export interface VisitorInfo {
    id: number;
    ip: string;
    country: string;
    state: string;
    city: string;
    client_timestamp: string;
    language: string;
    platform: string;
    user_agent: string;
    browser: string;
    version: string;
    os: string;
    device: string;
    isVPN: boolean;
    referrer: string;
    page_name: string;
    source: string;
}

export interface DashboardMetrics {
    totalVisits: number;
    uniqueVisitors: number;
    topCountry: string;
    topCity: string;
    recentActivity: number;
    topBrowser: string;
    topOS: string;
    topDevice: string;
    topLanguage: string;
    topPlatform: string;
    vpnVisits: number;
    topBrowserVersion: string;
}

export interface GeolocationData {
    country: string;
    state: string;
    city: string;
    region?: string;
    timezone?: string;
} 