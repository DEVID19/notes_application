# 📝 CollabNotes — Real-Time Collaborative Notes Application

A production-quality full-stack web application that allows multiple users to create, edit, and collaborate on notes in real time. Built with React, Node.js, MongoDB, and Socket.io.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://notes-application-beta-sand.vercel.app |
| **Backend API** | https://notes-application-backend-epi0.onrender.com |

> ⚠️ Note: The backend is hosted on Render's free tier. The first request may take **50 seconds** to wake up after inactivity. Please wait and try again.

---

## ✨ Features

### ✅ Implemented
- **Authentication** — User registration and login with JWT stored in secure httpOnly cookies
- **Role-Based Access Control** — Three roles: Owner, Editor, Viewer with permissions enforced at API level
- **Notes Management** — Create, edit, delete notes with ownership and timestamps
- **Real-Time Collaboration** — Live editing with multiple users via Socket.io
- **Typing Indicators** — See who is currently typing in a note
- **Active User Avatars** — See who is currently in the same note
- **Collaborator Management** — Add/remove collaborators with specific roles
- **Search** — Search notes by title and content with debounced real-time results
- **Public Share Links** — Generate read-only public links without requiring login
- **Responsive UI** — Works on mobile, tablet, laptop, and large screens
- **Auto-Save** — Notes auto-save 600ms after you stop typing

### 🔜 Planned Features
- **Activity Log** — Track user actions (create, update, delete, share) with timestamps
- **Rich Text Editor** — Bold, italic, headings, code blocks
- **Email Notifications** — Notify collaborators when added to a note
- **Password Reset** — Forgot password via email flow
- **Note Version History** — Restore previous versions of a note
- **File Attachments** — Upload images and files to notes

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React + Vite | UI framework |
| Redux Toolkit | State management |
| Socket.io-client | Real-time communication |
| Tailwind CSS | Styling |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server framework |
| MongoDB + Mongoose | Database |
| Socket.io | WebSocket server |
| JWT + bcryptjs | Authentication |
| cookie-parser | Cookie handling |
| validator | Input validation |

---

## 🏗️ Architecture

```
notes_application/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controllers.js      # signup, login, logout
│   │   ├── note.controllers.js      # CRUD operations
│   │   └── collaborator.controllers.js  # sharing & collaboration
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verification
│   │   └── noteAccess.middleware.js # Role-based access (owner/editor/viewer)
│   ├── models/
│   │   ├── user.model.js            # User schema
│   │   └── note.model.js            # Note schema with collaborators
│   ├── routes/
│   │   ├── auth.routes.js           # /api/auth
│   │   └── notes.routes.js          # /api/notes
│   ├── socket/
│   │   └── Socket.js                # Socket.io setup & real-time events
│   ├── utils/
│   │   └── generateToken.js         # JWT generation
│   └── index.js                     # Entry point
│
└── frontend/
    └── src/
        ├── api/axios.js             # Axios instance with baseURL
        ├── app/store.js             # Redux store
        ├── features/
        │   ├── auth/authSlice.js    # Auth state & thunks
        │   └── notes/notesSlice.js  # Notes state & thunks
        ├── components/
        │   ├── Sidebar.jsx          # Navigation with mobile drawer
        │   ├── NoteCard.jsx         # Note preview card
        │   ├── CollaboratorPanel.jsx # Add/remove collaborators
        │   ├── ShareModal.jsx       # Public link generation
        │   ├── TypingIndicator.jsx  # Real-time typing display
        │   └── ProtectedRoute.jsx   # Auth guard for routes
        ├── hooks/
        │   └── useSocket.js         # Socket.io connection hook
        └── pages/
            ├── LoginPage.jsx
            ├── SignupPage.jsx
            ├── DashboardPage.jsx
            ├── NoteEditorPage.jsx
            └── PublicNotePage.jsx
```

---

## 🗄️ Database Schema

### User Model
```
{
  name:      String (unique, required)
  email:     String (unique, required)
  password:  String (hashed with bcrypt)
  createdAt: Date
  updatedAt: Date
}
```

### Note Model
```
{
  title:         String
  content:       String
  owner:         ObjectId → User
  collaborators: [
    {
      user:  ObjectId → User,
      role:  "editor" | "viewer"
    }
  ]
  isPublic:      Boolean
  publicToken:   String (random 64-char token)
  createdAt:     Date
  updatedAt:     Date
}
```

---

## 🔌 API Documentation

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | Register new user | No |
| POST | `/login` | Login user | No |
| GET | `/logout` | Logout user | No |

### Notes Routes — `/api/notes`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/all` | Get all notes (owned + shared) | Yes |
| POST | `/create` | Create new note | Yes |
| GET | `/view/:id` | Get single note | Yes (viewer+) |
| PUT | `/update/:id` | Update note | Yes (editor+) |
| DELETE | `/delete/:id` | Delete note | Yes (owner) |
| GET | `/search?q=` | Search notes | Yes |
| POST | `/addCollaborators/:id/collaborators` | Add collaborator | Yes (owner) |
| DELETE | `/removeCollaborators/:id/collaborators/:userId` | Remove collaborator | Yes (owner) |
| POST | `/:id/share` | Generate public link | Yes (owner) |
| DELETE | `/:id/share` | Disable public link | Yes (owner) |
| GET | `/public/:token` | View public note | No |

---

## ⚡ Real-Time Socket Events

| Event (Client → Server) | Description |
|--------------------------|-------------|
| `join-note` | Join a note room |
| `leave-note` | Leave a note room |
| `note-update` | Broadcast note changes |
| `user-typing` | Show typing indicator |
| `user-stopped-typing` | Hide typing indicator |

| Event (Server → Client) | Description |
|--------------------------|-------------|
| `user-joined` | Someone joined the note |
| `user-left` | Someone left the note |
| `note-updated` | Note was updated by peer |
| `user-typing` | Peer started typing |
| `user-stopped-typing` | Peer stopped typing |

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/DEVID19/notes_application.git
cd notes_application
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=8000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
```

Backend runs on `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `MONGODB_URL` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret for JWT signing | `your_secret` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Frontend (Vercel Environment Variables)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.onrender.com/api` |
| `VITE_SOCKET_URL` | Backend Socket URL | `https://your-backend.onrender.com` |

---

## 🚢 Deployment

### Backend → Render
1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect GitHub repo
4. Set Root Directory: `backend`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables

### Frontend → Vercel
1. Go to vercel.com → New Project
2. Connect GitHub repo
3. Set Root Directory: `frontend`
4. Framework: Vite (auto-detected)
5. Add `VITE_API_URL` and `VITE_SOCKET_URL` environment variables

---

## 👤 Author

**Devid Bisen**
- GitHub: [@DEVID19](https://github.com/DEVID19)

---

## 📄 License

This project was built as part of a 24-hour assignment focused on code quality, architecture, and real-world full-stack development.
