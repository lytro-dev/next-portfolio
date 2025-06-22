interface ErrorDisplayProps {
    error: string;
    onRetry?: () => void;
    title?: string;
}

export default function ErrorDisplay({ error, onRetry, title = "Error" }: ErrorDisplayProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md mx-auto">
                <div className="text-red-600 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
} 