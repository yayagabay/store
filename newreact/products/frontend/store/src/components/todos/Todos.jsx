import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const history = useHistory();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      history.replace('/login');
      return;
    }
    fetchTodos();
  }, [token]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/todos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        history.replace('/login');
        return;
      }

      const data = await res.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch todos.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      setError('');

      const res = await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: title.trim() })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add todo');
      }

      setTitle('');
      await fetchTodos();
    } catch (err) {
      console.error('Add todo error:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Delete failed.');
      await fetchTodos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !completed })
      });
      if (!res.ok) throw new Error('Toggle failed.');
      await fetchTodos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
      <h2>✅ Todos</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleAddTodo} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Add new todo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
        />
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Add Todo
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map((todo) => (
            <li
              key={todo._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                borderBottom: '1px solid #ccc'
              }}
            >
              <span
                style={{
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  cursor: 'pointer',
                  flexGrow: 1
                }}
                onClick={() => handleToggleComplete(todo._id, todo.completed)}
              >
                {todo.title}
              </span>
              <button
                onClick={() => handleDelete(todo._id)}
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.3rem 0.5rem',
                  backgroundColor: 'red',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
