import { useState, useEffect } from "react";
import axios from "axios";
import { saveOffline } from "../utils/offline";
function ProductModal({ isOpen, onClose, fetchProducts, editData }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    minStock: "",
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        price: editData.price || "",
        category: editData.category || "",
        stock: editData.stock || "",
        minStock: editData.minStock || "",
      });
    } else {
      // reset form when adding new
      setForm({
        name: "",
        price: "",
        category: "",
        stock: "",
        minStock: "",
      });
    }

    const handleKeyDown = (e) => {
      // ESC → close modal
      if (e.key === "Escape") {
        onClose();
      }

      // ENTER → submit form
      if (e.key === "Enter") {
        // Prevent if user typing in textarea (future safe)
        if (e.target.tagName === "TEXTAREA") return;

        handleSubmit(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editData]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!form.name || !form.price || !form.stock) {
      alert("Please fill all required fields");
      return;
    }

    try {
      // ✅ IMPORTANT FIX (Number conversion)
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        stock: Number(form.stock),
        minStock: Number(form.minStock || 0),
      };

      if (editData) {
        await axios.put(
          `http://localhost:5000/api/products/${editData._id}`,
          payload,
        );
      } else {
        if (!navigator.onLine) {
          saveOffline("products", payload);
          alert("Product saved offline ✅");
        } else {
          await axios.post("http://localhost:5000/api/products", payload);
        }
      }

      fetchProducts();
      onClose();
    } catch (error) {
      console.log("ERROR:", error.response?.data || error.message);
      alert("Something went wrong!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[380px] shadow-2xl">
        {/* TITLE */}
        <h2 className="text-xl font-bold text-center mb-5 border-b pb-2">
          {editData ? "✏️ Edit Product" : "➕ Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Product Name
            </label>
            <input
              name="name"
              placeholder="Enter product name"
              className="border border-black-200 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* PRICE */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              name="price"
              type="number"
              placeholder="Enter price"
              className="border border-black-200 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          {/* CATEGORY */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Category
            </label>
            <input
              name="category"
              placeholder="Enter category"
              className="border border-black-200 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          {/* STOCK + MIN STOCK */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Stock
              </label>
              <input
                name="stock"
                type="number"
                placeholder="Stock"
                className="border border-black-200 p-2 rounded-md focus:ring-2 focus:ring-green-500 outline-none transition"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Min Stock
              </label>
              <input
                name="minStock"
                type="number"
                placeholder="Min"
                className="border border-black-200 p-2 rounded-md focus:ring-2 focus:ring-red-400 outline-none transition"
                value={form.minStock}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-md transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
