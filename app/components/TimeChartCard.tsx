import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VisitorInfo } from '../types/dashboard';

interface TimeChartCardProps {
    title: string;
    data: VisitorInfo[];
    height?: number;
    className?: string;
}

export default function TimeChartCard({ title, data, height = 300, className = "" }: TimeChartCardProps) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Process visitors data to create time chart data
    const timeChartData = useMemo(() => {
        // Filter visitors by selected date (using local timezone)
        const filteredVisitors = data.filter(visitor => {
            try {
                // Parse the visitor timestamp - handle different formats
                let visitorDate;
                if (visitor.client_timestamp.includes('/')) {
                    // Handle format like "6/22/2025, 12:44:20 AM"
                    visitorDate = new Date(visitor.client_timestamp);
                } else {
                    // Handle ISO format
                    visitorDate = new Date(visitor.client_timestamp);
                }

                // Convert to YYYY-MM-DD format for comparison
                const year = visitorDate.getFullYear();
                const month = String(visitorDate.getMonth() + 1).padStart(2, '0');
                const day = String(visitorDate.getDate()).padStart(2, '0');
                const visitDateLocal = `${year}-${month}-${day}`;

                console.log('Visitor timestamp:', visitor.client_timestamp);
                console.log('Parsed date:', visitDateLocal);
                console.log('Selected date:', selectedDate);
                console.log('Match:', visitDateLocal === selectedDate);

                return visitDateLocal === selectedDate;
            } catch (error) {
                console.error('Error parsing timestamp:', visitor.client_timestamp, error);
                return false;
            }
        });

        console.log('Selected date:', selectedDate);
        console.log('Total visitors:', data.length);
        console.log('Filtered visitors for date:', filteredVisitors.length);
        console.log('Sample visitor timestamp:', filteredVisitors[0]?.client_timestamp);

        // Group by hour (using local timezone)
        const timeData = filteredVisitors.reduce((acc, visitor) => {
            try {
                let visitorDate;
                if (visitor.client_timestamp.includes('/')) {
                    // Handle format like "6/22/2025, 12:44:20 AM"
                    visitorDate = new Date(visitor.client_timestamp);
                } else {
                    // Handle ISO format
                    visitorDate = new Date(visitor.client_timestamp);
                }

                const hour = visitorDate.getHours(); // Uses local timezone
                acc[hour] = (acc[hour] || 0) + 1;

                console.log(`Visitor at ${visitorDate.toLocaleString()}, hour: ${hour}`);
            } catch (error) {
                console.error('Error getting hour from timestamp:', visitor.client_timestamp, error);
            }
            return acc;
        }, {} as Record<number, number>);

        console.log('Time data by hour:', timeData);

        // Create array for all 24 hours
        const result = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            visits: timeData[i] || 0,
            date: selectedDate
        }));

        console.log('Final chart data:', result);
        return result;
    }, [data, selectedDate]);

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
    };

    const handlePreviousDate = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() - 1);
        setSelectedDate(currentDate.toISOString().split('T')[0]);
    };

    const handleNextDate = () => {
        const currentDate = new Date(selectedDate);
        currentDate.setDate(currentDate.getDate() + 1);
        const nextDate = currentDate.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];

        // Don't allow going to future dates
        if (nextDate <= today) {
            setSelectedDate(nextDate);
        }
    };

    const canGoPrevious = true; // Can always go to previous dates
    const canGoNext = selectedDate < new Date().toISOString().split('T')[0]; // Can't go to future dates

    // Format hour labels properly (1, 2, 3, etc.)
    const formatHourLabel = (hour: string) => {
        const hourNum = parseInt(hour);
        return hourNum.toString();
    };

    // Format data with proper hour labels
    const formattedData = useMemo(() => {
        return timeChartData.map(item => ({
            ...item,
            hour: formatHourLabel(item.hour)
        }));
    }, [timeChartData]);

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>

                    {/* Date Picker */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePreviousDate}
                            disabled={!canGoPrevious}
                            className={`p-2 rounded-lg border transition-colors ${canGoPrevious
                                ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            title="Previous day"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                id="chart-date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                max={new Date().toISOString().split('T')[0]}
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            onClick={handleNextDate}
                            disabled={!canGoNext}
                            className={`p-2 rounded-lg border transition-colors ${canGoNext
                                ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                                : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            title="Next day"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-4" style={{ height: `${height}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedData}>
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
    );
} 