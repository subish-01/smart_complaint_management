# Smart Complaint Management System (SCMS)

A comprehensive digital platform for citizens to report civic issues efficiently with AI-powered categorization, real-time tracking, and analytics.

## Project Structure

```
smart-complaint-management/
├── backend/                 # Node.js + Express + MongoDB Backend
│   ├── models/             # MongoDB models (Complaint, User)
│   ├── routes/             # API routes (complaints, admin, analytics, auth)
│   ├── middleware/         # Authentication, file upload middleware
│   ├── uploads/            # Uploaded files (images/videos)
│   ├── server.js           # Express server
│   └── package.json        # Backend dependencies
│
└── smart-complaint/        # Frontend (HTML/CSS/JavaScript)
    ├── index.html          # Main HTML file
    ├── style.css           # Styling
    ├── script.js           # Frontend logic
    └── api.js              # API client functions
```

## Features

### Frontend Features
- 📱 Responsive, accessible UI/UX
- 📍 Geolocation integration for precise reporting
- 📸 Image/video upload with preview
- 🤖 AI-powered categorization and urgency detection
- 📊 Real-time analytics dashboard with charts
- 🔔 Notification system
- ⭐ Feedback and rating system
- 👥 Public transparency dashboard
- 🔐 Admin dashboard with authentication

### Backend Features
- 🔒 RESTful API with Express.js
- 🗄️ MongoDB database with Mongoose
- 🔑 JWT authentication for admin access
- 📁 File upload handling (multer)
- 📊 Analytics endpoints
- 🚀 Auto-prioritization algorithm
- ✅ Input validation and error handling

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Modern web browser

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
# Copy .env.example to .env (already created)
# Edit .env with your MongoDB connection string
```

4. **Start MongoDB:**
```bash
# If using local MongoDB:
mongod

# Or use MongoDB Atlas cloud database
```

5. **Start the backend server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd smart-complaint
```

2. **Start a local HTTP server:**
```bash
# Using Python
python -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000

# Or use VS Code Live Server extension
```

Frontend will run on `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Complaints
- `POST /api/complaints` - Create new complaint (with file upload)
- `GET /api/complaints` - Get all complaints (with filters)
- `GET /api/complaints/:id` - Get single complaint
- `GET /api/complaints/user/:email` - Get complaints by user email
- `POST /api/complaints/:id/feedback` - Submit feedback

### Admin (Requires Authentication)
- `GET /api/admin/complaints` - Get all complaints with priority
- `PATCH /api/admin/complaints/:id/status` - Update complaint status
- `POST /api/admin/complaints/prioritize` - Auto-prioritize all complaints
- `PATCH /api/admin/complaints/:id/assign` - Assign complaint to staff
- `DELETE /api/admin/complaints/:id` - Delete complaint

### Analytics
- `GET /api/analytics/stats` - Get statistics
- `GET /api/analytics/by-category` - Complaints by category
- `GET /api/analytics/by-status` - Complaints by status
- `GET /api/analytics/timeline` - Timeline data
- `GET /api/analytics/top-locations` - Top locations
- `GET /api/analytics/trends` - Trend insights

## Default Admin Credentials

- **Username:** `admin`
- **Password:** `admin123`

**⚠️ Important:** Change these in production by updating the `.env` file!

## Usage

1. **Submit a Complaint:**
   - Fill out the complaint form
   - Use geolocation for automatic location detection
   - Upload images/videos if needed
   - Submit and get a tracking ID

2. **Track Complaints:**
   - View "My Complaints" section
   - Filter by status, category, or search
   - Click "View" to see details

3. **Public Dashboard:**
   - View all community complaints
   - See statistics and resolution rates

4. **Admin Panel:**
   - Login with admin credentials
   - Manage and prioritize complaints
   - Update status and assign to staff
   - View analytics and reports

5. **Provide Feedback:**
   - For resolved complaints, submit feedback with rating

## Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **Validation:** Express validators

### Frontend
- **HTML5/CSS3** with modern design
- **JavaScript (ES6+)** with async/await
- **Chart.js** for analytics visualization
- **Fetch API** for API calls

## Development

- Backend uses nodemon for auto-reload in development
- Frontend uses Chart.js CDN for charts
- CORS enabled for cross-origin requests
- Error handling and validation on both ends

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a secure JWT secret
3. Change default admin credentials
4. Configure proper MongoDB connection (Atlas recommended)
5. Set up file storage (AWS S3, Cloudinary, etc.)
6. Enable HTTPS
7. Configure email/SMS service for notifications

## License

MIT

## Team

**Team Four Corners**
- Leader: Jannathul Firdhouse
- Members: Subish, Muthamil, Priya

## Support

For issues or questions, please check the documentation or contact the development team.