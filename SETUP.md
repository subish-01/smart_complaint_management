# Setup Guide - Smart Complaint Management System

## Quick Start

### Step 1: Install MongoDB

**Option A: Local MongoDB**
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install and start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env`

### Step 2: Set Up Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # The .env file is already created
   # Edit it if needed:
   # - Update MONGODB_URI if using Atlas
   # - Change admin credentials
   # - Update JWT_SECRET for production
   ```

4. Create uploads directory (will be created automatically, but you can create manually):
   ```bash
   mkdir uploads
   ```

5. Start the backend server:
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Or production mode
   npm start
   ```

Backend should be running on `http://localhost:5000`

### Step 3: Set Up Frontend

1. Navigate to frontend directory (in a new terminal):
   ```bash
   cd smart-complaint
   ```

2. Start a local HTTP server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js http-server (if installed globally)
   npx http-server -p 8000
   ```

Frontend should be running on `http://localhost:8000`

### Step 4: Access the Application

1. Open your browser and go to: `http://localhost:8000`
2. You should see the Smart Complaint Management System homepage

## Testing the Application

### Test Complaint Submission

1. Click "Register Complaint"
2. Fill out the form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Category: Select any category
   - Location: Test Location
   - Description: Test complaint description
3. Optionally upload an image
4. Click "Submit Complaint"
5. You should see a success message with a tracking ID

### Test Admin Panel

1. Click "Admin" in the navigation
2. Click "Admin Login"
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. You should see the admin dashboard with complaints
5. Try updating a complaint status
6. Try using "Auto-Prioritize" button

### Test Analytics

1. Click "Analytics" in the navigation
2. You should see:
   - Charts showing complaint distribution
   - Statistics
   - Top locations
   - Trend insights

## Troubleshooting

### Backend Issues

**Problem: Cannot connect to MongoDB**
- Solution: Make sure MongoDB is running
  - Local: Check MongoDB service status
  - Atlas: Verify connection string and whitelist IP address

**Problem: Port 5000 already in use**
- Solution: Change PORT in `backend/.env` to another port (e.g., 5001)
- Update `API_BASE_URL` in `smart-complaint/api.js` to match

**Problem: Module not found errors**
- Solution: Run `npm install` in the backend directory

**Problem: File upload errors**
- Solution: Check that `uploads/` directory exists and has write permissions

### Frontend Issues

**Problem: Cannot connect to backend API**
- Solution: 
  - Make sure backend is running on port 5000
  - Check CORS settings in `backend/server.js`
  - Verify `API_BASE_URL` in `smart-complaint/api.js` is correct

**Problem: Charts not displaying**
- Solution: Check browser console for errors
- Make sure Chart.js CDN is loaded (check `index.html`)

**Problem: Geolocation not working**
- Solution: 
  - Ensure you're using HTTPS or localhost
  - Allow location permissions in browser

## Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/scms
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:8000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### Frontend API Configuration

Edit `smart-complaint/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

If backend runs on a different port, update this value.

## Production Deployment

### Backend Deployment

1. Set `NODE_ENV=production`
2. Use a secure JWT secret
3. Change default admin credentials
4. Use MongoDB Atlas or managed database
5. Set up file storage (AWS S3, Cloudinary, etc.)
6. Use environment variables (not .env file)
7. Enable HTTPS

### Frontend Deployment

1. Update `API_BASE_URL` to production backend URL
2. Use HTTPS
3. Enable CORS on backend for production domain
4. Minify JavaScript and CSS
5. Use CDN for Chart.js

## Database Schema

### Complaint Model
- id: String (unique)
- name, email, phone: String
- category: Enum
- location: String
- coordinates: { latitude, longitude }
- description: String
- status: Enum (Pending, In Progress, Resolved, Closed)
- urgency: Enum (High, Medium, Low)
- priorityScore: Number (0-100)
- images: Array of file objects
- notifyEmail, notifySMS: Boolean
- feedback: Object (rating, comment, date)
- updates: Array of status updates
- timestamps: createdAt, updatedAt

### User Model
- username, email: String (unique)
- password: String (hashed)
- role: Enum (admin, staff, user)
- isActive: Boolean
- timestamps: createdAt, updatedAt

## API Documentation

See `backend/README.md` for detailed API documentation.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Verify MongoDB connection
5. Ensure all dependencies are installed