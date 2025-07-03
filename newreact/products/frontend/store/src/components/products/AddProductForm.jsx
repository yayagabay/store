import React, { useState } from 'react';
import axios from 'axios';

const AddProductForm = ({ fetchProducts }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProduct = { name, price: parseFloat(price) };
    await axios.post('http://localhost:5000/api/products', newProduct);
    setName('');
    setPrice('');
    fetchProducts(); // ✅ works now
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Product</h2>
      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <br />
      <br />
      <button style={{backgroundColor:"#2196f3"}} type="submit">Add</button>
    </form>
  );
};

export default AddProductForm;