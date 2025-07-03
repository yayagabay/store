import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: String,
  image: String,  // ✅ This stores the Cloudinary secure_url
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Product', ProductSchema);
