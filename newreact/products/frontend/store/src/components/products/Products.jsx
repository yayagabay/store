import React, { useState, useEffect } from 'react';

export default function Products() {
  const API_URL = 'http://localhost:5000';
  const CLOUD_NAME = 'dqmhtofnf';
  const UPLOAD_PRESET = 'yairgabay';
  const token = localStorage.getItem('token');

  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch(`${API_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setProducts)
      .catch(() => setError('❌ Could not load products.'));
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) return '';

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError('❌ Check your .env Cloudinary config.');
      return '';
    }

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('upload_preset', UPLOAD_PRESET);

    setUploading(true);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      setUploading(false);

      if (res.ok && data.secure_url) return data.secure_url;

      console.error('Cloudinary Error:', data);
      setError(`❌ Cloudinary error: ${data.error?.message || 'Upload failed'}`);
      return '';
    } catch (err) {
      console.error('Upload Error:', err);
      setUploading(false);
      setError('❌ Network error uploading image.');
      return '';
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !price.trim()) {
      setError('❌ Name and price are required.');
      return;
    }

    let imageUrl = '';
    if (imageFile) {
      imageUrl = await uploadImageToCloudinary();
      if (!imageUrl) return;
    }

    const newProduct = {
      name: name.trim(),
      description: description.trim(),
      price: price.trim(),
      image: imageUrl
    };

    fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newProduct)
    })
      .then(res => {
        if (!res.ok) throw new Error('❌ Failed to add product');
        return res.json();
      })
      .then(() => {
        setName('');
        setDescription('');
        setPrice('');
        setImageFile(null);
        fetchProducts();
      })
      .catch(() => setError('❌ Error adding product. Check your server.'));
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('❌ Failed to delete');
        return res.json();
      })
      .then(() => fetchProducts())
      .catch(() => setError('❌ Error deleting product.'));
  };

  const placeholderImage = "https://via.placeholder.com/300x200?text=No+Image";

  return (
    <div style={{ padding: '1rem' }}>
      <h2>👜 My Products</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleAddProduct} style={{
        border: '1px solid #ccc',
        padding: '1rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        backgroundColor: '#fff'
      }}>
        <h3>Add New Product</h3>
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input type="text" placeholder="Price (₪)" value={price} onChange={e => setPrice(e.target.value)} required />
        <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
        <button type="submit" disabled={uploading} style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '4px',
          cursor: uploading ? 'not-allowed' : 'pointer'
        }}>
          {uploading ? 'Uploading...' : 'Add Product'}
        </button>
      </form>

      <h3>📦 My Products List</h3>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1rem'
        }}>
          {products.map(p => (
            <div key={p._id} style={{
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <img
                src={p.image && p.image.startsWith('http') ? p.image : placeholderImage}
                alt={p.name}
                style={{ width: '100%', height: '150px', objectFit: 'cover',border:'5px dashed aqua', borderRadius: '4px', marginBottom: '0.5rem' }}
              />
              <h4>{p.name}</h4>
              <p>{p.description}</p>
              <p style={{ fontWeight: 'bold' }}>₪{p.price}</p>
              <button onClick={() => handleDeleteProduct(p._id)} style={{
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                width: '100%'
              }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
