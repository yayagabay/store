import React from 'react';
import axios from 'axios';

const ProductList = ({ products, fetchProducts }) => {
  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this product?');

    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts(); // 🔁 Refresh the list after deleting
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete the product.');
    }
  };

  return (
    <div>
      <h2>Product List</h2>
      
      {products.map((product) => (
        <div key={product._id}>
          {product.name} - ${product.price}
          <button onClick={() => handleDelete(product._id)} style={{ backgroundColor:"red",marginLeft: '10px' }}>
            ❌ Delete
          </button>
      <br/>
      <br/>

        </div>
      ))}
    </div>
  );
};

export default ProductList;