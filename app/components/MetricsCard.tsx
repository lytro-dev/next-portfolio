interface MetricsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
    valueSize?: 'text-lg' | 'text-xl' | 'text-2xl' | 'text-xl sm:text-2xl';
    className?: string;
}

export default function MetricsCard({ 
    title, 
    value, 
    icon, 
    bgColor, 
    textColor, 
    valueSize = 'text-xl sm:text-2xl',
    className = ""
}: MetricsCardProps) {
    return (
        <div className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 ${className}`}>
            <div className="flex items-center">
                <div className={`p-2 sm:p-3 ${bgColor} rounded-lg`}>
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 ${textColor}`}>
                        {icon}
                    </div>
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
                    <p className={`${valueSize} font-bold text-gray-900 truncate`}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                </div>
            </div>
        </div>
    );
} 