# SCMS Backend API

Smart Complaint Management System - Backend Server

## Features

- RESTful API with Express.js
- MongoDB database with Mongoose
- JWT authentication for admin access
- File upload support for images/videos
- AI-powered categorization and urgency detection
- Comprehensive analytics endpoints
- Email/SMS notification support (configurable)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Make sure MongoDB is running:
- Local: `mongod` or MongoDB service
- Or use MongoDB Atlas cloud database

4. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Complaints
- `POST /api/complaints` - Create new complaint (supports file upload)
- `GET /api/complaints` - Get all complaints (with filters)
- `GET /api/complaints/:id` - Get single complaint
- `GET /api/complaints/user/:email` - Get complaints by user email
- `POST /api/complaints/:id/feedback` - Submit feedback for resolved complaint

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
- `GET /api/analytics/timeline` - Timeline data (last N days)
- `GET /api/analytics/top-locations` - Top locations with most complaints
- `GET /api/analytics/trends` - Trend insights

## Environment Variables

See `.env.example` for all required environment variables.

## Default Admin Credentials

- Username: `admin` (or from ADMIN_USERNAME env var)
- Password: `admin123` (or from ADMIN_PASSWORD env var)

**Important**: Change these in production!

## File Upload

- Max file size: 5MB (configurable)
- Max files per complaint: 5
- Supported formats: JPEG, PNG, GIF, WebP, MP4, MOV, AVI
- Files stored in `uploads/` directory

## Database Models

### Complaint
- Stores all complaint information
- Auto-calculates priority score
- Tracks status updates
- Supports feedback

### User
- Admin and staff users
- Password hashing with bcrypt
- JWT-based authentication

## API Response Format

Success:
```json
{
  "success": true,
  "data": {...},
  "message": "..."
}
```

Error:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Development

- Uses nodemon for auto-reload in development
- Logs errors to console
- CORS enabled for frontend integration

## License

MIT