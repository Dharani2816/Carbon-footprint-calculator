# EcoTrack Frontend - Backend Integration Guide

This guide explains the frontend structure and how to integrate it with a Spring Boot + MySQL backend.

## 📂 Project Structure

The key directories for backend integration are:

- **`src/api/`**: Contains all API service logic. This is where you will connect to your backend.
  - `axios.js`: Configures the global Axios instance with base URL and interceptors.
  - `authApi.js`: Handles Login, Register, and Logout. Currently uses mock data.
  - `footprintApi.js`: Handles Carbon Footprint data operations. Currently uses mock data.
- **`src/context/AuthContext.jsx`**: Manages user state. It calls `authApi` methods.
- **`.env`**: Stores environment variables like the API base URL.

---

## 🚀 Integration Steps

### 1. Configure Environment
Ensure your `.env` file points to your running backend server:
```properties
VITE_API_BASE_URL=http://localhost:8080/api
```

### 2. Connect Authentication (`src/api/authApi.js`)
Replace the mock functions with real Axios calls.

**Current Mock:**
```javascript
login: async (credentials) => {
    // ... mock logic ...
    return { user, token };
}
```

**Real Implementation:**
```javascript
import apiClient from './axios';

export const authApi = {
    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data; // Expected: { user: {...}, token: "jwt_string" }
    },
    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },
    logout: async () => {
        // Optional: Call backend to invalidate session if needed
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
```

### 3. Connect Footprint Data (`src/api/footprintApi.js`)
Replace the mock functions with real Axios calls.

**Real Implementation:**
```javascript
import apiClient from './axios';

export const footprintApi = {
    saveFootprint: async (data) => {
        const response = await apiClient.post('/footprints', data);
        return response.data;
    },
    getHistory: async () => {
        const response = await apiClient.get('/footprints/history');
        return response.data; // Expected: Array of footprint objects
    },
    getLatestFootprint: async () => {
        const response = await apiClient.get('/footprints/latest');
        return response.data;
    }
};
```

---

## 🔐 Authentication Flow

The frontend is pre-configured for **JWT Authentication**:

1.  **Login/Register**: The backend should return a JSON object containing the `token` and `user` details.
2.  **Storage**: The frontend automatically stores the `token` in `localStorage`.
3.  **Requests**: `src/api/axios.js` automatically attaches the token to **every** request header:
    ```http
    Authorization: Bearer <your_token>
    ```
4.  **Expiry**: If the backend returns `401 Unauthorized`, the frontend automatically logs the user out and redirects to Login.

## 📦 Data Models

Ensure your Backend DTOs match these JSON structures:

**User:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Footprint Record:**
```json
{
  "id": 101,
  "date": "2023-10-27",
  "total": 4500.5,
  "breakdown": {
    "electricity": 1200.0,
    "transport": 1500.0,
    "diet": 1000.0,
    "lifestyle": 800.5
  }
}
```
