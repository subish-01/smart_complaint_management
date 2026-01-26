# Server Status

## Current Status: ⏳ Starting...

The server is starting but **waiting for MongoDB connection**.

## What's Happening:

1. ✅ Server code is executing
2. ✅ Nodemon is watching for changes
3. ⏳ Waiting for MongoDB connection
4. ❌ MongoDB might not be running

## Next Steps:

### Step 1: Check MongoDB Status

**If using LOCAL MongoDB:**
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# If not running, start it:
net start MongoDB

# Or check if mongod process is running:
Get-Process mongod -ErrorAction SilentlyContinue
```

**If using MongoDB Atlas (Cloud):**
- Make sure your connection string in `.env` is correct
- Verify your IP is whitelisted in Atlas
- Check that the cluster is running

### Step 2: Verify MongoDB Connection String

Check your `backend/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/scms
```

Or for Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/scms
```

### Step 3: Check Server Logs

Look at your terminal output. You should see:
- ✅ `Connected to MongoDB` - Success!
- ❌ `MongoServerError` or `connection timeout` - MongoDB not accessible

## Expected Output When Running:

```
[nodemon] starting `node server.js`
✅ Connected to MongoDB
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
```

## Troubleshooting:

### Issue: "MongoServerError" or "Connection timeout"
**Solution:** 
- Start MongoDB service: `net start MongoDB`
- Or verify Atlas connection string
- Check firewall settings

### Issue: Deprecation warnings (already fixed)
**Fixed:** Removed `useNewUrlParser` and `useUnifiedTopology` from server.js

### Issue: Server won't start
**Solution:**
1. Check if port 5000 is already in use
2. Verify all dependencies are installed
3. Check for syntax errors in server.js

## Quick Fix Commands:

```powershell
# Start MongoDB (if local)
net start MongoDB

# If MongoDB is running, restart the server:
# Press Ctrl+C to stop, then run again:
.\start-dev.bat
```

## Once Connected:

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

Then test the API:
```powershell
# Test health endpoint
Invoke-WebRequest -Uri http://localhost:5000/api/health
```

Or open in browser: http://localhost:5000/api/health