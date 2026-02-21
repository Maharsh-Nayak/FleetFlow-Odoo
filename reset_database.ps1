# FleetFlow Database Reset Script
# This script will reset the database by dropping all tables

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "FleetFlow Database Reset Utility" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will DELETE ALL DATA in the fleetflow database!" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Type 'YES' to continue or anything else to cancel"

if ($confirmation -ne "YES") {
    Write-Host ""
    Write-Host "Operation cancelled." -ForegroundColor Green
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "Resetting database..." -ForegroundColor Yellow

# Get MySQL password from .env file
$envPath = ".\server\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $dbPassword = ($envContent | Select-String "DB_PASSWORD=(.*)").Matches.Groups[1].Value
    $dbUser = ($envContent | Select-String "DB_USER=(.*)").Matches.Groups[1].Value
    
    Write-Host "Using DB_USER: $dbUser" -ForegroundColor Gray
} else {
    Write-Host "Error: .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

# SQL commands to drop tables
$sqlCommands = @"
USE fleetflow;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS fuel_logs;
DROP TABLE IF EXISTS maintenance_logs;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;
"@

# Try to find MySQL executable
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "mysql.exe"  # Try from PATH
)

$mysqlExe = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path -ErrorAction SilentlyContinue) {
        $mysqlExe = $path
        break
    }
}

if (-not $mysqlExe) {
    Write-Host ""
    Write-Host "MySQL executable not found automatically." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run these SQL commands manually in MySQL Workbench or command line:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host $sqlCommands -ForegroundColor White
    Write-Host ""
    Write-Host "Then run: cd server && npm run dev" -ForegroundColor Green
    Write-Host ""
    
    # Save SQL to file for easy manual execution
    $sqlCommands | Out-File -FilePath ".\database\reset_database.sql" -Encoding utf8
    Write-Host "SQL commands saved to: database\reset_database.sql" -ForegroundColor Cyan
    Write-Host ""
    
    exit 0
}

Write-Host "Found MySQL at: $mysqlExe" -ForegroundColor Gray
Write-Host ""

# Execute SQL commands
try {
    if ($dbPassword) {
        $sqlCommands | & $mysqlExe -u $dbUser -p"$dbPassword" 2>&1 | Out-Null
    } else {
        $sqlCommands | & $mysqlExe -u $dbUser 2>&1 | Out-Null
    }
    
    Write-Host "✓ Database tables dropped successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. cd server" -ForegroundColor White
    Write-Host "2. npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Sequelize will auto-create all tables with the correct schema." -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "✗ Error executing SQL commands" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run manually:" -ForegroundColor Yellow
    Write-Host $sqlCommands -ForegroundColor White
    Write-Host ""
    exit 1
}
