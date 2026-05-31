# AI-Genius Auth System 

## 📌 Project Overview

AI-Genius Auth System is a secure backend API built using **Node.js, Express, and MongoDB**.
It implements **JWT-based authentication**, **refresh tokens**, and **Role-Based Access Control (RBAC)** to secure AI-powered endpoints.

This project simulates a SaaS backend where different users (Admin, Premium_User, Free_User) have different access levels to AI services.

---

##  Features

* User Authentication (Login System)
* Password Hashing using bcrypt
* JWT Access Token (Short-lived)
* Refresh Token (Long-lived via HTTP-only cookie)
* Token Refresh Mechanism
* Role-Based Access Control (RBAC)
* Protected Routes using Middleware
* Centralized Error Handling
* Secure API design

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* MongoDB (or Mock Database)
* JSON Web Token (JWT)
* bcrypt.js
* dotenv

---

## 📁 Project Structure

```
Assignment-3/
│
├── controllers/
├── middleware/
├── models/
├── routes/
├── config/
│
├── server.js
├── database.js
├── hashPassword.js
├── tokenUtils.js
├── authMiddleware.js
├── rbacMiddleware.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
│
├── README.md
├── ARCHITECTURE.md
├── PROJECT_SUMMARY.md
├── QUICK_START.md
├── TESTING_GUIDE.md
└── CLIENT_EXAMPLES.js
```

---

## 🔐 Authentication Flow

1. User logs in using email & password
2. Server verifies credentials
3. Server generates:

   * Access Token (15 minutes)
   * Refresh Token (7 days, stored in cookie)
4. Client uses Access Token for API requests
5. When expired, Refresh Token is used to get a new Access Token

---

## 🧪 API Endpoints

### 🔑 Auth Routes

```
POST /api/auth/login
POST /api/auth/refresh
```

---

### 🤖 AI Routes

```
GET /api/ai/free-model
POST /api/ai/premium-model
DELETE /api/ai/purge-cache
```

---

## 🛡️ Role Permissions

| Role         | Access Level           |
| ------------ | ---------------------- |
| Free_User    | Free Model only        |
| Premium_User | Free + Premium Model   |
| Admin        | Full Access (All APIs) |

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```
git clone <your-repo-link>
```

### 2. Install Dependencies

```
npm install
```

### 3. Setup Environment Variables

Create `.env` file:

```
PORT=5000
JWT_SECRET=your_secret_key
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
MONGO_URI=your_database_url
```

### 4. Run Server

```
npm start
```

---

## 🧪 Testing

Use Postman or Thunder Client:

Workflow:

```
Login → Access Free API → Access Premium API → Token Expiry → Refresh Token → Retry API
```

---

## 🔒 Security Features

* Hashed passwords (bcrypt)
* JWT signature verification
* HTTP-only cookies for refresh token
* Role-based route protection
* Environment variable security

---

## 👨‍💻 Author

Abdul Wahab
Data Science Student – Air University Islamabad

---

## 📌 Note

This project is developed for educational purposes as part of **Web Technology for Data Science Application (MA216)** assignment.
