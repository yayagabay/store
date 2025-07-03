import express from 'express';
import authMiddleware from '../middleware/auth.js';
import Todo from '../models/Todo.js';

const router = express.Router();

// ✅ Get user's todos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const todos = await Todo.find({ owner: req.user.userId });
    res.json(todos);
  } catch (err) {
    console.error('Fetch todos error:', err);
    res.status(500).json({ error: 'Server error while fetching todos.' });
  }
});

// ✅ Create new todo
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, completed } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const newTodo = new Todo({
      title: title.trim(),
      completed: !!completed,
      owner: req.user.userId
    });

    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    console.error('Create todo error:', err);
    res.status(500).json({ error: 'Server error while creating todo.' });
  }
});

// ✅ Delete a todo
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found or not authorized.' });
    }

    res.json({ message: 'Todo deleted.' });
  } catch (err) {
    console.error('Delete todo error:', err);
    res.status(500).json({ error: 'Server error while deleting todo.' });
  }
});

// ✅ Mark completed
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { completed: req.body.completed },
      { new: true }
    );

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found or not authorized.' });
    }

    res.json(todo);
  } catch (err) {
    console.error('Update todo error:', err);
    res.status(500).json({ error: 'Server error while updating todo.' });
  }
});

export default router;
