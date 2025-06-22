"use client";

import { useEffect } from 'react';

interface VisitorTrackerProps {
    pageName?: string;
    autoTrack?: boolean;
}

export default function VisitorTracker({ pageName = 'Unknown', autoTrack = true }: VisitorTrackerProps) {
    useEffect(() => {
        if (!autoTrack) return;

        const trackVisit = async () => {
            try {
                const response = await fetch('/api/visitor', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        page: pageName,
                        timestamp: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    // Successfully tracked - no need to log
                }
            } catch (error) {
                console.error('Failed to track visitor:', error);
            }
        };

        // Track the visit
        trackVisit();
    }, [pageName, autoTrack]);

    // This component doesn't render anything
    return null;
} 