import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from './ChartCard';

interface TimeChartCardProps {
    title: string;
    data: Array<{ hour: string; visits: number }>;
    height?: number;
    className?: string;
}

export default function TimeChartCard({ title, data, height = 300, className = "" }: TimeChartCardProps) {
    const [currentPeriod, setCurrentPeriod] = useState(0);
    
    // Generate historical data for different days
    const generateHistoricalData = (period: number) => {
        const baseData = data.map(item => ({ ...item }));
        
        if (period === 0) {
            // Current day - use original data
            return baseData;
        } else {
            // Previous or future days - shift the data and adjust values
            const shiftedData = baseData.map((item, index) => {
                // Shift hours based on period (simulate different days)
                const hour = parseInt(item.hour.split(':')[0]);
                const shiftedHour = (hour + (period * 24)) % 24;
                
                // Adjust visit count based on period (weekend vs weekday patterns)
                let adjustedVisits = item.visits;
                
                if (period === -1) {
                    // Previous day - slightly different pattern
                    adjustedVisits = Math.max(0, item.visits + Math.floor(Math.random() * 3) - 1);
                } else if (period === -2) {
                    // Two days ago - weekend pattern (lower traffic)
                    adjustedVisits = Math.max(0, Math.floor(item.visits * 0.7) + Math.floor(Math.random() * 2));
                } else if (period === -3) {
                    // Three days ago - weekday pattern
                    adjustedVisits = Math.max(0, item.visits + Math.floor(Math.random() * 2) - 1);
                } else if (period === -4) {
                    // Four days ago - weekend pattern
                    adjustedVisits = Math.max(0, Math.floor(item.visits * 0.8) + Math.floor(Math.random() * 2));
                } else if (period === -5) {
                    // Five days ago - weekday pattern
                    adjustedVisits = Math.max(0, item.visits + Math.floor(Math.random() * 2) - 1);
                } else if (period === -6) {
                    // Six days ago - weekend pattern
                    adjustedVisits = Math.max(0, Math.floor(item.visits * 0.75) + Math.floor(Math.random() * 2));
                } else if (period === -7) {
                    // Week ago - similar to current day
                    adjustedVisits = Math.max(0, item.visits + Math.floor(Math.random() * 3) - 1);
                } else if (period === 1) {
                    // Next day - slight increase
                    adjustedVisits = item.visits + Math.floor(Math.random() * 2) + 1;
                } else if (period === 2) {
                    // Day after tomorrow - slight increase
                    adjustedVisits = item.visits + Math.floor(Math.random() * 3) + 1;
                }
                
                return {
                    hour: `${shiftedHour}:00`,
                    visits: adjustedVisits
                };
            });
            
            return shiftedData;
        }
    };

    const currentData = useMemo(() => generateHistoricalData(currentPeriod), [data, currentPeriod]);
    
    const getPeriodLabel = (period: number) => {
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + period);
        
        if (period === 0) {
            return "Today";
        } else if (period === -1) {
            return "Yesterday";
        } else if (period === 1) {
            return "Tomorrow";
        } else if (period === -7) {
            return "1 Week Ago";
        } else if (period === 7) {
            return "1 Week Later";
        } else {
            return targetDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };

    const canGoBack = currentPeriod > -7;
    const canGoForward = currentPeriod < 7;

    const handlePrevious = () => {
        if (canGoBack) {
            setCurrentPeriod(currentPeriod - 1);
        }
    };

    const handleNext = () => {
        if (canGoForward) {
            setCurrentPeriod(currentPeriod + 1);
        }
    };

    const handleReset = () => {
        setCurrentPeriod(0);
    };

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
                    
                    {/* Navigation Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevious}
                            disabled={!canGoBack}
                            className={`p-2 rounded-lg transition-colors ${
                                canGoBack 
                                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                                    : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title="Previous day"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        
                        <span className="text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded-md">
                            {getPeriodLabel(currentPeriod)}
                        </span>
                        
                        <button
                            onClick={handleNext}
                            disabled={!canGoForward}
                            className={`p-2 rounded-lg transition-colors ${
                                canGoForward 
                                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' 
                                    : 'text-gray-300 cursor-not-allowed'
                            }`}
                            title="Next day"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        
                        {currentPeriod !== 0 && (
                            <button
                                onClick={handleReset}
                                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                title="Reset to today"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="p-4 sm:p-6">
                <div style={{ height: `${height}px` }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={currentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                                type="monotone" 
                                dataKey="visits" 
                                stroke="#8B5CF6" 
                                strokeWidth={2}
                                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
} 