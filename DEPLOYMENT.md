# Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)

### Steps:
1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will automatically detect it's a Next.js project
   - Add environment variable: `NEXT_PUBLIC_API_URL` = your backend URL (after deploying backend)
   - Click "Deploy"

## Backend Deployment (Railway)

### Prerequisites
- GitHub account
- Railway account (free at railway.app)

### Steps:
1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set the root directory to `/backend`
   - Railway will automatically detect the Python project
   - Deploy

2. **Get your backend URL**
   - After deployment, Railway will provide a URL like: `https://your-app-name.railway.app`
   - Copy this URL

3. **Update Frontend Environment Variable**
   - Go back to your Vercel project
   - Go to Settings > Environment Variables
   - Update `NEXT_PUBLIC_API_URL` with your Railway backend URL

## Alternative Backend Deployment (Render)

### Steps:
1. **Deploy to Render**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Click "New Web Service"
   - Connect your GitHub repository
   - Set root directory to `/backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Deploy

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### Backend
No additional environment variables needed for basic deployment.

## Testing Your Deployment

1. **Test Backend**: Visit `https://your-backend-url.railway.app/docs` to see the FastAPI docs
2. **Test Frontend**: Visit your Vercel URL to test the full application
3. **Test File Upload**: Try uploading a CSV file to ensure everything works

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Make sure your backend CORS settings include your frontend domain
2. **Build Failures**: Check that all dependencies are in requirements.txt
3. **Port Issues**: The Procfile ensures the correct port is used

### Support:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs) 