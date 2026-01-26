# MongoDB Setup Guide

## Quick Setup Options

### Option 1: MongoDB Atlas (Cloud) - RECOMMENDED ⭐

**Easiest option - No installation needed!**

1. **Sign up for free MongoDB Atlas account:**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Create a free account (M0 Free Tier)

2. **Create a cluster:**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select a cloud provider and region
   - Click "Create"

3. **Set up database access:**
   - Go to "Database Access" → "Add New Database User"
   - Create username and password (save these!)
   - Set privileges to "Atlas Admin"

4. **Set up network access:**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your specific IP address

5. **Get connection string:**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Update your .env file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/scms?retryWrites=true&w=majority
   ```
   Replace `username`, `password`, and `cluster0.xxxxx` with your actual values.
   Add `/scms` before the `?` to use a database named "scms".

7. **Restart your server:**
   ```powershell
   # Stop current server (Ctrl+C)
   # Then restart:
   .\start-dev.bat
   ```

### Option 2: Local MongoDB Installation

**For Windows:**

1. **Download MongoDB:**
   - Go to: https://www.mongodb.com/try/download/community
   - Download Windows installer
   - Run the installer

2. **Install MongoDB:**
   - Choose "Complete" installation
   - Install as Windows Service (recommended)
   - Install MongoDB Compass (GUI tool)

3. **Start MongoDB Service:**
   ```powershell
   net start MongoDB
   ```

4. **Verify it's running:**
   ```powershell
   Get-Service MongoDB
   ```

5. **Default connection:**
   - Your `.env` already has: `MONGODB_URI=mongodb://localhost:27017/scms`
   - This should work if MongoDB service is running

6. **Restart your server:**
   ```powershell
   .\start-dev.bat
   ```

### Option 3: MongoDB via Docker (Advanced)

If you have Docker installed:

```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Then use: `mongodb://localhost:27017/scms`

## Verify Connection

After setting up MongoDB, restart your server and you should see:

```
🚀 Server running on port 5000
📡 API available at http://localhost:5000/api
⏳ Attempting to connect to MongoDB...
✅ Connected to MongoDB
```

## Troubleshooting

### "MongoServerError: Authentication failed"
- Check username/password in connection string
- Verify database user has correct permissions

### "MongoServerError: IP not whitelisted"
- Add your IP address in MongoDB Atlas Network Access
- Or use "Allow Access from Anywhere" for development

### "Connection timeout"
- Check if MongoDB service is running (local)
- Verify connection string is correct
- Check firewall settings
- For Atlas: Verify cluster is running (not paused)

### "Cannot find module 'mongoose'"
- Run: `npm install` in backend directory

## Recommended: MongoDB Atlas

**Why use Atlas?**
- ✅ No installation needed
- ✅ Free tier available
- ✅ Automatic backups
- ✅ Easy to share with team
- ✅ Works from anywhere
- ✅ No local setup required

## Next Steps

Once MongoDB is connected:
1. ✅ Server will show "Connected to MongoDB"
2. ✅ API endpoints will work
3. ✅ You can submit complaints
4. ✅ Data will be stored in MongoDB

## Need Help?

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- MongoDB Local Install: https://docs.mongodb.com/manual/installation/
- Check `STATUS.md` for server status