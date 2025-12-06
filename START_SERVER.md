# How to Start the Application

## Quick Start Guide

### Step 1: Start the Backend Server

1. Open a terminal/command prompt
2. Navigate to the backend folder
   ```bash
   cd backend
   ```
3. Install dependencies (if not already done):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

   **You should see:**
   ```
   ✅ Connected to MongoDB Atlas
   Database: Milk_Management
   Collection: Milk_data
   🚀 Server is running on port 5000
   📍 API endpoint: http://localhost:5000/api/register
   ```

### Step 2: Start the Frontend (in a NEW terminal)

1. Open a **NEW** terminal/command prompt window
2. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
3. Install dependencies (if not already done):
   ```bash
   npm install
   ```
4. Start the React app:
   ```bash
   npm start
   ```

   The browser should automatically open to `http://localhost:3000`

## Verify Backend is Running

You can test if the backend is running by visiting:
- `http://localhost:5000` - Should show API status
- `http://localhost:5000/api/health` - Should show health check

## Troubleshooting

### "Network error" or "Cannot connect to backend"

1. **Check if backend is running:**
   - Look for the terminal showing "🚀 Server is running on port 5000"
   - If not, start it using `npm start` in the backend folder

2. **Check the port:**
   - Backend should be on port 5000
   - Frontend should be on port 3000
   - Make sure port 5000 is not being used by another application

3. **Check MongoDB connection:**
   - The backend terminal should show "✅ Connected to MongoDB Atlas"
   - If you see connection errors, check your MongoDB Atlas network access settings

4. **Test the connection:**
   - Open browser and go to: `http://localhost:5000/api/health`
   - You should see a JSON response with `"success": true`

### Common Issues

- **Port already in use:** Change PORT in backend/server.js or kill the process using port 5000
- **MongoDB connection failed:** Check your MongoDB Atlas connection string and network access
- **CORS errors:** Already handled in the backend, but ensure backend is running before frontend

## Important Notes

- **Always start the backend FIRST** before starting the frontend
- Keep both terminals open while using the application
- The backend must stay running for the frontend to work

