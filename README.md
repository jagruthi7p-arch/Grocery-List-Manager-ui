<<<<<<< HEAD
# Grocery-List-Manager-ui
=======
# 🛒 Grocery List Manager

A full-stack MERN application for managing shared grocery lists with real-time synchronization. Built with React, Express, MongoDB, and Server-Sent Events.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [Configuration](#configuration)
- [Documentation & Videos](#documentation--videos)
- [Architecture](#architecture)

## 📝 Overview

Grocery List Manager is a collaborative web application that allows users to:
- Create and manage grocery lists in real-time
- Form groups and share lists with other users
- Track item completion status
- Generate invite codes for group collaboration
- Admin dashboard for monitoring and management

The application uses a three-tier architecture with a modern React frontend, Node.js/Express backend, and MongoDB database.

## ✨ Features

- **User Authentication** — JWT-based registration and login
- **Group Management** — Create groups and invite members via 6-character codes
- **Real-time Synchronization** — Server-Sent Events for instant updates
- **List Management** — Create, edit, and share grocery lists
- **Item Tracking** — Mark items as purchased with automatic list completion
- **Admin Panel** — Manage users and system configuration
- **Responsive Design** — TailwindCSS for modern UI
- **Security** — Password hashing with bcrypt, JWT token authentication

## 🛠️ Tech Stack

### Frontend
- **React 18** — UI library
- **Vite** — Build tool and dev server
- **TailwindCSS** — Utility-first CSS framework
- **Axios** — HTTP client
- **PostCSS** — CSS processing

### Backend
- **Node.js** — JavaScript runtime
- **Express** — Web framework
- **MongoDB + Mongoose** — NoSQL database and ODM
- **JWT** — Token-based authentication
- **bcryptjs** — Password hashing
- **Server-Sent Events** — Real-time data push

## 📁 Project Structure

```
.
├── client/                       Frontend layer (React + Vite + Tailwind)
│   ├── index.html                Vite entry — loads /src/main.jsx
│   ├── vite.config.js            Vite build/dev config
│   ├── tailwind.config.js        Tailwind theme (colors, animations)
│   ├── postcss.config.js         PostCSS pipeline (Tailwind + Autoprefixer)
│   └── src/
│       ├── main.jsx              Mount point — renders <Root/> into #root
│       ├── App.jsx               All UI screens (Landing, Auth, Groups, Lists, Items, Settings, Admin, Architecture)
│       └── index.css             Tailwind directives + custom CSS
├── server/                       Backend layer
│   ├── server.js                 Express entry, mounts routes, serves client/dist
│   ├── architecture.json         Powers the in-app "Project Architecture" page
│   ├── config/
│   │   └── db.js                 MongoDB Atlas connection (Mongoose)
│   ├── models/                   Mongoose schemas (DB layer)
│   │   ├── User.js               User authentication model
│   │   ├── Group.js              Group collaboration model
│   │   ├── List.js               Shopping list model
│   │   └── Item.js               List item model
│   ├── middleware/
│   │   ├── auth.js               JWT token management
│   │   └── adminAuth.js          Admin authorization
│   ├── utils/
│   │   ├── sse.js                Real-time Server-Sent Events
│   │   ├── inviteCode.js         6-character group invite codes
│   │   └── listCompletion.js     Auto-complete logic
│   └── routes/                   REST API endpoints
│       ├── users.js              Auth endpoints
│       ├── groups.js             Group management (JWT-protected)
│       ├── lists.js              List operations (JWT-protected)
│       ├── items.js              Item operations (JWT-protected)
│       └── admin.js              Admin operations
├── package.json                  Project dependencies and scripts
├── README.md                     This file
└── docs/
    ├── Grocery List Manager.pdf  Detailed project documentation
    ├── project overview.mp4      Project walkthrough video
    └── code explanation.mp4      Code implementation video
```

## 🚀 Getting Started

### Prerequisites

- **Node.js v18 or later** — Download from [nodejs.org](https://nodejs.org)
- **MongoDB Atlas account** — Create a free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- **Git** — For version control

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/grocery-list-manager.git
   cd grocery-list-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## ▶️ Running the Application

### Development Mode

```bash
npm start
```

Then open **http://localhost:5000** in your browser.

**Note:** The React app is pre-built in `client/dist/`, so the build step is included in the startup process.

### After Client Changes

If you modify any files in `client/src/`:

1. Rebuild the client:
   ```bash
   npm run build
   ```

2. Restart the server:
   ```bash
   npm start
   ```

### Stopping the Server

Press `Ctrl + C` in your terminal.

## ⚙️ Configuration

Configure these environment variables in your system or a `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port |
| `MONGODB_URI` | Bundled Atlas cluster | MongoDB connection string |
| `JWT_SECRET` | Dev placeholder | Token signing secret (use strong value in production) |
| `ADMIN_PASSWORD` | `admin123` | Admin panel access password |

**Example `.env` file:**
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grocery-list-manager
JWT_SECRET=your-super-secret-key
ADMIN_PASSWORD=secure-admin-password
```

## 📚 Documentation & Videos

### Project Overview
Watch the **[Project Overview Video](./docs/project%20overview.mp4)** for a complete walkthrough of features and architecture.

### Code Explanation
Watch the **[Code Explanation Video](./docs/code%20explanation.mp4)** for an in-depth explanation of implementation details.

### Detailed Documentation
Read the **[Project Documentation PDF](./docs/Grocery%20List%20Manager.pdf)** for comprehensive specifications and requirements.

## 🏗️ Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────┐
│         CLIENT (React + Vite)       │
│  - React components                 │
│  - TailwindCSS styling              │
│  - Axios HTTP requests              │
└────────────────┬────────────────────┘
                 │
          HTTP/SSE Connection
                 │
┌────────────────▼────────────────────┐
│    SERVER (Express + Node.js)       │
│  - REST API routes                  │
│  - JWT authentication               │
│  - Server-Sent Events               │
│  - Business logic                   │
└────────────────┬────────────────────┘
                 │
        MongoDB Driver (Mongoose)
                 │
┌────────────────▼────────────────────┐
│     DATABASE (MongoDB Atlas)        │
│  - Users collection                 │
│  - Groups collection                │
│  - Lists collection                 │
│  - Items collection                 │
└─────────────────────────────────────┘
```

### Key Features by Layer

**Frontend:**
- User authentication interface
- Group management UI
- Real-time list synchronization display
- Admin dashboard

**Backend:**
- JWT token generation and validation
- Group invite code generation
- Real-time data synchronization via SSE
- Auto-completion logic

**Database:**
- User data and authentication
- Group and membership tracking
- List and item hierarchies

## 🔐 Security

- **Password Hashing** — bcryptjs with salt rounds
- **JWT Tokens** — Secure token-based authentication
- **Protected Routes** — Admin middleware for sensitive endpoints
- **CORS Configuration** — Cross-origin resource sharing

## 📖 In-App Features

The application includes a built-in **Project Architecture** page:
- Click the **map icon** in the top-right header
- Or click **"How it's built"** link in the landing page footer
- Shows live architecture diagrams and system overview

## ⚡ Notes

- **Internet Connection Required** — The app connects to MongoDB Atlas
- **Pre-built Client** — React app is pre-built in `client/dist/`
- **Real-time Updates** — Server-Sent Events keep lists synchronized
- **Session Management** — JWT tokens expire and refresh automatically

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this repository and submit pull requests with improvements.

---

**Last Updated:** April 2026
**Version:** 1.0.0
>>>>>>> 10b17d4 (Initial commit)
