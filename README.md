# VibeTasker - Task Management App

A highly interactive, full-stack Kanban-style task management application built for the Quantiphi Vibe Coding Round. This application features a custom CRUD API, relational database integration, and unique "Workload Balancing" logic to warn against user burnout.

## 🚀 Tech Stack
* **Frontend:** React (Vite) + Vanilla CSS (Glassmorphism & Light/Dark themes)
* **Backend:** Node.js + Express.js
* **Database:** PostgreSQL (Containerized via Docker)

## ✨ Core Features
* **Interactive Kanban Board:** Native HTML5 drag-and-drop capability between 'To-Do', 'In Progress', and 'Done' columns.
* **Intelligent Sorting:** Tasks are automatically sorted server-side by Priority (High > Medium > Low) and then by Due Date, stacking the most critical tasks at the top.
* **Task Dates:** Every task tracks both the Assigned Date and the Due Date.
* **Project Associations & Permissions:** Dedicated UI controls and API routes for assigning users to projects with granular permission levels (Admin, Editor, Viewer), satisfying strict relational data constraints.
* **The "Vibe Check" (Burnout Warning):** As per requirements, the backend calculates the number of "In Progress" tasks for each user. If a user has > 5 tasks in progress, their avatar pulses red on the frontend to warn of potential burnout.
* **Persistent Themes:** Seamless Light and Dark mode toggling that saves directly to `localStorage`.
* **Relational Logic:** PostgreSQL elegantly handles the relationships between Projects, Users, and Tasks using Foreign Keys and Cascades.

## 🏗️ Architecture & Constraints Followed
* **Server-Side Computations:** All business logic, validations, and complex sorting (Priority + Due Date logic) happen entirely inside the Express server and PostgreSQL queries. The frontend purely handles presentation and user interactions.
* **Custom Styling:** Vanilla CSS was used to create a premium, fast, and highly customized interface without relying on generic frameworks.

## 🛠️ Setup Instructions

### Prerequisites
* Node.js installed
* Docker & Docker Compose installed (for the PostgreSQL database)

### 1. Database Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Spin up the PostgreSQL container (it will auto-seed tables and dummy data via `init.sql`):
   ```bash
   docker compose up -d
   ```

### 2. Backend Server Setup
1. Stay in the `backend` folder and install dependencies:
   ```bash
   npm install
   ```
2. Start the Express API Server:
   ```bash
   node server.js
   ```
   *The backend will now be running on `http://localhost:5000`*

### 3. Frontend Setup
1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install React dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will now be running on `http://localhost:5173`*

## 🧑‍💻 How to Test
1. Visit `http://localhost:5173`.
2. Drag and drop tasks across columns.
3. Rapidly create 6 tasks and drag them all to "In Progress" assigned to the same user to trigger the **Burnout Pulse Animation**.
4. Toggle Light/Dark mode in the top right to see seamless UI transitions.
