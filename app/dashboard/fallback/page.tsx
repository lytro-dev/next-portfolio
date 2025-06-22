'use client';

import { useState, useEffect } from 'react';

export default function FallbackDashboard() {
    const [status, setStatus] = useState<string>('Checking...');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkSystem = async () => {
            try {
                setStatus('Testing database connection...');
                
                // Test database connection
                const dbResponse = await fetch('/api/test-db');
                const dbData = await dbResponse.json();
                
                if (dbData.error) {
                    setError(`Database Error: ${dbData.error}`);
                    setStatus('Database connection failed');
                    return;
                }
                
                setStatus('Testing data API...');
                
                // Test data API
                const dataResponse = await fetch('/api/data');
                const dataData = await dataResponse.json();
                
                if (dataData.error) {
                    setError(`Data API Error: ${dataData.error}`);
                    setStatus('Data API failed');
                    return;
                }
                
                setStatus('All systems working!');
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setStatus('System check failed');
            }
        };

        checkSystem();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto text-center">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">System Status</h1>
                    
                    <div className="mb-6">
                        <div className="text-sm text-gray-600 mb-2">Status:</div>
                        <div className="text-lg font-medium text-blue-600">{status}</div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900 mb-2">Troubleshooting Steps:</h3>
                            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                                <li>Check if .env file exists with NEON_DATABASE_URL</li>
                                <li>Verify database connection string is correct</li>
                                <li>Ensure database is accessible</li>
                                <li>Check if visitor_info table exists</li>
                            </ol>
                        </div>
                        
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900 mb-2">Quick Tests:</h3>
                            <div className="space-y-2">
                                <a 
                                    href="/test-simple" 
                                    className="block text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    → Test Simple API
                                </a>
                                <a 
                                    href="/debug" 
                                    className="block text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    → Debug Database
                                </a>
                                <a 
                                    href="/dashboard" 
                                    className="block text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    → Try Main Dashboard
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 