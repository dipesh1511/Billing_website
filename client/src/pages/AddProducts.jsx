import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddProduct() {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    minStock: "",
  });

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:5000/api/products", product);

    navigate("/products");
    // window.location.reload();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={product.name}
          placeholder="Product Name"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="price"
          value={product.price}
          placeholder="Price"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="category"
          value={product.category}
          placeholder="Category"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="stock"
          value={product.stock}
          placeholder="Stock"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <input
          name="minStock"
          value={product.minStock}
          placeholder="Min Stock"
          className="border p-2 w-full"
          onChange={handleChange}
        />

        <button className="bg-blue-600 text-white px-4 py-2">
          Add Product
        </button>
      </form>
    </div>
  );
}

export default AddProduct;
