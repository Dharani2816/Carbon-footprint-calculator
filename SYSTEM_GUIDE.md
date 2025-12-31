# 🧠 Carbon Footprint System Guide

This document provides a detailed breakdown of how the Carbon Footprint Calculator works, covering its architecture, page functionalities, and the logic behind the calculations.

---

## 🏗️ System Architecture

The application follows a classic **client-server architecture**:
1.  **Frontend (React)**: Handles the user interface, multi-step form state, and interactive data visualization using **Chart.js**.
2.  **Backend (Node/Express)**: Provides a RESTful API for user authentication and managing footprint records.
3.  **Database (MySQL)**: Stores user credentials and historical footprint data using **Sequelize ORM**.

---

## 📄 Page Functionality

### 1. Authentication (Login & Register)
- **Security**: Uses **JWT (JSON Web Tokens)** for secure communication.
- **Persistence**: Once logged in, the user's session is stored in `localStorage`, keeping them logged in even after refreshing the page.
- **Validation**: Ensures unique emails and secure password handling.

### 2. Dashboard (The Command Center)
- **Top Stats**: Displays your most recent calculation and evaluates your "Impact Level" (Low, Medium, or High).
- **History Trend**: A line chart fetches all your past records and plots them to show if your footprint is increasing or decreasing over time.
- **Emission Sources**: A circular pie chart breaks down your **average** emissions across all recorded data, helping you identify your biggest environmental "hotspots."

### 3. The Calculator (The Calculation Engine)
The heart of the app is a **state-driven multi-step form**.
- **State Management**: As you move through the steps (Energy → Transport → Lifestyle), the `formData` is updated in real-time.
- **The "See Results" Logic**:
    1.  **Math Engine**: It runs a local JavaScript function that applies specific "Emission Factors" to your inputs (e.g., $1\text{ kWh} = 0.82\text{ kg CO}_2$).
    2.  **Comparison**: It fetches your *previous* record from the database to calculate the percentage change.
    3.  **Recommendation Engine**: It scans your breakdown. If one category (like Transport) is unusually high, it injects specific tips like "Use public transport" into your results.
    4.  **Persistence**: The final result is sent to the backend to be stored in the MySQL `carbon_footprints` table.

### 4. History (The Archive)
- **Retrieval**: Fetches all records for the logged-in user, sorted by date (newest first).
- **Insight**: Each card shows the date of calculation, the total score, and a mini-breakdown of the contributors.
- **Empty State**: Guides first-time users back to the calculator if no history exists.

---

## 🧮 How the Math Works (Calculation Logic)

We use industry-standard emission factors to convert your lifestyle choices into kilograms of $\text{CO}_2$ per year:

| Input Category | Logic / Formula | Factor Example |
| :--- | :--- | :--- |
| **Electricity** | (monthly kWh * 12 * Factor) / Household Size | 0.82 kg CO2 per kWh |
| **Transport** | monthly Distance * 12 * Vehicle Factor | Petrol Car: 0.192 kg/km |
| **Flights** | Flat annual addition based on frequency | Short flight: 300 kg CO2 |
| **Diet** | Base annual value based on diet type | Vegetarian: 1000 kg/year |
| **AC Usage** | Flat annual addition based on intensity | Regular use: +600 kg/year |

---

## 🛠️ Internal Components

- **What-If Simulator**: A dynamic component that lets you adjust sliders (like "Reduce Travel by 20%") to see how it would have changed your actual score.
- **Calculation Explainer**: A transparency component that shows precisely what emission factors were used for your specific result.

---
© 2025 Carbon Footprint Calculator - Empowering Green Choices.
