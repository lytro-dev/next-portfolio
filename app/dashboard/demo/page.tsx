'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import MetricsCard from '../../components/MetricsCard';
import ChartCard from '../../components/ChartCard';
import VisitorsTable from '../../components/VisitorsTable';
import DashboardHeader from '../../components/DashboardHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorDisplay from '../../components/ErrorDisplay';

// Mock data for demo
const mockVisitors = [
    {
        id: 1,
        ip: '192.168.1.1',
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        client_timestamp: new Date().toISOString(),
        language: 'en-US',
        platform: 'desktop',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        browser: 'Chrome',
        version: '120.0.0.0',
        os: 'Windows',
        device: 'Desktop',
        isVPN: false,
        referrer: 'Direct',
        page_name: 'Home',
        source: 'Direct'
    },
    {
        id: 2,
        ip: '10.0.0.1',
        country: 'Canada',
        state: 'Ontario',
        city: 'Toronto',
        client_timestamp: new Date(Date.now() - 3600000).toISOString(),
        language: 'en-CA',
        platform: 'mobile',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        browser: 'Safari',
        version: '17.0',
        os: 'iOS',
        device: 'Mobile',
        isVPN: true,
        referrer: 'Google',
        page_name: 'About',
        source: 'Search'
    }
];

const mockMetrics = {
    totalVisits: 2,
    uniqueVisitors: 2,
    topCountry: 'United States',
    topCity: 'San Francisco',
    recentActivity: 1,
    topBrowser: 'Chrome',
    topOS: 'Windows',
    topDevice: 'Desktop',
    topLanguage: 'en-US',
    topPlatform: 'desktop',
    vpnVisits: 1,
    topBrowserVersion: '120.0.0.0'
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function DemoDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Prepare chart data
    const countryData = [
        { name: 'United States', value: 1 },
        { name: 'Canada', value: 1 }
    ];

    const browserData = [
        { name: 'Chrome', value: 1 },
        { name: 'Safari', value: 1 }
    ];

    const osData = [
        { name: 'Windows', value: 1 },
        { name: 'iOS', value: 1 }
    ];

    const deviceData = [
        { name: 'Desktop', value: 1 },
        { name: 'Mobile', value: 1 }
    ];

    const timeChartData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        visits: i === new Date().getHours() ? 1 : (i === new Date().getHours() - 1 ? 1 : 0)
    }));

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <LoadingSpinner message="Loading demo dashboard..." size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <ErrorDisplay 
                    error={error} 
                    title="Demo Dashboard Error"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                lastUpdated={lastUpdated}
                autoRefresh={false}
                onAutoRefreshChange={() => {}}
                onRefresh={() => setLastUpdated(new Date())}
                timeRange="24h"
                onTimeRangeChange={() => {}}
                selectedCountry="all"
                onCountryChange={() => {}}
                uniqueCountries={['United States', 'Canada']}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Demo Notice */}
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
                    <strong>Demo Mode:</strong> This dashboard is showing mock data. The real dashboard requires a database connection.
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <MetricsCard
                        title="Total Visits"
                        value={mockMetrics.totalVisits}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        }
                        bgColor="bg-blue-100"
                        textColor="text-blue-600"
                    />
                    <MetricsCard
                        title="Unique Visitors"
                        value={mockMetrics.uniqueVisitors}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        }
                        bgColor="bg-green-100"
                        textColor="text-green-600"
                    />
                    <MetricsCard
                        title="Recent Activity (1h)"
                        value={mockMetrics.recentActivity}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        }
                        bgColor="bg-yellow-100"
                        textColor="text-yellow-600"
                    />
                    <MetricsCard
                        title="VPN Visits"
                        value={mockMetrics.vpnVisits}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        }
                        bgColor="bg-red-100"
                        textColor="text-red-600"
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
                    <ChartCard title="Visits by Country">
                        <BarChart data={countryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3B82F6" />
                        </BarChart>
                    </ChartCard>

                    <ChartCard title="Visits by Browser">
                        <BarChart data={browserData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#10B981" />
                        </BarChart>
                    </ChartCard>

                    <ChartCard title="Operating Systems">
                        <PieChart>
                            <Pie
                                data={osData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {osData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ChartCard>

                    <ChartCard title="Device Types">
                        <PieChart>
                            <Pie
                                data={deviceData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {deviceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ChartCard>
                </div>

                {/* Time-based Chart */}
                <div className="mb-6 sm:mb-8">
                    <ChartCard title="Visits by Hour" height={300}>
                        <LineChart data={timeChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="visits" stroke="#8B5CF6" strokeWidth={2} />
                        </LineChart>
                    </ChartCard>
                </div>

                {/* Visitors Table */}
                <VisitorsTable visitors={mockVisitors} />
            </div>
        </div>
    );
} 