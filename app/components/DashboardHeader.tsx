interface DashboardHeaderProps {
    lastUpdated: Date;
    autoRefresh: boolean;
    onAutoRefreshChange: (checked: boolean) => void;
    onRefresh: () => void;
    timeRange: string;
    onTimeRangeChange: (value: string) => void;
    selectedCountry: string;
    onCountryChange: (value: string) => void;
    uniqueCountries: string[];
}

export default function DashboardHeader({
    lastUpdated,
    autoRefresh,
    onAutoRefreshChange,
    onRefresh,
    timeRange,
    onTimeRangeChange,
    selectedCountry,
    onCountryChange,
    uniqueCountries
}: DashboardHeaderProps) {
    return (
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center py-4 sm:py-6 space-y-4 lg:space-y-0">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Real-time visitor analytics with IP geolocation • Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => onAutoRefreshChange(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">Auto-refresh</span>
                        </div>
                        <button
                            onClick={onRefresh}
                            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Refresh</span>
                        </button>
                        <select
                            value={timeRange}
                            onChange={(e) => onTimeRangeChange(e.target.value)}
                            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                        <select
                            value={selectedCountry}
                            onChange={(e) => onCountryChange(e.target.value)}
                            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                            <option value="all">All Countries</option>
                            {uniqueCountries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
} 