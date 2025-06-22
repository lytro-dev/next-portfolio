'use client';

import { useState, useEffect } from 'react';

export default function SimpleTestPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testAPI = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/data');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        testAPI();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Simple API Test</h1>
                
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">API Status</h2>
                    
                    {loading && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                    
                    {data && (
                        <div>
                            <div className="mb-4">
                                <strong>Data received:</strong> {Array.isArray(data) ? `${data.length} records` : 'Invalid format'}
                            </div>
                            
                            {Array.isArray(data) && data.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Sample Data:</h3>
                                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                                        {JSON.stringify(data.slice(0, 2), null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <button
                        onClick={testAPI}
                        disabled={loading}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Testing...' : 'Test Again'}
                    </button>
                </div>
            </div>
        </div>
    );
} 