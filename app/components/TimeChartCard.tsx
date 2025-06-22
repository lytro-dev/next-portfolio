import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimeChartCardProps {
    title: string;
    data: Array<{ hour: string; visits: number }>;
    height?: number;
    className?: string;
}

export default function TimeChartCard({ title, data, height = 300, className = "" }: TimeChartCardProps) {
    // Only show the data passed in props (no navigation, no simulation)
    const currentData = useMemo(() => data, [data]);

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
                    {/* No navigation controls */}
                </div>
            </div>
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
    );
} 