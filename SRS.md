# FleetFlow SRS (Demo Scope)

## 1. Introduction
### 1.1 Purpose
This SRS defines the requirements for FleetFlow, a modular fleet and logistics management system demo built with React, Node.js, and local PostgreSQL. It is derived from the provided UI sketches and is intended to guide implementation and validation.

### 1.2 Scope
FleetFlow supports core fleet operations: authentication, dashboard KPIs, vehicle registry, trip dispatching, maintenance logs, expense and fuel logging, driver performance, and analytics. The system is a local demo only and will not be hosted.

### 1.3 Definitions
- Fleet: The collection of vehicles owned or managed by the company.
- Trip: A delivery job from origin to destination using a vehicle and driver.
- Maintenance Log: Record of service, repair, or inspection.
- KPI: Key Performance Indicator.

### 1.4 References
- FleetFlow UI sketches (PDF).

## 2. Overall Description
### 2.1 Product Perspective
A single-tenant local demo application consisting of:
- React frontend (web UI).
- Node.js backend API (REST).
- PostgreSQL database (local).

### 2.2 Product Functions
- User authentication and registration.
- Dashboard with fleet KPIs and filters.
- Vehicle registry CRUD with status tracking.
- Trip creation, dispatch, and status lifecycle.
- Maintenance and service logging.
- Expense and fuel logging per trip and vehicle.
- Driver profiles, compliance, and performance metrics.
- Analytics dashboards and summary reports.

### 2.3 User Classes
- Admin: Full access.
- Dispatcher: Trip management, vehicle and driver availability.
- Mechanic/Service: Maintenance logging.
- Finance: Expenses, analytics.
- Viewer (optional): Read-only dashboards.

### 2.4 Operating Environment
- Local machine (Windows) only.
- Node.js LTS, React, PostgreSQL 14+.

### 2.5 Constraints
- No hosting or cloud dependencies.
- Demo data is allowed (seeded data).
- Single-tenant local database.

### 2.6 Assumptions and Dependencies
- User will install PostgreSQL locally.
- Authentication can be simplified for demo but must be secure enough for local use.

## 3. Functional Requirements
### 3.1 Authentication
- FR-Auth-01: Users can register with role selection.
- FR-Auth-02: Users can log in with username and password.
- FR-Auth-03: Passwords are stored as secure hashes.
- FR-Auth-04: Session is maintained via JWT or signed cookie.

### 3.2 Main Dashboard
- FR-Dash-01: Display KPIs for active fleet, maintenance alerts, pending cargo, utilization.
- FR-Dash-02: Provide search, group, filter, sort controls.
- FR-Dash-03: Display table of trips with vehicle, driver, status.

### 3.3 Vehicle Registry
- FR-Veh-01: Create, view, update, delete vehicle records.
- FR-Veh-02: Track plate, model, type, capacity, odometer, status.
- FR-Veh-03: Vehicle status values include Idle, On Trip, In Shop, Inactive.
- FR-Veh-04: Prevent dispatch if vehicle is In Shop or Inactive.

### 3.4 Trip Dispatcher and Management
- FR-Trip-01: Create trip with vehicle, driver, cargo weight, origin, destination, fuel estimate.
- FR-Trip-02: Validate cargo weight against vehicle capacity.
- FR-Trip-03: Trip status lifecycle: Planned -> Dispatched -> In Transit -> Delivered -> Closed.
- FR-Trip-04: Assigning trip sets vehicle status to On Trip.

### 3.5 Maintenance and Service Logs
- FR-Maint-01: Create service log with vehicle, issue, date, cost, status.
- FR-Maint-02: Adding a maintenance log sets vehicle status to In Shop.
- FR-Maint-03: Completing maintenance returns vehicle to Idle.

### 3.6 Expense and Fuel Logging
- FR-Exp-01: Create expense entry for a trip or vehicle.
- FR-Exp-02: Track fuel cost and miscellaneous expenses.
- FR-Exp-03: Aggregate expenses per trip and per vehicle.

### 3.7 Driver Performance and Safety
- FR-Drv-01: Track driver profile, license number, expiry, duty status.
- FR-Drv-02: Lock driver for assignment if license expired.
- FR-Drv-03: Compute performance metrics like completion rate and safety score.

### 3.8 Analytics and Financial Reports
- FR-Ana-01: Show KPI tiles: total fuel cost, ROI, utilization rate.
- FR-Ana-02: Show charts for fuel efficiency and top costliest vehicles.
- FR-Ana-03: Provide monthly financial summary (revenue, fuel, maintenance, net profit).
- FR-Ana-04: Export report to CSV for demo.

## 4. Non-Functional Requirements
### 4.1 Security
- NFR-Sec-01: Store passwords with bcrypt.
- NFR-Sec-02: Protect API routes with auth middleware.

### 4.2 Performance
- NFR-Perf-01: Dashboard loads within 2 seconds on local machine with 5k rows.

### 4.3 Usability
- NFR-Use-01: UI must match the provided wireframes.
- NFR-Use-02: Consistent navigation menu across modules.

### 4.4 Reliability
- NFR-Rel-01: All writes are transactional.

### 4.5 Maintainability
- NFR-Main-01: Clear separation of API, UI, and DB layers.

## 5. Data Requirements
### 5.1 Core Entities
- User(id, username, password_hash, role)
- Vehicle(id, plate, model, type, capacity, odometer, status)
- Driver(id, name, license_no, license_expiry, duty_status, safety_score)
- Trip(id, vehicle_id, driver_id, cargo_weight, origin, destination, status, fuel_estimate)
- Maintenance(id, vehicle_id, issue, date, cost, status)
- Expense(id, trip_id, vehicle_id, fuel_cost, misc_cost, date)

### 5.2 Audit Fields
- created_at, updated_at on all records.

## 6. External Interfaces
- REST API endpoints for each module.
- Local PostgreSQL connection.

## 7. Acceptance Criteria
- All modules in sketches are implemented and reachable from menu.
- Trip creation blocks overweight cargo.
- Maintenance log sets vehicle to In Shop.
- Dashboard KPIs and analytics reflect seeded data.
- Local demo runs end-to-end without hosting.
