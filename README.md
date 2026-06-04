# TaskFlow ✦

A clean, full-stack task manager with a Node.js/Express REST API and a React frontend. Tasks persist via SQLite across server restarts.

---

## Features

- **Add tasks** with title (required), optional description and due date  
- **View all tasks**, sorted newest-first  
- **Complete / uncomplete** tasks with one click  
- **Edit** any field inline  
- **Delete** with a confirmation prompt  
- **Filter** by All · Active · Completed  
- **Search** tasks by title  
- **Overdue indicators** for incomplete tasks past their due date  
- **Active / Completed counts** always visible in the header  
- **Empty states** per filter and search context  
- **Drag-and-drop reordering** (mouse and keyboard)  
- **Persistent storage** via SQLite (`tasks.db` at project root)  
- Toast notifications, loading states, and full error handling  
- Fully responsive — mobile and desktop  

---

## Tech Stack

| Layer      | Tech                             |
|------------|----------------------------------|
| Backend    | Node.js 18+, Express 4, better-sqlite3 |
| Frontend   | React 18, Vite 5, @dnd-kit       |
| Database   | SQLite via better-sqlite3        |
| Styling    | Plain CSS with custom properties |

---

## Getting Started

### Prerequisites

- Node.js 18 or later  
- npm 9 or later  

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/taskflow.git
cd taskflow

# 2. Install server dependencies
npm install

# 3. Install client dependencies
cd client && npm install && cd ..
```

### Running in Development

Open **two terminals**:

**Terminal 1 – API server (port 3001)**
```bash
npm run dev:server
```

**Terminal 2 – Vite dev server (port 5173)**
```bash
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> The Vite dev server proxies all `/api/*` requests to `localhost:3001`.

### Running in Production

```bash
# Build the React frontend
npm run build:client

# Serve everything from the Express server (port 3001)
NODE_ENV=production npm start
```

Open [http://localhost:3001](http://localhost:3001).

---

## Project Structure

```
taskflow/
├── server/
│   ├── index.js     # Express app entry point
│   ├── routes.js    # All /api/tasks route handlers
│   └── db.js        # SQLite connection & schema init
├── client/
│   ├── src/
│   │   ├── App.jsx              # Root component, layout, state wiring
│   │   ├── App.css              # All styles (design tokens → components)
│   │   ├── components/
│   │   │   ├── TaskList.jsx     # DnD context + sortable list
│   │   │   ├── TaskItem.jsx     # Single task row (view + inline edit)
│   │   │   ├── TaskForm.jsx     # Add / edit form
│   │   │   └── ConfirmDialog.jsx # Deletion confirmation modal
│   │   ├── hooks/
│   │   │   └── useTasks.js      # All task state + API calls
│   │   └── utils/
│   │       ├── api.js           # Fetch wrapper, all API calls
│   │       └── dates.js         # Date formatting helpers
│   └── vite.config.js
├── tasks.db         # Created automatically on first run
├── package.json
└── README.md
```

---

## Environment Variables

| Variable        | Default                    | Description                   |
|-----------------|----------------------------|-------------------------------|
| `PORT`          | `3001`                     | Port for the Express server   |
| `NODE_ENV`      | `development`              | Set to `production` to serve static files |
| `CLIENT_ORIGIN` | `http://localhost:5173`    | Allowed CORS origin in dev    |

---

## API Documentation

See [`API.md`](./API.md) for the full REST API reference.

---

## Scripts

| Command                  | Description                              |
|--------------------------|------------------------------------------|
| `npm start`              | Start Express server (production)        |
| `npm run dev:server`     | Start Express server (development)       |
| `npm run build:client`   | Build React app to `client/dist/`        |
| `npm run install:all`    | Install all dependencies (server + client) |

---

## Design Decisions

- **No auth** – single-user as specified; all data stored in one SQLite table.
- **SQLite over JSON file** – ACID compliance, proper indexing, no parse/stringify overhead, trivial to migrate to Postgres later.
- **PATCH not PUT** – partial updates avoid accidental data loss from missing fields.
- **Summary counts from server** – always reflects true totals regardless of active filter or search.
- **Optimistic UI for toggle** – immediately updates the list for snappier feel; re-syncs summary from server.
- **DnD position stored as integer** – allows arbitrary reordering without renumbering entire list; `COALESCE(MAX(position), 0) + 1` for new tasks.
