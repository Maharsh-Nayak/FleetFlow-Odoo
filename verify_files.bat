@echo off
REM FleetFlow - File Verification Script
REM This script verifies all required files are present

echo.
echo ============================================
echo FleetFlow File Verification Script
echo ============================================
echo.

setlocal EnableDelayedExpansion
set /a total=0
set /a found=0

REM Function to check file
:check_file
set "file=%~1"
set /a total+=1
if exist "!file!" (
    set /a found+=1
    echo [OK] %file%
) else (
    echo [MISSING] %file%
)
exit /b

REM Check backend files
echo Checking Backend Files...
echo ========================
for %%F in (
    "server\models\User.js"
    "server\models\Vehicle.js"
    "server\models\Driver.js"
    "server\models\Trip.js"
    "server\models\MaintenanceLog.js"
    "server\models\FuelLog.js"
    "server\models\Expense.js"
    "server\controllers\auth.controller.js"
    "server\controllers\vehicle.controller.js"
    "server\controllers\driver.controller.js"
    "server\controllers\trip.controller.js"
    "server\controllers\maintenance.controller.js"
    "server\controllers\fuel.controller.js"
    "server\controllers\expense.controller.js"
    "server\controllers\report.controller.js"
    "server\routes\auth.routes.js"
    "server\routes\vehicle.routes.js"
    "server\routes\driver.routes.js"
    "server\routes\trip.routes.js"
    "server\routes\maintenance.routes.js"
    "server\routes\fuel.routes.js"
    "server\routes\expense.routes.js"
    "server\routes\report.routes.js"
    "server\server.js"
    "server\.env.example"
) do (
    if exist "%%F" (
        echo [OK] %%F
        set /a found+=1
    ) else (
        echo [MISSING] %%F
    )
    set /a total+=1
)

echo.
echo Checking Frontend Files...
echo ==========================
for %%F in (
    "client\src\pages\Login.jsx"
    "client\src\pages\Dashboard.jsx"
    "client\src\pages\Vehicles.jsx"
    "client\src\pages\Drivers.jsx"
    "client\src\pages\Trips.jsx"
    "client\src\pages\Reports.jsx"
    "client\src\App.jsx"
) do (
    if exist "%%F" (
        echo [OK] %%F
        set /a found+=1
    ) else (
        echo [MISSING] %%F
    )
    set /a total+=1
)

echo.
echo Checking Database Files...
echo ===========================
if exist "database\schema.sql" (
    echo [OK] database\schema.sql
    set /a found+=1
) else (
    echo [MISSING] database\schema.sql
)
set /a total+=1

echo.
echo Checking Documentation...
echo =========================
for %%F in (
    "README.md"
    "SETUP_GUIDE.md"
    "PROJECT_STATUS.md"
    "IMPLEMENTATION_VERIFICATION.md"
    "DEVELOPER_REFERENCE.md"
    "FIRST_STEPS.md"
) do (
    if exist "%%F" (
        echo [OK] %%F
        set /a found+=1
    ) else (
        echo [MISSING] %%F
    )
    set /a total+=1
)

echo.
echo ============================================
echo Verification Complete!
echo ============================================
echo.
echo Files Found: %found% / %total%
echo.

if %found% equ %total% (
    echo [SUCCESS] All files present! ✓
    echo.
    echo Next steps:
    echo 1. Run: setup.bat
    echo 2. Or follow: SETUP_GUIDE.md
    echo.
) else (
    echo [WARNING] Some files are missing!
    echo.
    echo Missing files: %total% - %found%
    echo.
    echo Check SETUP_GUIDE.md if you need to recreate files.
)

pause
