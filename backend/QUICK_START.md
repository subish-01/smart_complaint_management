# Quick Start Guide - Backend Server

## Current Status
✅ Dependencies installed (`node_modules/` exists)
✅ All files present
⏳ Server needs to be started

## Step 1: Check MongoDB

**Before starting the server, MongoDB must be running!**

### Option A: Local MongoDB
```powershell
# Check if MongoDB is running
Get-Service MongoDB

# If not running, start it:
net start MongoDB
```

### Option B: MongoDB Atlas (Cloud)
- Make sure you have a MongoDB Atlas cluster
- Update `MONGODB_URI` in `.env` file

## Step 2: Start the Server

### Option 1: Use Batch File (Easiest)
Double-click `start-dev.bat` in the backend folder

### Option 2: PowerShell
```powershell
# Make sure you're in the backend directory
cd C:\Users\subish\OneDrive\Desktop\smart-complaint-management\backend

# Start in development mode (with auto-reload)
& "C:\Program Files\nodejs\npm.cmd" run dev

# Or production mode
& "C:\Program Files\nodejs\npm.cmd" start
```

### Option 3: Use nodemon directly
```powershell
& "C:\Program Files\nodejs\npx.cmd" nodemon server.js
```

## Expected Output

When server starts successfully, you should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
```

## Common Issues

### Issue 1: "Cannot connect to MongoDB"
**Solution:**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- For Atlas: Verify connection string and IP whitelist

### Issue 2: "nodemon not found"
**Solution:**
```powershell
& "C:\Program Files\nodejs\npm.cmd" install nodemon --save-dev
```

### Issue 3: "Port 5000 already in use"
**Solution:**
- Change PORT in `.env` file
- Or kill the process using port 5000:
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Step 3: Verify Server is Running

### Test in Browser:
Open: http://localhost:5000/api/health

Should return:
```json
{
  "status": "OK",
  "message": "SCMS Backend is running",
  "timestamp": "..."
}
```

### Test with PowerShell:
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/health | Select-Object -ExpandProperty Content
```

## Step 4: Start Frontend

Once backend is running, start the frontend in another terminal:

```powershell
cd C:\Users\subish\OneDrive\Desktop\smart-complaint-management\smart-complaint
python -m http.server 8000
```

Then open: http://localhost:8000

## Full System Check

1. ✅ MongoDB running
2. ✅ Backend server running on port 5000
3. ✅ Frontend server running on port 8000
4. ✅ Browser opens http://localhost:8000

## Need Help?

- Check backend logs in the terminal
- Check browser console for frontend errors
- Verify MongoDB connection
- See `CONNECTION_STATUS.md` for detailed connection info