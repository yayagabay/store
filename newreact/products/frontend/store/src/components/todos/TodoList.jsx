import React from 'react';
import axios from 'axios';

const TodoList = ({ todos, fetchTodos }) => {
  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this Todo?');

    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/todo/${id}`);
      fetchTodos(); // 🔁 Refresh the list after deleting
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete the todo.');
    }
  };

  return (
    <div>
      <h2>Todo List</h2>
      
      {todos.map((todo) => (
        <div key={todo._id}>
          {todo.name} - ${todo.price}
          <button onClick={() => handleDelete(todo._id)} style={{ backgroundColor:"red",marginLeft: '10px' }}>
            ❌ Delete
          </button>
      <br/>
      <br/>

        </div>
      ))}
    </div>
  );
};

export default TodoList;