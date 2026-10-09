import { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterPriority, setFilterPriority] = useState('All');
  const [showModal, setShowModal] = useState(false);
  
  const columns = ['To-Do', 'In Progress', 'Done'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/tasks`),
        fetch(`${API_BASE}/users`)
      ]);
      const tasksData = await tasksRes.json();
      const usersData = await usersRes.json();
      setTasks(tasksData);
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    const task = tasks.find(t => t.id === parseInt(taskId));
    
    if (task && task.status !== newStatus) {
      // Optimistic update
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      
      try {
        await fetch(`${API_BASE}/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        // Refetch to get updated burnout status from backend
        fetchData();
      } catch (err) {
        console.error("Error updating task:", err);
        fetchData(); // Revert on error
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTask = Object.fromEntries(formData.entries());
    
    try {
      await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("Error creating task", err);
    }
  };

  const filteredTasks = filterPriority === 'All' 
    ? tasks 
    : tasks.filter(t => t.priority === filterPriority);

  return (
    <div className="app-container">
      <header className="header">
        <h1>VibeTasker</h1>
        
        <div className="team-list">
          {users.map(user => (
            <div 
              key={user.id} 
              className={`avatar ${user.isBurnout ? 'burnout' : ''}`}
              style={{ backgroundColor: user.avatar_color }}
              title={`${user.name} ${user.isBurnout ? '(Burnout Warning!)' : ''}`}
            >
              {user.name.charAt(0)}
            </div>
          ))}
        </div>
      </header>

      <div className="controls">
        <button className="btn" onClick={() => setShowModal(true)}>+ Create Task</button>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="kanban-board">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col);
          return (
            <div 
              key={col} 
              className="column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
            >
              <div className="column-header">
                <h2>{col}</h2>
                <span className="task-count">{colTasks.length}</span>
              </div>
              
              {colTasks.map(task => (
                <div 
                  key={task.id}
                  className="task-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                >
                  <h3>{task.title}</h3>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  
                  <div className="task-meta">
                    <span className={`priority-tag priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                    {task.user_name && <span>👤 {task.user_name}</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title</label>
                <input name="title" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows="3"></textarea>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority">
                  <option value="High">High</option>
                  <option value="Medium" selected>Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select name="assigned_user_id">
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Project</label>
                <select name="project_id" required>
                  <option value="1">Frontend Development</option>
                  <option value="2">Backend Development</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
