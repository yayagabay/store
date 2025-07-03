import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
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
    fetchMessages();
  }, [token]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        history.replace('/login');
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid messages data');
      setMessages(data);
    } catch (err) {
      console.error('Fetch chat error:', err);
      setError('Failed to fetch messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Text is required.');
      return;
    }

    try {
      setError('');

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: content.trim() })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setContent('');
      await fetchMessages();
    } catch (err) {
      console.error('Send error:', err);
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return '';
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
      <h2>💬 Chat</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '6px',
            backgroundColor: '#f9f9f9',
            maxHeight: '400px',
            overflowY: 'auto',
            marginBottom: '1rem'
          }}
        >
          {messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                style={{
                  marginBottom: '0.75rem',
                  padding: '0.5rem',
                  borderBottom: '1px solid #eee'
                }}
              >
                <strong
                  style={{
                    color: msg.sender?.isAdmin ? 'red' : 'black'
                  }}
                >
                  {msg.sender?.username || 'Unknown'}:
                </strong>{' '}
                {msg.content}
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                  {formatDate(msg.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
        />
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
