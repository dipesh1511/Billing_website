import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import ProductModal from "../components/ProductModal";

function Products() {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const categories = [...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());

    const matchCategory = category ? p.category === category : true;

    return matchSearch && matchCategory;
  });

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products");

    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    await axios.delete(`http://localhost:5000/api/products/${id}`);

    fetchProducts();
  };

  const updateStock = async (id, type) => {
    const product = products.find((p) => p._id === id);

    let newStock = product.stock;

    if (type === "inc") newStock += 1;
    if (type === "dec" && newStock > 0) newStock -= 1;

    await axios.put(`http://localhost:5000/api/products/${id}`, {
      ...product,
      stock: newStock,
    });

    fetchProducts();
  };

  return (
    <Layout>
      {/* Search Input */}

      <div className="flex justify-between items-center mb-6 bg-white/80 backdrop-blur">
        {/* SEARCH */}
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search product..."
            className="w-full border border-black-200 rounded-lg px-4 py-2 pl-10 shadow-sm hover:scale-[1.03] focus:ring-2 focus:ring-blue-500 outline-none transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* ICON */}
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>

        {/* BUTTON */}
        <button
          onClick={() => {
            setEditData(null);
            setShowModal(true);
          }}
          className="hover:scale-[1.03] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-lg shadow-md transition flex items-center gap-2 cursor-pointer"
        >
          ➕ Add Product
        </button>
      </div>

      {/* Category  */}

      <div className="relative w-full md:w-1/3 mb-4">
        <select
          className="hover:border-blue-400 cursor-pointer w-full border border-black-200 rounded-lg px-4 py-2 pr-10 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition appearance-none bg-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>

          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* CUSTOM ARROW */}
        <span className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
          ⌄
        </span>
      </div>

      {/* Table */}

      <div className="bg-white rounded-xl shadow-md p-4">
        <table className="w-full border border-black-200 rounded-xl overflow-hidden">
          {/* HEADER */}
          <thead>
            <tr className="bg-gray-100 text-black-700 text-sm uppercase">
              <th className="p-3 border border-black-200 text-center">Name</th>

              <th className="p-3 border border-black-200 text-center">Price</th>

              <th className="p-3 border border-black-200 text-center">Stock</th>

              <th className="p-3 border border-black-200 text-center">
                Action
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {filteredProducts.map((p, index) => (
              <tr
                key={p._id}
                className={`text-center transition hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {/* NAME */}
                <td className="p-3 border border-black-200 font-medium text-gray-800">
                  {p.name}
                </td>

                {/* PRICE */}
                <td className="p-3 border border-black-200 font-semibold">
                  ₹{p.price}
                </td>

                {/* STOCK */}
                <td className="p-3 border border-black-200">
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => updateStock(p._id, "dec")}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 rounded cursor-pointer"
                    >
                      -
                    </button>

                    <span className="font-semibold">{p.stock}</span>

                    <button
                      onClick={() => updateStock(p._id, "inc")}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 rounded cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {p.stock <= p.minStock && (
                    <span className="text-red-500 text-xs block mt-1 font-medium">
                      Low Stock
                    </span>
                  )}
                </td>

                {/* ACTION */}
                <td className="p-3 border border-black-200 space-x-2">
                  <button
                    onClick={() => {
                      setEditData(p);
                      setShowModal(true);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProduct(p._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}

      <ProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        fetchProducts={fetchProducts}
        editData={editData}
      />
    </Layout>
  );
}

export default Products;
