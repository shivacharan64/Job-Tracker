# 💼 JobTracker Pro - MERN Stack Application

A full-featured job application tracking system built with MongoDB, Express.js, React, and Node.js.

---

## 🖥️ LAPTOP REQUIREMENTS

### Minimum Hardware
- RAM: 8GB (16GB recommended)
- Storage: 10GB free space
- Processor: Dual-core 2GHz+ (any modern laptop works)
- OS: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+

### Required Software to Install on Your Laptop

| Software | Version | Download Link |
|----------|---------|---------------|
| Node.js | 18.x or 20.x LTS | https://nodejs.org |
| MongoDB | 6.x or 7.x | https://www.mongodb.com/try/download/community |
| Git | Latest | https://git-scm.com |
| VS Code | Latest | https://code.visualstudio.com |

### Optional (for resume uploads)
- Cloudinary account (free): https://cloudinary.com
- Gmail account (for email notifications)

---

## 🚀 COMPLETE STEP-BY-STEP SETUP GUIDE

### STEP 1: Install Node.js
1. Go to https://nodejs.org
2. Download **LTS version** (e.g., 20.x)
3. Run the installer (click Next → Next → Install)
4. Verify: Open terminal/cmd and run:
   ```
   node --version    # Should show v18.x or v20.x
   npm --version     # Should show 9.x or 10.x
   ```

### STEP 2: Install MongoDB
**Windows:**
1. Download from https://www.mongodb.com/try/download/community
2. Choose "Windows" → "msi" package
3. Run installer → Complete installation
4. MongoDB runs as a Windows Service automatically

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Linux:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

Verify MongoDB:
```bash
mongosh    # Opens MongoDB shell - type 'exit' to quit
```

### STEP 3: Extract and Set Up the Project
1. Extract the downloaded `job-tracker.zip` to a folder (e.g., `C:\Projects\job-tracker`)
2. Open VS Code → File → Open Folder → select `job-tracker`

### STEP 4: Configure Backend Environment
1. Go to the `backend` folder
2. Copy `.env.example` to `.env`:
   ```bash
   # Windows
   copy backend\.env.example backend\.env

   # Mac/Linux
   cp backend/.env.example backend/.env
   ```
3. Open `backend/.env` and update:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/jobtracker
   JWT_SECRET=mySecretKey123ChangeThis!
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development

   # For email (optional) - use Gmail App Password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASS=your_app_password_here
   EMAIL_FROM=JobTracker <youremail@gmail.com>

   # For Cloudinary resume upload (optional)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```

### STEP 5: Install Backend Dependencies
Open terminal in the `job-tracker` root folder:
```bash
cd backend
npm install
```
Wait for all packages to download (~2-3 minutes).

### STEP 6: Install Frontend Dependencies
Open a NEW terminal tab:
```bash
cd frontend
npm install
```
Wait for all packages (~3-5 minutes, ~300MB).

### STEP 7: Create Admin User (First Time Only)
Start MongoDB, then in a new terminal:
```bash
cd backend
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@jobtracker.com',
    password: 'Admin@123',
    role: 'admin'
  });
  console.log('Admin created:', admin.email);
  process.exit(0);
});
"
```

### STEP 8: Run the Application
You need **TWO terminal windows** open simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Should show: Server running on port 5000 ✅ MongoDB Connected
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Browser opens automatically at http://localhost:3000
```

### STEP 9: Access the App
- **App URL:** http://localhost:3000
- **Admin Login:** admin@jobtracker.com / Admin@123
- **Register** a new user at http://localhost:3000/register

---

## 📁 PROJECT STRUCTURE

```
job-tracker/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Login, register, profile
│   │   ├── jobController.js         # CRUD + search + filters
│   │   ├── noteController.js        # Notes CRUD
│   │   ├── analyticsController.js   # Charts data
│   │   └── adminController.js       # Admin operations
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Job.js                   # Job application schema
│   │   ├── Note.js                  # Notes schema
│   │   └── Notification.js          # Notifications schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── jobs.js
│   │   ├── notes.js
│   │   ├── notifications.js
│   │   ├── analytics.js
│   │   ├── admin.js
│   │   └── upload.js
│   ├── utils/
│   │   ├── sendEmail.js             # Nodemailer utility
│   │   └── reminderService.js       # Cron job reminders
│   ├── server.js                    # Entry point
│   ├── .env                         # Your config (create this)
│   └── .env.example                 # Template
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.js       # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js         # Overview + stats
│   │   │   ├── Jobs.js              # All job management
│   │   │   ├── Notes.js             # Notes section
│   │   │   ├── Analytics.js         # Charts & reports
│   │   │   ├── Profile.js           # User settings
│   │   │   ├── AdminPanel.js        # Admin users panel
│   │   │   └── ForgotPassword.js
│   │   ├── components/
│   │   │   └── ui/Layout.js         # Sidebar + topbar
│   │   ├── utils/
│   │   │   └── api.js               # All API calls
│   │   ├── App.js                   # Routes
│   │   ├── index.js
│   │   └── index.css                # Global styles
│   └── package.json
│
└── README.md                        # This file
```

---

## ✅ FEATURES INCLUDED

### 🔐 User Authentication
- Register / Login / Logout
- JWT token authentication
- Forgot Password & Reset via email
- Password change
- Role-based access (User / Admin)

### 📊 Dashboard
- Overview stats (total, interviewing, offers, rejected)
- Status breakdown with progress bars
- Recent applications list
- Greeting based on time of day

### 💼 Job Application Management
- Add, Edit, Delete applications
- Status tabs (All, Applied, Interviewing, Offer, etc.)
- Status history tracking with notes
- Mark as favorite ⭐
- Resume/CV file upload (PDF, DOC)
- Job URL linking

### 🔍 Search & Filters
- Full-text search (company, position, location, tags)
- Filter by: Status, Job Type, Priority, Source
- Sort by: Newest, Oldest, Company, Deadline
- Tag system for custom categorization

### 🔔 Notifications & Reminders
- In-app notification bell
- Auto interview reminders (cron job, runs hourly)
- Email notifications for interviews
- Status change notifications
- Mark as read / Mark all as read

### 📄 Resume Upload
- Upload PDF/Word resume per job
- File stored with job record
- View uploaded filename

### 📝 Notes Section
- Create notes with color coding
- Link notes to specific jobs
- Note types: General, Interview Prep, Follow-up, Research, Feedback
- Pin important notes
- Full CRUD operations

### 📈 Reports & Analytics
- Applications over time (Line chart)
- Status distribution (Doughnut chart)
- Applications by source (Bar chart)
- Success funnel (Applied → Interview → Offer)
- KPI cards: Total, Interview Rate, Offer Rate, Avg Response Time

### 👑 Admin Panel
- Platform overview stats
- All users list with search/filter
- Toggle user active/inactive
- Change user roles (user ↔ admin)
- Delete user + all their data
- Recent signups view

### 🎨 UI/UX Features
- Dark theme with blue/purple accents
- Responsive sidebar navigation
- Animated modals and transitions
- Toast notifications
- Loading spinners
- Empty state illustrations
- Color-coded status badges
- Priority indicators
- Hover effects

---

## 🌐 API ENDPOINTS

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/updateprofile
PUT    /api/auth/updatepassword
POST   /api/auth/forgotpassword
PUT    /api/auth/resetpassword/:token
```

### Jobs
```
GET    /api/jobs               (with ?search=&status=&page=&limit=)
POST   /api/jobs
GET    /api/jobs/:id
PUT    /api/jobs/:id
DELETE /api/jobs/:id
PUT    /api/jobs/:id/favorite
GET    /api/jobs/stats/summary
```

### Notes
```
GET    /api/notes
POST   /api/notes
PUT    /api/notes/:id
DELETE /api/notes/:id
```

### Notifications
```
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
```

### Analytics
```
GET    /api/analytics
```

### Admin (Admin only)
```
GET    /api/admin/stats
GET    /api/admin/users
PUT    /api/admin/users/:id/toggle
PUT    /api/admin/users/:id/role
DELETE /api/admin/users/:id
```

### Upload
```
POST   /api/upload/resume/:jobId
```

---

## 🔧 COMMON ISSUES & FIXES

**"MongoDB connection failed"**
→ Make sure MongoDB is running:
- Windows: Open Services → start "MongoDB"
- Mac: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongodb`

**"Port 5000 already in use"**
→ Change PORT=5001 in backend/.env

**"npm install fails"**
→ Try: `npm install --legacy-peer-deps`

**Frontend won't connect to backend**
→ Check that both servers are running
→ Verify `"proxy": "http://localhost:5000"` in frontend/package.json

**Email not sending**
→ For Gmail, enable 2FA and create an App Password at https://myaccount.google.com/apppasswords

---

## 🚀 PRODUCTION DEPLOYMENT

### Backend: Deploy to Railway/Render/Heroku
1. Push to GitHub
2. Connect to Railway.app (free tier)
3. Add environment variables
4. Deploy automatically

### Frontend: Deploy to Vercel/Netlify
1. `cd frontend && npm run build`
2. Deploy `build/` folder to Vercel
3. Set `REACT_APP_API_URL` to your backend URL

### MongoDB: Use MongoDB Atlas (free cloud)
1. Create account at https://mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Replace MONGO_URI in .env

---

## 📞 TECH STACK SUMMARY

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Chart.js |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Email | Nodemailer |
| File Upload | Multer + Cloudinary |
| Scheduling | node-cron |
| Styling | Custom CSS (dark theme) |
| Icons | React Icons (Material Design) |

