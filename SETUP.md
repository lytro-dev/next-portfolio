# Dashboard Setup Guide

## Quick Start

Your dashboard is currently not working because it needs a database connection. Here are the steps to fix it:

### 1. Create Environment File

Create a `.env` file in the root directory with your database connection:

```env
NEON_DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

### 2. Get Database URL

You need a PostgreSQL database. You can use:
- **Neon** (recommended): https://neon.tech (free tier available)
- **Supabase**: https://supabase.com (free tier available)
- **Railway**: https://railway.app
- **Local PostgreSQL**: If you have it installed

### 3. Test Your Setup

Visit these pages to test your setup:

- **Demo Dashboard**: `/dashboard/demo` - Shows mock data (works without database)
- **System Status**: `/dashboard/fallback` - Tests database connection
- **Simple Test**: `/test-simple` - Basic API test
- **Debug Page**: `/debug` - Database debugging tools

### 4. Create Database Table

Once connected, the app will automatically create the `visitor_info` table, or you can run:

```sql
CREATE TABLE IF NOT EXISTS visitor_info (
    id SERIAL PRIMARY KEY,
    ip VARCHAR(45) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    visit_time TIMESTAMP DEFAULT NOW()
);
```

### 5. Add Sample Data (Optional)

You can add sample data using the visitor tracking API:

```bash
curl -X POST http://localhost:3000/api/visitor
```

## Troubleshooting

### If the dashboard is still loading:

1. **Check .env file exists** - Make sure you created the `.env` file
2. **Verify database URL** - Test the connection string
3. **Check network** - Ensure your database is accessible
4. **Visit test pages** - Use the debug pages to identify issues

### Common Issues:

- **Missing .env file** - Create it with your database URL
- **Invalid database URL** - Check the connection string format
- **Database not accessible** - Verify firewall/network settings
- **Table doesn't exist** - The app will create it automatically

## Demo Mode

If you want to see the dashboard working without a database, visit `/dashboard/demo` - this shows mock data and demonstrates the UI.

## Next Steps

Once your database is connected:
1. Visit `/dashboard` for the full analytics dashboard
2. Add visitor tracking to your pages
3. Customize the dashboard as needed

Need help? Check the debug pages for detailed error information! 