"use client";

import { useState, useEffect } from 'react';
import VisitorTracker from '../components/VisitorTracker';

export default function TestTrackingPage() {
    const [trackingResult, setTrackingResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testTracking = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/visitor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    page: 'Test Page',
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                const data = await response.json();
                setTrackingResult(data);
            } else {
                setTrackingResult({ error: 'Failed to track visitor' });
            }
        } catch (error) {
            setTrackingResult({ error: 'Network error' });
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/visitor');
            if (response.ok) {
                const data = await response.json();
                setTrackingResult(data);
            }
        } catch (error) {
            setTrackingResult({ error: 'Failed to get location' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Visitor Tracking Test</h1>
                
                {/* Auto-tracking component */}
                <VisitorTracker pageName="Test Tracking Page" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Manual Tracking */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Tracking</h2>
                        <p className="text-gray-600 mb-4">
                            Click the button below to manually track a visit with geolocation data.
                        </p>
                        <button
                            onClick={testTracking}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Tracking...' : 'Track This Visit'}
                        </button>
                    </div>

                    {/* Get Current Location */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Current Location</h2>
                        <p className="text-gray-600 mb-4">
                            Get your current IP location without tracking a visit.
                        </p>
                        <button
                            onClick={getCurrentLocation}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Getting...' : 'Get My Location'}
                        </button>
                    </div>
                </div>

                {/* Results Display */}
                {trackingResult && (
                    <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tracking Results</h2>
                        
                        {trackingResult.error ? (
                            <div className="text-red-600">
                                <p className="font-medium">Error:</p>
                                <p>{trackingResult.error}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-gray-900">IP Address:</h3>
                                    <p className="text-gray-600 font-mono">{trackingResult.ip || trackingResult.visitor?.ip}</p>
                                </div>
                                
                                {trackingResult.geolocation && (
                                    <div>
                                        <h3 className="font-medium text-gray-900">Geolocation Data:</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <p className="text-sm text-gray-500">Country:</p>
                                                <p className="text-gray-900">{trackingResult.geolocation.country}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">City:</p>
                                                <p className="text-gray-900">{trackingResult.geolocation.city}</p>
                                            </div>
                                            {trackingResult.geolocation.region && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Region:</p>
                                                    <p className="text-gray-900">{trackingResult.geolocation.region}</p>
                                                </div>
                                            )}
                                            {trackingResult.geolocation.timezone && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Timezone:</p>
                                                    <p className="text-gray-900">{trackingResult.geolocation.timezone}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {trackingResult.visitor && (
                                    <div>
                                        <h3 className="font-medium text-gray-900">Database Record:</h3>
                                        <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                                            {JSON.stringify(trackingResult.visitor, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h2 className="text-lg font-semibold text-blue-900 mb-4">How to Use</h2>
                    <div className="space-y-2 text-blue-800">
                        <p>• <strong>Auto-tracking:</strong> This page automatically tracks visits when loaded</p>
                        <p>• <strong>Manual tracking:</strong> Click "Track This Visit" to manually add a visit record</p>
                        <p>• <strong>Location check:</strong> Click "Get My Location" to see your IP geolocation</p>
                        <p>• <strong>Database:</strong> All tracked visits are stored in your PostgreSQL database</p>
                        <p>• <strong>Dashboard:</strong> View all tracked data in your analytics dashboard</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 