# 🌱 Carbon Footprint Calculator

A modern full-stack web application designed to help users track, calculate, and analyze their environmental impact. The app provides a detailed breakdown of carbon emissions based on home energy usage, transportation habits, and diet/lifestyle choices.

## 🚀 Key Features

- **Step-by-Step Calculator**: User-friendly multi-step form for precise footprint calculation.
- **Personalized Dashboard**: Visual representation of your carbon footprint using interactive charts (Chart.js).
- **Historical Tracking**: Securely store and review your previous calculations to monitor progress.
- **Impact Benchmarking**: See how your footprint compares to the Indian average and global sustainable targets.
- **Smart Recommendations**: Receive tailored advice to reduce your CO₂ emissions.
- **Secure Authentication**: Built-in user registration and login system.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Chart.js, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL with Sequelize ORM.
- **Security**: JWT (JSON Web Tokens) for session management.

---

## ⚙️ Setup & Installation Instructions

Follow these steps to get the project running on your local machine.

### 1. Database Setup
Ensure you have **MySQL** installed and running on your system.
1. Open your MySQL client (CLI or Workbench).
2. Create a new database:
   ```sql
   CREATE DATABASE carbon_footprint_db;
   ```

### 2. Backend Configuration
1. Open a terminal and navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add your database credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=carbon_footprint_db
   JWT_SECRET=any_random_secure_string
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *Note: The server will automatically create the necessary tables in your database on startup.*

### 3. Frontend Configuration
1. Open a **new terminal** and stay in the root project folder:
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the **root** folder and link it to the backend:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Start the frontend application:
   ```bash
   npm run dev
   ```

---

## 🖥️ How to Use

1. Once both servers are running, open `http://localhost:5173` in your browser.
2. **Sign Up** to create an account.
3. Go to the **Calculator** tab and answer the questions about your lifestyle.
4. Click **"See Results"** to view your detailed impact report.
5. Visit the **History** tab to see your past records stored in the database.
6. Use the **Dashboard** to see overall trends and comparisons.

---
Built with ❤️ to help save our Planet.
