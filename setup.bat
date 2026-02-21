@echo off
REM FleetFlow Setup Script for Windows
REM This script helps with initial setup of the Fleet Management System

echo.
echo ============================================
echo FleetFlow Setup Script
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed: %NODE_VERSION%

REM Check if MySQL is installed
mysql --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] MySQL is not found in PATH. Make sure MySQL is installed and running.
    echo Please manually create database using:
    echo.
    echo mysql -u root -p
    echo CREATE DATABASE IF NOT EXISTS fleetflow;
    echo CREATE USER 'fleetflow'@'localhost' IDENTIFIED BY 'fleetflow123';
    echo GRANT ALL PRIVILEGES ON fleetflow.* TO 'fleetflow'@'localhost';
    echo FLUSH PRIVILEGES;
    echo.
) else (
    echo [OK] MySQL is installed
)

echo.
echo Step 1: Installing Backend Dependencies...
echo =========================================
cd server
if exist node_modules (
    echo [SKIP] Backend dependencies already installed
) else (
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install backend dependencies
        pause
        exit /b 1
    )
)
cd ..

echo.
echo Step 2: Installing Frontend Dependencies...
echo =========================================
cd client
if exist node_modules (
    echo [SKIP] Frontend dependencies already installed
) else (
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
)
cd ..

echo.
echo Step 3: Configuration Check...
echo =============================
if exist server\.env (
    echo [OK] Environment file exists
) else (
    echo [INFO] Creating .env from .env.example...
    if exist server\.env.example (
        copy server\.env.example server\.env
        echo [OK] .env created. Please edit with your MySQL credentials:
        echo.
        echo   cd server
        echo   notepad .env
        echo.
        echo Then update:
        echo   DB_USER=fleetflow
        echo   DB_PASSWORD=fleetflow123
    ) else (
        echo [ERROR] .env.example not found
        pause
        exit /b 1
    )
)

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next Steps:
echo ===========
echo.
echo 1. Configure Database (if not already done):
echo    mysql -u root -p
echo    CREATE DATABASE IF NOT EXISTS fleetflow;
echo    CREATE USER 'fleetflow'@'localhost' IDENTIFIED BY 'fleetflow123';
echo    GRANT ALL PRIVILEGES ON fleetflow.* TO 'fleetflow'@'localhost';
echo    FLUSH PRIVILEGES;
echo.
echo 2. Update database credentials in server\.env if needed:
echo    notepad server\.env
echo.
echo 3. Start Backend (Terminal 1):
echo    cd server
echo    npm run dev
echo.
echo 4. Start Frontend (Terminal 2):
echo    cd client
echo    npm run dev
echo.
echo 5. Open http://localhost:5173 in your browser
echo.
echo 6. Register a new account or check SETUP_GUIDE.md for seed credentials
echo.
pause
