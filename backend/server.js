const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'task_management',
  password: 'password',
  port: 5432,
});

// Get all users and check for burnout condition
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    const users = result.rows;
    
    // Check burnout condition for each user
    const tasksResult = await pool.query("SELECT assigned_user_id, count(*) as count FROM tasks WHERE status = 'In Progress' AND assigned_user_id IS NOT NULL GROUP BY assigned_user_id");
    const taskCounts = {};
    tasksResult.rows.forEach(row => {
      taskCounts[row.assigned_user_id] = parseInt(row.count, 10);
    });

    const usersWithBurnout = users.map(u => ({
      ...u,
      isBurnout: (taskCounts[u.id] || 0) > 5
    }));

    res.json(usersWithBurnout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tasks.*, users.name as user_name 
      FROM tasks 
      LEFT JOIN users ON tasks.assigned_user_id = users.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a task
app.post('/api/tasks', async (req, res) => {
  const { title, description, status, priority, due_date, project_id, assigned_user_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, status, priority, due_date, project_id, assigned_user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [title, description, status || 'To-Do', priority || 'Medium', due_date, project_id, assigned_user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a task (e.g., drag and drop status change)
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status, priority, assigned_user_id } = req.body;
  
  try {
    const fields = [];
    const values = [];
    let query = 'UPDATE tasks SET ';
    
    if (status) {
      values.push(status);
      fields.push(`status = $${values.length}`);
    }
    if (priority) {
      values.push(priority);
      fields.push(`priority = $${values.length}`);
    }
    if (assigned_user_id !== undefined) {
      values.push(assigned_user_id);
      fields.push(`assigned_user_id = $${values.length}`);
    }
    
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    
    query += fields.join(', ') + ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(id);
    
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for Workload Balancing column counts
app.get('/api/board-stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT status, count(*) FROM tasks GROUP BY status');
    const stats = { 'To-Do': 0, 'In Progress': 0, 'Done': 0 };
    result.rows.forEach(row => {
      stats[row.status] = parseInt(row.count, 10);
    });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
