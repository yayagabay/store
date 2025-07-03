import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Todo', todoSchema);
