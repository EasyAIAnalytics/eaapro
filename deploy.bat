@echo off
echo 🚀 Easy AI Analytics Deployment Script
echo ======================================

REM Check if git is initialized
if not exist ".git" (
    echo 📁 Initializing git repository...
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo ✅ Git repository initialized
) else (
    echo ✅ Git repository already exists
)

echo.
echo 📋 Next Steps:
echo ==============
echo.
echo 1. 🎯 FRONTEND DEPLOYMENT (Vercel):
echo    - Go to https://vercel.com
echo    - Sign in with GitHub
echo    - Click 'New Project'
echo    - Import your repository
echo    - Vercel will auto-detect Next.js
echo    - Deploy!
echo.
echo 2. 🔧 BACKEND DEPLOYMENT (Railway):
echo    - Go to https://railway.app
echo    - Sign in with GitHub
echo    - Click 'New Project'
echo    - Select 'Deploy from GitHub repo'
echo    - Choose your repository
echo    - Set root directory to '/backend'
echo    - Deploy!
echo.
echo 3. 🔗 CONNECT FRONTEND TO BACKEND:
echo    - Get your Railway backend URL
echo    - Go to Vercel project settings
echo    - Add environment variable:
echo      NEXT_PUBLIC_API_URL = your-railway-url
echo    - Redeploy frontend
echo.
echo 4. 🧪 TEST YOUR DEPLOYMENT:
echo    - Test backend: your-railway-url/docs
echo    - Test frontend: your-vercel-url
echo.
echo 📖 For detailed instructions, see DEPLOYMENT.md
echo.
echo 🎉 Happy deploying!
pause 