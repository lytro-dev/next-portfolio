"use client";

import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import MetricsCard from '../components/MetricsCard';
import ChartCard from '../components/ChartCard';
import VisitorsTable from '../components/VisitorsTable';
import DashboardHeader from '../components/DashboardHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { useDashboardData } from '../hooks/useDashboardData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Dashboard() {
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [timeRange, setTimeRange] = useState('24h');
    const [selectedCountry, setSelectedCountry] = useState('all');
    
    const { visitors, metrics, loading, error, lastUpdated, refetch } = useDashboardData();

    // Memoize the refetch function to prevent infinite loops
    const memoizedRefetch = useCallback(() => {
        refetch();
    }, [refetch]);

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefresh) return;
        
        const interval = setInterval(memoizedRefetch, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [autoRefresh, memoizedRefetch]);

    // Filter visitors based on selected country
    const filteredVisitors = selectedCountry === 'all' 
        ? visitors 
        : visitors.filter(v => v.country === selectedCountry);

    // Get unique countries for filter
    const uniqueCountries = Array.from(new Set(visitors.map(v => v.country))).filter(c => c !== 'Unknown');

    // Prepare chart data
    const countryData = Object.entries(
        filteredVisitors.reduce((acc, v) => {
            acc[v.country] = (acc[v.country] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value })).slice(0, 10);

    const browserData = Object.entries(
        filteredVisitors.reduce((acc, v) => {
            acc[v.browser] = (acc[v.browser] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value })).slice(0, 8);

    const osData = Object.entries(
        filteredVisitors.reduce((acc, v) => {
            acc[v.os] = (acc[v.os] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value })).slice(0, 8);

    const deviceData = Object.entries(
        filteredVisitors.reduce((acc, v) => {
            acc[v.device] = (acc[v.device] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name, value })).slice(0, 6);

    const timeData = filteredVisitors
        .reduce((acc, v) => {
            const hour = new Date(v.client_timestamp).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
        return acc;
        }, {} as Record<number, number>);

    const timeChartData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        visits: timeData[i] || 0
    }));

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <LoadingSpinner message="Loading dashboard data..." size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <ErrorDisplay 
                    error={error} 
                    onRetry={memoizedRefetch}
                    title="Error Loading Dashboard"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                lastUpdated={lastUpdated}
                autoRefresh={autoRefresh}
                onAutoRefreshChange={setAutoRefresh}
                onRefresh={memoizedRefetch}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                uniqueCountries={uniqueCountries}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <MetricsCard
                        title="Total Visits"
                        value={metrics.totalVisits}
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
                        value={metrics.uniqueVisitors}
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
                        value={metrics.recentActivity}
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
                        value={metrics.vpnVisits}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        }
                        bgColor="bg-red-100"
                        textColor="text-red-600"
                    />
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <MetricsCard
                        title="Top Country"
                        value={metrics.topCountry}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        bgColor="bg-purple-100"
                        textColor="text-purple-600"
                        valueSize="text-lg"
                    />
                    <MetricsCard
                        title="Top City"
                        value={metrics.topCity}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        }
                        bgColor="bg-indigo-100"
                        textColor="text-indigo-600"
                        valueSize="text-lg"
                    />
                    <MetricsCard
                        title="Top Browser"
                        value={metrics.topBrowser}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        }
                        bgColor="bg-pink-100"
                        textColor="text-pink-600"
                        valueSize="text-lg"
                    />
                    <MetricsCard
                        title="Top OS"
                        value={metrics.topOS}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        }
                        bgColor="bg-orange-100"
                        textColor="text-orange-600"
                        valueSize="text-lg"
                    />
                    <MetricsCard
                        title="Top Device"
                        value={metrics.topDevice}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        }
                        bgColor="bg-teal-100"
                        textColor="text-teal-600"
                        valueSize="text-lg"
                    />
                    <MetricsCard
                        title="Top Language"
                        value={metrics.topLanguage}
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                        }
                        bgColor="bg-cyan-100"
                        textColor="text-cyan-600"
                        valueSize="text-lg"
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
                <VisitorsTable visitors={filteredVisitors} />
            </div>
        </div>
    );
}
