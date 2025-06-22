"use client";

import { useState, useEffect } from 'react';

export default function DebugPage() {
    const [testResults, setTestResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const testDatabase = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/test-db');
            const data = await response.json();
            setTestResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const testDataAPI = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/data');
            const data = await response.json();
            setTestResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <button
                        onClick={testDatabase}
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Testing...' : 'Test Database Connection'}
                    </button>
                    
                    <button
                        onClick={testDataAPI}
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Testing...' : 'Test Data API'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {testResults && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                            {JSON.stringify(testResults, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow p-6 mt-8">
                    <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
                    <div className="space-y-2">
                        <div>
                            <strong>NEON_DATABASE_URL:</strong> 
                            <span className="ml-2 text-gray-600">
                                {process.env.NEXT_PUBLIC_NEON_DATABASE_URL ? 'Set (hidden)' : 'Not set'}
                            </span>
                        </div>
                        <div>
                            <strong>NODE_ENV:</strong> 
                            <span className="ml-2 text-gray-600">{process.env.NODE_ENV}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 