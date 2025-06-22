import { ResponsiveContainer } from 'recharts';
import { ReactElement } from 'react';

interface ResponsiveChartProps {
    children: ReactElement;
    height?: number;
    aspect?: number;
    className?: string;
}

export default function ResponsiveChart({ 
    children, 
    height = 300, 
    aspect = 16/9,
    className = "" 
}: ResponsiveChartProps) {
    return (
        <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
            <ResponsiveContainer width="100%" height="100%">
                {children}
            </ResponsiveContainer>
        </div>
    );
} 