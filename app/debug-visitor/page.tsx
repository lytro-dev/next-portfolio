"use client";

import { useState } from 'react';

interface TestResults {
    type: string;
    data?: unknown;
    error?: string;
}

export default function DebugVisitorPage() {
    const [testResults, setTestResults] = useState<TestResults | null>(null);
    const [loading, setLoading] = useState(false);

    const testDatabase = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test-db');
            const data = await response.json();
            setTestResults({ type: 'database', data });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setTestResults({ type: 'database', error: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const testGeolocation = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/visitor');
            const data = await response.json();
            setTestResults({ type: 'geolocation', data });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setTestResults({ type: 'geolocation', error: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const testVisitorTracking = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/visitor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test: true })
            });
            const data = await response.json();
            setTestResults({ type: 'tracking', data });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setTestResults({ type: 'tracking', error: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Visitor Tracking Debug</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <button
                        onClick={testDatabase}
                        disabled={loading}
                        className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        Test Database
                    </button>
                    
                    <button
                        onClick={testGeolocation}
                        disabled={loading}
                        className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        Test Geolocation
                    </button>
                    
                    <button
                        onClick={testVisitorTracking}
                        disabled={loading}
                        className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                        Test Tracking
                    </button>
                </div>

                {loading && (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Testing...</p>
                    </div>
                )}

                {testResults && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Test Results: {testResults.type}
                        </h2>
                        
                        {testResults.error ? (
                            <div className="text-red-600">
                                <p className="font-medium">Error:</p>
                                <pre className="bg-red-50 p-4 rounded-lg text-sm overflow-x-auto">
                                    {testResults.error}
                                </pre>
                            </div>
                        ) : (
                            <div>
                                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                    {JSON.stringify(testResults.data, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                    <h2 className="text-lg font-semibold text-yellow-900 mb-4">Debugging Steps</h2>
                    <div className="space-y-2 text-yellow-800">
                        <p>1. <strong>Test Database:</strong> Check if the table exists and can be created</p>
                        <p>2. <strong>Test Geolocation:</strong> Verify IP geolocation is working</p>
                        <p>3. <strong>Test Tracking:</strong> Try to insert a visitor record</p>
                        <p>4. <strong>Check Console:</strong> Look at browser console for detailed logs</p>
                        <p>5. <strong>Check Network:</strong> Monitor network requests in browser dev tools</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 