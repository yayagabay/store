import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useCart } from '../../context/CartContext.jsx';

export default function AllProducts() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');
  const { addToCart } = useCart();
  const history = useHistory();

  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  let currentUser = null;
  try {
    currentUser = jwtDecode(token);
  } catch (e) {
    console.error('Invalid token:', e);
  }

  const isAdmin = currentUser?.username === 'admin';

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = () => {
    fetch(`${API_URL}/api/products/all`)
      .then(res => res.json())
      .then(data => {
        // ✅ Sort admin products first
        const sorted = [...data].sort((a, b) => {
          if (a.owner?.username === 'admin' && b.owner?.username !== 'admin') return -1;
          if (b.owner?.username === 'admin' && a.owner?.username !== 'admin') return 1;
          return 0;
        });
        setProducts(sorted);
      })
      .catch(() => setError('❌ Could not load all products.'));
  };

  const handleAddToCart = (product) => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image
    });
    history.push('/dashboard/cart');
  };

  const handleDeleteProduct = (id) => {
    fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('❌ Failed to delete');
        return res.json();
      })
      .then(() => fetchAllProducts())
      .catch(() => setError('❌ Error deleting product.'));
  };

  const placeholderImage = "https://via.placeholder.com/300x200?text=No+Image";

  return (
    <div style={{ padding: '1rem' }}>
      <h2>🌐 All Products (from All Users)</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1rem'
          }}
        >
          {products.map(p => (
            <div
              key={p._id}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <img
                src={p.image && p.image.startsWith('http') ? p.image : placeholderImage}
                alt={p.name}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  marginBottom: '0.5rem'
                }}
              />
              <h4>{p.name}</h4>
              <p>{p.description}</p>
              <p style={{ fontWeight: 'bold' }}>₪{p.price}</p>
              <p>
                Created by:{' '}
                <span
                  style={{
                    color: p.owner?.username === 'admin' ? 'red' : 'inherit',
                    fontWeight: 'bold'
                  }}
                >
                  {p.owner?.username || 'Unknown'}
                </span>
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button
                  onClick={() => handleAddToCart(p)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Add to Cart
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteProduct(p._id)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
