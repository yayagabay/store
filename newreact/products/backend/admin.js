import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';

const MONGODB_URI = 'mongodb://localhost:27017/storeDB';

async function createAdmin() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const existing = await User.findOne({ username: 'admin' });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash('qwe123', 10);
  const adminUser = new User({
    username: 'admin',
    password: hashedPassword,
    isAdmin: true
  });

  await adminUser.save();
  console.log('admin user created.');
  process.exit(0);
}

createAdmin();