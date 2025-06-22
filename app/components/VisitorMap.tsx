'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { VisitorInfo } from '../types/dashboard';

interface VisitorMapProps {
    visitors: VisitorInfo[];
    title?: string;
    height?: number;
    className?: string;
}

interface MapVisitor {
    id: number;
    lat: number;
    lng: number;
    country: string;
    city: string;
    state: string;
    ip: string;
    browser: string;
    os: string;
    device: string;
    timestamp: string;
    isVPN: boolean;
}

// Geocode city+country to lat/lng using OpenStreetMap Nominatim
async function geocodeCityCountry(city: string, country: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const query = encodeURIComponent(`${city}, ${country}`);
        const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
        const res = await fetch(url, { headers: { 'User-Agent': 'steve-portfolio-dashboard/1.0' } });
        const data = await res.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
        return null;
    } catch {
        return null;
    }
}

// Dynamic import for Leaflet components
const MapComponent = ({ visitors }: { visitors: MapVisitor[] }) => {
    const [MapContainer, setMapContainer] = useState<React.ComponentType<any> | null>(null);
    const [TileLayer, setTileLayer] = useState<React.ComponentType<any> | null>(null);
    const [Marker, setMarker] = useState<React.ComponentType<any> | null>(null);
    const [Popup, setPopup] = useState<React.ComponentType<any> | null>(null);
    const [L, setL] = useState<any>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        const loadLeaflet = async () => {
            const leaflet = await import('leaflet');
            const reactLeaflet = await import('react-leaflet');
            
            setL(leaflet.default);
            setMapContainer(reactLeaflet.MapContainer);
            setTileLayer(reactLeaflet.TileLayer);
            setMarker(reactLeaflet.Marker);
            setPopup(reactLeaflet.Popup);

            // Fix for default markers in react-leaflet
            delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
            leaflet.default.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });

            // Load CSS dynamically
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
            document.head.appendChild(link);
        };

        loadLeaflet();
    }, []);

    // Fit bounds to visitors when they change
    useEffect(() => {
        if (mapRef.current && L && visitors.length > 0) {
            const validVisitors = visitors.filter(v => v.lat !== 0 && v.lng !== 0);
            if (validVisitors.length > 0) {
                const bounds = L.latLngBounds(validVisitors.map(v => [v.lat, v.lng]));
                mapRef.current.fitBounds(bounds, {
                    padding: [20, 20],
                    maxZoom: 8,
                    animate: true
                });
            }
        }
    }, [visitors, L]);

    if (!MapContainer || !TileLayer || !Marker || !Popup || !L) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading map...</p>
                </div>
            </div>
        );
    }

    // Custom marker icons
    const createCustomIcon = (isVPN: boolean) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div style="
                    width: 20px; 
                    height: 20px; 
                    border-radius: 50%; 
                    background-color: ${isVPN ? '#ef4444' : '#10b981'}; 
                    border: 2px solid ${isVPN ? '#dc2626' : '#059669'}; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: white; 
                    font-weight: bold; 
                    font-size: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                ">
                    ${isVPN ? 'V' : 'D'}
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });
    };

    // Determine initial center and zoom based on visitors
    const getInitialView = () => {
        if (visitors.length === 0) {
            return { center: [20, 0], zoom: 2 };
        }
        
        const validVisitors = visitors.filter(v => v.lat !== 0 && v.lng !== 0);
        if (validVisitors.length === 0) {
            return { center: [20, 0], zoom: 2 };
        }
        
        if (validVisitors.length === 1) {
            return { center: [validVisitors[0].lat, validVisitors[0].lng], zoom: 6 };
        }
        
        // For multiple visitors, calculate center but let fitBounds handle the zoom
        const avgLat = validVisitors.reduce((sum, v) => sum + v.lat, 0) / validVisitors.length;
        const avgLng = validVisitors.reduce((sum, v) => sum + v.lng, 0) / validVisitors.length;
        return { center: [avgLat, avgLng], zoom: 3 };
    };

    const initialView = getInitialView();

    return (
        <MapContainer
            ref={mapRef}
            center={initialView.center}
            zoom={initialView.zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            boxZoom={true}
            dragging={true}
            maxBounds={[[-90, -180], [90, 180]]}
            maxBoundsViscosity={1.0}
            minZoom={1}
            maxZoom={10}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                noWrap={true}
                bounds={[[-90, -180], [90, 180]]}
            />
            
            {visitors.map((visitor) => (
                <Marker
                    key={visitor.id}
                    position={[visitor.lat, visitor.lng]}
                    icon={createCustomIcon(visitor.isVPN)}
                >
                    <Popup>
                        <div className="p-3 max-w-xs">
                            <h3 className="font-semibold text-gray-900 mb-2 text-base">
                                📍 {visitor.city}, {visitor.state && visitor.state !== 'Unknown' ? `${visitor.state}, ` : ''}{visitor.country}
                            </h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="bg-gray-50 p-2 rounded">
                                    <p className="font-medium text-gray-700 mb-1">📍 Address</p>
                                    <p>{visitor.city}{visitor.state && visitor.state !== 'Unknown' ? `, ${visitor.state}` : ''}</p>
                                    <p>{visitor.country}</p>
                                </div>
                                <div className="space-y-1">
                                    <p><strong>🌐 IP:</strong> {visitor.ip}</p>
                                    <p><strong>🌍 Browser:</strong> {visitor.browser}</p>
                                    <p><strong>💻 OS:</strong> {visitor.os}</p>
                                    <p><strong>📱 Device:</strong> {visitor.device}</p>
                                    <p><strong>🕒 Time:</strong> {new Date(visitor.timestamp).toLocaleString()}</p>
                                    <p><strong>🔗 Connection:</strong> 
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-1 ${
                                            visitor.isVPN ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {visitor.isVPN ? '🔒 VPN' : '🌐 Direct'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default function VisitorMap({ visitors, title = "Visitor Locations", height = 400, className = "" }: VisitorMapProps) {
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [isClient, setIsClient] = useState(false);
    const [geoCache, setGeoCache] = useState<Record<string, { lat: number; lng: number }>>({});
    const geoCacheRef = useRef(geoCache);

    useEffect(() => {
        geoCacheRef.current = geoCache;
    }, [geoCache]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Filter visitors based on time range and country
    const filteredVisitors = useMemo(() => {
        const now = new Date();
        let cutoffDate: Date;

        switch (timeRange) {
            case '24h':
                cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                cutoffDate = new Date(0); // Beginning of time
        }

        return visitors.filter(visitor => {
            const visitorDate = new Date(visitor.client_timestamp);
            const timeMatch = visitorDate >= cutoffDate;
            const countryMatch = selectedCountry === 'all' || visitor.country === selectedCountry;
            return timeMatch && countryMatch;
        });
    }, [visitors, timeRange, selectedCountry]);

    // Get unique countries for filter
    const uniqueCountries = useMemo(() => {
        return Array.from(new Set(visitors.map(v => v.country))).filter(c => c !== 'Unknown');
    }, [visitors]);

    // Country fallback coordinates
    const countryCoords: { [key: string]: { lat: number; lng: number } } = useMemo(() => ({
        'United States': { lat: 39.8283, lng: -98.5795 },
        'Canada': { lat: 56.1304, lng: -106.3468 },
        'United Kingdom': { lat: 55.3781, lng: -3.4360 },
        'Germany': { lat: 51.1657, lng: 10.4515 },
        'France': { lat: 46.2276, lng: 2.2137 },
        'Japan': { lat: 36.2048, lng: 138.2529 },
        'Australia': { lat: -25.2744, lng: 133.7751 },
        'Brazil': { lat: -14.2350, lng: -51.9253 },
        'India': { lat: 20.5937, lng: 78.9629 },
        'China': { lat: 35.8617, lng: 104.1954 },
        'Netherlands': { lat: 52.1326, lng: 5.2913 },
        'Sweden': { lat: 60.1282, lng: 18.6435 },
        'Norway': { lat: 60.4720, lng: 8.4689 },
        'Denmark': { lat: 56.2639, lng: 9.5018 },
        'Finland': { lat: 61.9241, lng: 25.7482 },
        'Poland': { lat: 51.9194, lng: 19.1451 },
        'Italy': { lat: 41.8719, lng: 12.5674 },
        'Spain': { lat: 40.4637, lng: -3.7492 },
        'Portugal': { lat: 39.3999, lng: -8.2245 },
        'Switzerland': { lat: 46.8182, lng: 8.2275 },
        'Austria': { lat: 47.5162, lng: 14.5501 },
        'Belgium': { lat: 50.8503, lng: 4.3517 },
        'Ireland': { lat: 53.1424, lng: -7.6921 },
        'New Zealand': { lat: -40.9006, lng: 174.8860 },
        'South Korea': { lat: 35.9078, lng: 127.7669 },
        'Singapore': { lat: 1.3521, lng: 103.8198 },
        'Thailand': { lat: 15.8700, lng: 100.9925 },
        'Malaysia': { lat: 4.2105, lng: 108.9758 },
        'Indonesia': { lat: -0.7893, lng: 113.9213 },
        'Philippines': { lat: 12.8797, lng: 121.7740 },
        'Vietnam': { lat: 14.0583, lng: 108.2772 },
        'Mexico': { lat: 23.6345, lng: -102.5528 },
        'Argentina': { lat: -38.4161, lng: -63.6167 },
        'Chile': { lat: -35.6751, lng: -71.5430 },
        'Colombia': { lat: 4.5709, lng: -74.2973 },
        'Peru': { lat: -9.1900, lng: -75.0152 },
        'Venezuela': { lat: 6.4238, lng: -66.5897 },
        'South Africa': { lat: -30.5595, lng: 22.9375 },
        'Egypt': { lat: 26.8206, lng: 30.8025 },
        'Nigeria': { lat: 9.0820, lng: 8.6753 },
        'Kenya': { lat: -0.0236, lng: 37.9062 },
        'Morocco': { lat: 31.7917, lng: -7.0926 },
        'Algeria': { lat: 28.0339, lng: 1.6596 },
        'Tunisia': { lat: 33.8869, lng: 9.5375 },
        'Turkey': { lat: 38.9637, lng: 35.2433 },
        'Israel': { lat: 31.0461, lng: 34.8516 },
        'Saudi Arabia': { lat: 23.8859, lng: 45.0792 },
        'UAE': { lat: 23.4241, lng: 53.8478 },
        'Qatar': { lat: 25.3548, lng: 51.1839 },
        'Kuwait': { lat: 29.3117, lng: 47.4818 },
        'Iran': { lat: 32.4279, lng: 53.6880 },
        'Iraq': { lat: 33.2232, lng: 43.6793 },
        'Pakistan': { lat: 30.3753, lng: 69.3451 },
        'Bangladesh': { lat: 23.6850, lng: 90.3563 },
        'Sri Lanka': { lat: 7.8731, lng: 80.7718 },
        'Nepal': { lat: 28.3949, lng: 84.1240 },
        'Myanmar': { lat: 21.9162, lng: 95.9560 },
        'Cambodia': { lat: 12.5657, lng: 104.9910 },
        'Laos': { lat: 19.8563, lng: 102.4955 },
        'Mongolia': { lat: 46.8625, lng: 103.8467 },
        'Kazakhstan': { lat: 48.0196, lng: 66.9237 },
        'Uzbekistan': { lat: 41.3775, lng: 64.5853 },
        'Ukraine': { lat: 48.3794, lng: 31.1656 },
        'Belarus': { lat: 53.7098, lng: 27.9534 },
        'Romania': { lat: 45.9432, lng: 24.9668 },
        'Bulgaria': { lat: 42.7339, lng: 25.4858 },
        'Greece': { lat: 39.0742, lng: 21.8243 },
        'Croatia': { lat: 45.1000, lng: 15.2000 },
        'Serbia': { lat: 44.0165, lng: 21.0059 },
        'Hungary': { lat: 47.1625, lng: 19.5033 },
        'Czech Republic': { lat: 49.8175, lng: 15.4730 },
        'Slovakia': { lat: 48.6690, lng: 19.6990 },
        'Slovenia': { lat: 46.0569, lng: 14.5058 },
        'Estonia': { lat: 58.5953, lng: 25.0136 },
        'Latvia': { lat: 56.8796, lng: 24.6032 },
        'Lithuania': { lat: 55.1694, lng: 23.8813 },
    }), []);

    // Geocode all unique city+country pairs and cache them
    useEffect(() => {
        const uniqueCityCountry = Array.from(new Set(filteredVisitors.map(v => `${v.city},${v.country}`)));
        uniqueCityCountry.forEach(async (key) => {
            if (!geoCacheRef.current[key]) {
                const [city, country] = key.split(',');
                const coords = await geocodeCityCountry(city, country);
                if (coords) {
                    setGeoCache(prev => ({ ...prev, [key]: coords }));
                }
            }
        });
    }, [filteredVisitors]);

    // Generate map visitors with geocoded coordinates
    const mapVisitors = useMemo(() => {
        return filteredVisitors.map((visitor) => {
            const key = `${visitor.city},${visitor.country}`;
            let coords = geoCache[key];
            if (!coords) {
                coords = countryCoords[visitor.country] || { lat: 0, lng: 0 };
            }
            return {
                id: visitor.id,
                lat: coords.lat,
                lng: coords.lng,
                country: visitor.country,
                city: visitor.city,
                state: visitor.state,
                ip: visitor.ip,
                browser: visitor.browser,
                os: visitor.os,
                device: visitor.device,
                timestamp: visitor.client_timestamp,
                isVPN: visitor.isVPN,
            };
        });
    }, [filteredVisitors, geoCache, countryCoords]);

    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>
                    
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Time Range Filter */}
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d' | 'all')}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>

                        {/* Country Filter */}
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Countries</option>
                            {uniqueCountries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Direct Connection</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>VPN Connection</span>
                        </div>
                    </div>
                    <div>
                        Showing {mapVisitors.length} visitors
                    </div>
                </div>

                <div 
                    style={{ height: `${height}px` }}
                    className="rounded-lg border border-gray-200 overflow-hidden"
                >
                    {isClient ? (
                        <MapComponent visitors={mapVisitors} />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-50">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-gray-600">Loading map...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 