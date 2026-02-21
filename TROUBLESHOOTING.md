# 🔧 FleetFlow Troubleshooting Guide

## Current Error: Data Truncation

**Error Message:**
```
Data truncated for column 'vehicle_type' at row 3
```

**Cause:** Existing data in the `vehicles` table doesn't match the ENUM values defined in the Sequelize model.

---

## ✅ Solution Options

### Option 1: Reset Database (RECOMMENDED - Clean Start)

This will delete all data and let Sequelize create fresh tables.

**Steps:**

1. **Open MySQL Command Line or MySQL Workbench**

2. **Run the reset script:**
   ```sql
   USE fleetflow;
   
   DROP TABLE IF EXISTS expenses;
   DROP TABLE IF EXISTS fuel_logs;
   DROP TABLE IF EXISTS maintenance_logs;
   DROP TABLE IF EXISTS trips;
   DROP TABLE IF EXISTS drivers;
   DROP TABLE IF EXISTS vehicles;
   DROP TABLE IF EXISTS users;
   ```

3. **Restart the server:**
   ```powershell
   cd C:\Users\maharsh\Desktop\FleetFlow-Odoo\server
   npm run dev
   ```

4. **Sequelize will auto-create all tables** with the correct schema.

---

### Option 2: Fix Data Manually (Keep Existing Data)

If you have important data you want to keep:

1. **Check what data is causing the issue:**
   ```sql
   USE fleetflow;
   SELECT id, model, vehicle_type, status FROM vehicles;
   ```

2. **Update or delete invalid records:**
   ```sql
   -- Option A: Delete invalid vehicles
   DELETE FROM vehicles 
   WHERE vehicle_type NOT IN ('TRUCK', 'VAN', 'CAR', 'TRAILER', 'CONTAINER');
   
   -- Option B: Update to valid values
   UPDATE vehicles 
   SET vehicle_type = 'TRUCK' 
   WHERE vehicle_type NOT IN ('TRUCK', 'VAN', 'CAR', 'TRAILER', 'CONTAINER');
   ```

3. **Restart the server:**
   ```powershell
   npm run dev
   ```

---

### Option 3: Force Sequelize to Drop & Recreate (Nuclear Option)

Temporarily change the sync mode in server.js:

1. **Open:** `server/server.js`

2. **Find this line (around line 108):**
   ```javascript
   await sequelize.sync({ alter: true });
   ```

3. **Change to:**
   ```javascript
   await sequelize.sync({ force: true });
   ```

4. **Restart server** - this will DROP and RECREATE all tables

5. **IMPORTANT: Change it back to `{ alter: true }`** after first run to prevent data loss

---

## 🐛 Common Errors & Solutions

### Error: "Access denied for user ''@'localhost'"

**Cause:** Missing or incorrect `.env` file

**Solution:**
1. Check `server/.env` exists
2. Verify DB_PASSWORD is correct
3. Content should be:
   ```env
   DB_NAME=fleetflow
   DB_USER=root
   DB_PASSWORD=maharsh
   DB_HOST=localhost
   DB_PORT=3306
   ```

---

### Error: "ECONNREFUSED ::1:3306"

**Cause:** MySQL server is not running

**Solution:**
1. Start MySQL server
2. On Windows: Open Services → MySQL → Start
3. Or: `net start MySQL80` (as Administrator)

---

### Error: "Unknown database 'fleetflow'"

**Cause:** Database doesn't exist

**Solution:**
```sql
CREATE DATABASE IF NOT EXISTS fleetflow;
```

---

### Error: "Table doesn't exist"

**Cause:** Sequelize hasn't created tables yet

**Solution:**
1. Make sure `sequelize.sync({ alter: true })` is in server.js
2. Restart the server
3. Check terminal output for "✓ Database synced"

---

### Error: "Cannot find module 'sequelize'"

**Cause:** Dependencies not installed

**Solution:**
```powershell
cd server
npm install
```

---

## 🔍 Debugging Steps

### 1. Check MySQL is Running
```powershell
# PowerShell (as Administrator)
Get-Service -Name MySQL*
```

### 2. Test MySQL Connection
```powershell
# Try to connect with MySQL client
mysql -u root -p
# Enter password: maharsh
```

### 3. Verify Database Exists
```sql
SHOW DATABASES;
USE fleetflow;
SHOW TABLES;
```

### 4. Check Environment Variables
```powershell
cd server
Get-Content .env
```

### 5. Check Server Logs
- Look for "✓ MySQL connected" - good
- Look for "✗ Failed to start server" - error details below it

---

## 📋 Quick Fix Checklist

- [ ] MySQL server is running
- [ ] Database `fleetflow` exists
- [ ] File `server/.env` exists with correct password
- [ ] Backend dependencies installed (`npm install` in server/)
- [ ] No data conflicts (run reset script if needed)

---

## 🚀 Recommended Fix (For Your Current Error)

**Run this in MySQL:**

```sql
USE fleetflow;

-- Drop all tables
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS fuel_logs;
DROP TABLE IF EXISTS maintenance_logs;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;
```

**Then restart server:**

```powershell
cd C:\Users\maharsh\Desktop\FleetFlow-Odoo\server
npm run dev
```

**You should see:**
```
✓ MySQL connected
✓ Database synced
✓ FleetFlow API running on http://localhost:5000
```

---

## 💡 Understanding the Error

The error happens because:

1. **Previous schema** - Tables were created with old schema (maybe from schema.sql)
2. **New schema** - Sequelize models define specific ENUM values
3. **Conflict** - Existing data has values not in the new ENUM list
4. **Sequelize sync({ alter: true })** - Tries to ALTER table but fails due to data

**Solution:** Clean slate (drop tables) lets Sequelize create perfect schema.

---

## ✅ After Fix

Once server starts successfully:

1. Register a new account at http://localhost:5173
2. Create test vehicles, drivers, trips
3. Data will be stored in MySQL with correct schema
4. All ENUM values will be enforced

---

## 📞 Still Having Issues?

Check these files:
- `server/.env` - Database credentials
- `server/server.js` - Lines 80-110 for database connection
- `server/models/Vehicle.js` - ENUM definitions

Or run the verify script:
```powershell
node -p "require('dotenv').config({path: './server/.env'}); process.env.DB_USER"
```

Should output: `root`

---

**Most Common Fix:** Drop all tables and let Sequelize recreate them. ✅
