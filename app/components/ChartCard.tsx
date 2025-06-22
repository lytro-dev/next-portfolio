import ResponsiveChart from './ResponsiveChart';

interface ChartCardProps {
    title: string;
    children: React.ReactElement;
    height?: number;
    className?: string;
}

export default function ChartCard({ title, children, height = 300, className = "" }: ChartCardProps) {
    return (
        <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 ${className}`}>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">{title}</h3>
            <ResponsiveChart height={height}>
                {children}
            </ResponsiveChart>
        </div>
    );
} 