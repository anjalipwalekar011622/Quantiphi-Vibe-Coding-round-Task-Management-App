CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avatar_color VARCHAR(50) DEFAULT '#ccc'
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'To-Do', -- 'To-Do', 'In Progress', 'Done'
    priority VARCHAR(50) NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
    due_date DATE,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    assigned_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Insert some dummy data
INSERT INTO users (name, avatar_color) VALUES 
('Alice', '#3498db'),
('Bob', '#2ecc71'),
('Charlie', '#e67e22');

INSERT INTO projects (name) VALUES 
('Frontend Development'),
('Backend Development');

INSERT INTO tasks (title, description, status, priority, project_id, assigned_user_id) VALUES
('Setup React Project', 'Initialize Vite and React', 'Done', 'High', 1, 1),
('Design Kanban Board', 'Create HTML/CSS layout', 'In Progress', 'Medium', 1, 2),
('Setup Node Backend', 'Initialize Express and Postgres', 'Done', 'High', 2, 3),
('Create DB Schema', 'Write SQL file for PG', 'In Progress', 'Medium', 2, 1);
