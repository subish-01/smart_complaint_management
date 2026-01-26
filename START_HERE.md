# 🚀 How to Start SCMS - Quick Guide

## Prerequisites Check

Before starting, make sure you have:
- ✅ Node.js installed
- ✅ MongoDB running (local or Atlas)
- ✅ All dependencies installed (`npm install` in backend folder)

## Step-by-Step Startup

### Step 1: Start MongoDB

**Option A: Local MongoDB**
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# If not running, start it:
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
- Make sure your `.env` file has the correct Atlas connection string
- No need to start anything - it's in the cloud!

### Step 2: Start Backend Server

Open a **PowerShell terminal** and run:

```powershell
# Navigate to backend folder
cd C:\Users\subish\OneDrive\Desktop\smart-complaint-management\backend

# Start the server (choose one method):
# Method 1: Use batch file (easiest)
.\start-dev.bat

# Method 2: Use npm directly
& "C:\Program Files\nodejs\npm.cmd" run dev

# Method 3: Use npm start (production mode)
& "C:\Program Files\nodejs\npm.cmd" start
```

**Expected Output:**
```
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
⏳ Attempting to connect to MongoDB...
✅ Connected to MongoDB  (if MongoDB is running)
```

**Keep this terminal open!** The server needs to keep running.

### Step 3: Start Frontend Server

Open a **NEW PowerShell terminal** (keep backend running) and run:

```powershell
# Navigate to frontend folder
cd C:\Users\subish\OneDrive\Desktop\smart-complaint-management\smart-complaint

# Start HTTP server (choose one method):
# Method 1: Using Python
python -m http.server 8000

# Method 2: Using Node.js http-server (if installed)
npx http-server -p 8000

# Method 3: Using VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

**Expected Output:**
```
Serving HTTP on 0.0.0.0 port 8000 ...
```

### Step 4: Open in Browser

Open your web browser and go to:
```
http://localhost:8000
```

You should see the **Smart Complaint Management System** homepage!

## Quick Commands Summary

### Terminal 1 (Backend):
```powershell
cd backend
.\start-dev.bat
```

### Terminal 2 (Frontend):
```powershell
cd smart-complaint
python -m http.server 8000
```

### Browser:
```
http://localhost:8000
```

## Verify Everything is Working

1. **Backend Health Check:**
   - Open: http://localhost:5000/api/health
   - Should return: `{"status":"OK",...}`

2. **Frontend:**
   - Open: http://localhost:8000
   - Should see the SCMS homepage

3. **Test Connection:**
   - Open: `test-connection.html` in browser
   - Click "Test Backend Connection"
   - Should show ✅ green status

## Troubleshooting

### Backend won't start?
- Check if MongoDB is running
- Check if port 5000 is already in use
- Look for error messages in terminal

### Frontend can't connect to backend?
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify `API_BASE_URL` in `smart-complaint/api.js` is `http://localhost:5000/api`

### MongoDB connection error?
- See `backend/MONGODB_SETUP.md` for detailed setup
- For Atlas: Check connection string in `.env`
- For local: Make sure MongoDB service is running

## Stopping the Servers

**To stop:**
- **Backend:** Press `Ctrl+C` in the backend terminal
- **Frontend:** Press `Ctrl+C` in the frontend terminal

## Need Help?

- Check `backend/QUICK_START.md` for backend details
- Check `backend/MONGODB_SETUP.md` for MongoDB setup
- Check `CONNECTION_STATUS.md` for connection info
- Check `SETUP.md` for detailed setup instructions