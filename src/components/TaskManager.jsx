import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './TaskManager.css';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', status: 'Pending' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('https://localhost:7025/api/tasks');
      setTasks(res.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    }
  };

  const validateForm = () => {
    if (!form.title.trim() || !form.description.trim() || !form.dueDate) {
      setError('All fields are required.');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateForm()) return;

    try {
      if (editingId) {
        await axios.put(`https://localhost:7025/api/tasks/${editingId}`, form);
        setMessage('Task updated successfully.');
      } else {
        await axios.post('https://localhost:7025/api/tasks', form);
        setMessage('Task added successfully.');
      }
      setForm({ title: '', description: '', dueDate: '', status: 'Pending' });
      setEditingId(null);
      fetchTasks();
    } catch (err) {
      setError('Failed to submit task.');
    }
  };

  const handleEdit = (task) => {
    setForm({ title: task.title, description: task.description, dueDate: task.dueDate.split('T')[0], status: task.status });
    setEditingId(task.taskId);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await axios.delete(`https://localhost:7025/api/tasks/${id}`);
        setMessage('Task deleted successfully.');
        fetchTasks();
      } catch (err) {
        setError('Failed to delete task.');
      }
    }
  };

  return (
    <div className="task-manager-container">
      <h1>Task Management</h1>
      {message && <div style={{ color: 'green' }}>{message}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form className="task-manager-form" onSubmit={handleSubmit}>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option value="Pending">Pending</option>
          <option value="InProgress">InProgress</option>
          <option value="Completed">Completed</option>
        </select>
        <button type="submit">{editingId ? 'Update' : 'Add'} Task</button>
      </form>
      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.taskId}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{new Date(task.dueDate).toLocaleDateString()}</td>
              <td>{task.status}</td>
              <td>
                <button onClick={() => handleEdit(task)}>Edit</button>
                <button onClick={() => handleDelete(task.taskId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskManager;