@echo off
echo Setting up Easy AI Analytics...
echo.

echo Installing frontend dependencies...
npm install
echo.

echo Installing backend dependencies...
pip install -r requirements.txt
echo.

echo Setup complete!
echo.
echo To start the application:
echo 1. Start backend: cd backend && python main.py
echo 2. Start frontend: npm run dev
echo 3. Open http://localhost:3000
echo.
pause 