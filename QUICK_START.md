# FitTrack - Quick Start Guide

## 🚀 Start Development Servers

### Terminal 1: Backend
```bash
cd /home/ubuntu/fitness-app
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### Terminal 2: Frontend
```bash
cd /home/ubuntu/fitness-app/frontend
npm install  # only needed once
npm run dev
```

**Expected Output:**
```
▲ Next.js 16.2.4
- Local:        http://localhost:3000
```

---

## 🌐 Access Application

**Frontend**: http://localhost:3000  
**Backend API Docs**: http://localhost:8000/docs  
**Backend OpenAPI**: http://localhost:8000/openapi.json

---

## 📝 Quick Test

### 1. Sign Up
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "height": 175,
    "age": 30,
    "gender": "male"
  }'
```

### 2. Log In
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
# Save the `access_token` from response
```

### 3. Get Dashboard
```bash
curl http://localhost:8000/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 Key Features to Explore

### Weight Tracking
- Navigate to `/weight`
- Click "Last 30 Days", "Last 90 Days", etc. to change time range
- Log weight using the form

### Food Logging  
- Navigate to `/food-log`
- Toggle between "Today" and "History" tabs
- Log meals - AI analyzes nutrition automatically

### Water Tracking
- Navigate to `/water`
- Click "Add glass" or tap glass buttons
- View history in "History" tab

### Goal Setting
- Navigate to `/goals`
- Create weight loss goal with target date
- Goal pace is automatically validated

### Analytics & Reports
- Navigate to `/reports`
- Requires 7+ days of logging to activate
- View comprehensive analytics and export as JSON/HTML

---

## 🔧 Environment Setup

### Backend (.env)
```env
ALGORITHM=HS256
SECRET_KEY=your-32-character-secret-key-here-min
DATABASE_URL=sqlite:///./fitness.db
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 📦 Project Structure

```
fitness-app/
├── app/                    # FastAPI backend
│   ├── main.py            # Entry point
│   ├── models/            # Database models
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   │   ├── aggregation.py
│   │   ├── food_quality.py
│   │   ├── suggestions.py
│   │   └── reports.py
│   ├── schemas.py         # Pydantic schemas
│   └── db/                # Database config
│
├── frontend/              # Next.js application
│   ├── app/              # Pages and layout
│   │   ├── weight/
│   │   ├── food-log/
│   │   ├── water/
│   │   ├── goals/
│   │   ├── reports/
│   │   └── ...
│   ├── components/       # React components
│   ├── services/         # API client
│   └── styles/          # Tailwind config
│
├── venv/                # Python virtual environment
├── .env                 # Backend config
└── DEPLOYMENT_GUIDE.md # Full deployment instructions
```

---

## 🧪 Running Tests

### Backend
```bash
cd /home/ubuntu/fitness-app
source venv/bin/activate
pytest tests/  # if test suite exists
```

### Frontend
```bash
cd /home/ubuntu/fitness-app/frontend
npm test
```

---

## 🔍 Debugging

### Backend
- API docs with "Try it out": http://localhost:8000/docs
- Check `/backend.log` for errors
- Enable verbose logging: `--log-level debug`

### Frontend
- Open DevTools: F12
- Check Console and Network tabs
- Use React DevTools extension

---

## 📚 API Endpoints Reference

### Authentication
```
POST   /auth/signup
POST   /auth/login
POST   /auth/refresh
POST   /auth/forgot-password
POST   /auth/reset-password
```

### Weight Tracking
```
POST   /weight-log              # Log weight
GET    /weight-log?limit=30     # Get weight logs
```

### Food Logging
```
POST   /food-log                # Log food (with AI analysis)
GET    /food-log?limit=20       # Get food logs
```

### Goals
```
POST   /api/goals               # Create goal
GET    /api/goals               # Get current goal
PATCH  /api/goals               # Update goal
DELETE /api/goals               # Delete goal
```

### Reports
```
GET    /api/reports/check-eligibility
GET    /api/reports?days=30
GET    /api/reports/suggestions?days=7
GET    /api/reports/export?format=json
POST   /api/reports/email?days=30
```

---

## ⚡ Performance Tips

### Frontend
- Images are lazy-loaded
- CSS is tree-shaken
- JavaScript code-split by route
- Use DevTools Network tab to monitor

### Backend
- Database queries are indexed
- AI analysis has 15-second timeout (graceful fallback)
- Use `/api/reports/health` to check service status

---

## 🐛 Common Issues

### "Cannot find module" error
```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
source venv/bin/activate
pip install -r requirements.txt
```

### "Port already in use"
```bash
# Find process using port 3000
lsof -i :3000
# Kill it
kill -9 <PID>
```

### Database locked
```bash
# Remove SQLite lock file
rm -f fitness.db-journal
```

---

## 📖 Documentation

- **Full Guide**: See `DEPLOYMENT_GUIDE.md`
- **API Reference**: http://localhost:8000/docs
- **Frontend Components**: Check `frontend/components/` folder
- **Backend Services**: Check `app/services/` folder

---

## 🎯 Next Steps

1. ✅ Start development servers (follow above)
2. ✅ Sign up a test user
3. ✅ Log some data (weight, food, water)
4. ✅ Explore all pages
5. ✅ Wait 7+ days to unlock Reports
6. 📖 Read DEPLOYMENT_GUIDE.md for production setup

---

## 💬 Support

For issues or questions:
1. Check the error message in logs
2. Verify environment variables
3. Ensure all dependencies installed
4. Check API documentation at `/docs`
5. Review DEPLOYMENT_GUIDE.md

---

**Happy tracking! 🏋️‍♀️📊**
