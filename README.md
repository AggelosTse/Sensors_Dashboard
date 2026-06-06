# Sensors Dashboard

A full-stack web application designed for monitoring, managing, and visualizing data from IoT sensors (such as Temperature, Humidity, etc.). The system supports dynamic charts with customizable time filtering (resolution levels), sensor and user management for administrators, and secure authentication using JWT (JSON Web Tokens).

## Project Architecture

The project is structured into two main components:
* **Frontend:** Built with **React (Vite)**, **VANILLA CSS** for the user interface, and **Chart.js** for dynamic sensor data visualization.
* **Backend:** Built with **Flask (Python)**, utilizing **PostgreSQL** as the database engine and **SQLAlchemy 2.0 ORM** for model and query management.

* ## Installation & Local Setup Instructions

Follow these steps in order to set up and run the application on your local machine.

### 1. Database Preparation (PostgreSQL)
1. Open **pgAdmin** (or your preferred PostgreSQL management client).
2. Create a new, empty database named: `sensorsDashboard_db`.
3. Right-click on the newly created database, select **Restore** (or open the Query Tool), and load the **`backup.sql`** file located inside the ROOT folder.

### 2. Environment Variables Setup (.env)
For safety and code portability reasons, sensitive connection credentials are not embedded into the application's source code.
1. In the root directory, locate the `.env.example` file.
2. Rename or copy the `.env.example` file to **`.env`**.
3. Open the newly created `.env` file and insert your own local PostgreSQL password by modifying the `DATABASE_URL` variable:
   ```ini
   DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/sensorsDashboard_db
   
### 3. FRONTEND
To execute the frontend, first open a terminal and head to the sensors.app directory. Run these commands:
1. npm install
2. npm run dev

### 4. BACKEND
To execute the backend, open a second terminal and head to the ROOT directory of the project.
1.Create the venv: python3 -m venv venv
2.enable it: source venv/bin/activate
3.download all python packages: pip install -r requirements.txt
4.head to the backend directory: cd sensors.app/src/backend
5.execute the server: python3 server.py

### 5. SENSOR SIMULATOR SCRIPT
Once you have the server running, open a third terminal and head to the sensor simulator. Run these commands:
1. First enable the venv you created before
1. Head to sensor simulator file: cd Sensors_Dashboard/sensors.app/src/outerSensor
2. Execute the script: python3 sensorSimulator.py
