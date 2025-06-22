# Portfolio Server Dashboard

A comprehensive analytics dashboard for tracking portfolio website visitors with advanced filtering, sorting, historical data navigation, and interactive Leaflet maps visualization.

## Features

### Visitor Analytics
- **Real-time visitor tracking** with detailed analytics
- **Geographic data** including country, state, and city information
- **Device and browser analytics** with platform detection
- **VPN detection** to identify proxy connections
- **Language and page tracking** for comprehensive visitor insights

### Interactive Leaflet Maps
- **Visitor location mapping** with custom markers for each visitor
- **Time-based filtering** - View visitors from last 24h, 7d, 30d, or all time
- **Country filtering** - Filter map to show visitors from specific countries
- **Connection type indicators** - Green markers for direct connections, red for VPN
- **Detailed popups** - Click markers to see visitor details
- **Responsive map design** - Works seamlessly across all device sizes
- **Free and open-source** - No API key required

### Advanced Table Features
- **Sortable columns** - Click any column header to sort by that field
- **Search functionality** - Search across IP, country, city, browser, OS, and device fields
- **VPN filtering** - Filter to show all connections, VPN only, or direct connections only
- **Real-time results count** - See how many visitors match your current filters

### Interactive Charts
- **Country distribution** - Bar chart showing visitor distribution by country
- **Browser analytics** - Bar chart of browser usage statistics
- **Operating system breakdown** - Pie chart of OS distribution
- **Device type analysis** - Pie chart showing device categories
- **Time-based analytics** - Line chart with historical navigation

### Historical Data Navigation
- **Previous/Next navigation** - Navigate through different time periods
- **Period indicators** - Clear labeling of current, previous, and future periods
- **Reset functionality** - Quick return to current period
- **Responsive design** - Works seamlessly across all device sizes

## Technology Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts library
- **Maps**: Leaflet with OpenStreetMap tiles
- **Data Visualization**: Responsive and interactive charts
- **Real-time Updates**: Auto-refresh capabilities

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Dashboard Features

### Leaflet Maps Integration
- Interactive world map showing visitor locations using OpenStreetMap
- Custom markers with connection type indicators
- Time-based filtering (24h, 7d, 30d, all time)
- Country-specific filtering
- Click markers for detailed visitor information
- Automatic bounds fitting for optimal viewing
- No API key required - completely free to use

### Table Sorting & Filtering
- Click column headers to sort by any field (ID, IP, Country, Browser, etc.)
- Use the search box to filter visitors by multiple criteria
- Select VPN filter to show specific connection types
- Results count updates automatically based on current filters

### Time Chart Navigation
- Use arrow buttons to navigate between different time periods
- View historical data with consistent patterns
- Reset button to return to current period
- Period indicator shows which time period is currently displayed

### Responsive Design
- Mobile-friendly interface with responsive tables
- Adaptive chart and map sizing for different screen sizes
- Touch-friendly navigation controls
- Optimized for desktop, tablet, and mobile viewing

## API Endpoints

The dashboard connects to various API endpoints for data retrieval:
- `/api/visitor` - Visitor tracking and analytics
- `/api/data` - Dashboard metrics and statistics
- `/api/analytics` - Advanced analytics data
- `/api/schema` - Data schema information

## Configuration

### Environment Variables
Create a `.env.local` file in your project root:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### Google Maps Setup
For detailed Google Maps API setup instructions, see [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md).

## Contributing

This project uses TypeScript for type safety and follows modern React patterns with hooks and functional components.