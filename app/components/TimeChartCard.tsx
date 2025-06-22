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
        // Filter visitors by selected date
        const filteredVisitors = data.filter(visitor => {
            const visitDate = new Date(visitor.client_timestamp).toISOString().split('T')[0];
            return visitDate === selectedDate;
        });

        // Group by hour
        const timeData = filteredVisitors.reduce((acc, visitor) => {
            const hour = new Date(visitor.client_timestamp).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        // Create array for all 24 hours
        return Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            visits: timeData[i] || 0,
            date: selectedDate
        }));
    }, [data, selectedDate]);

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value);
    };

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
                        <label htmlFor="chart-date" className="text-sm font-medium text-gray-700">
                            Date:
                        </label>
                        <input
                            type="date"
                            id="chart-date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            max={new Date().toISOString().split('T')[0]}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
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
            
            {/* Show data info */}
            <div className="px-4 sm:px-6 py-2 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                    Showing data for {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate} 
                    ({formattedData.filter(item => item.visits > 0).length} hours with activity)
                </p>
            </div>
        </div>
    );
} 