import { useEffect, useState } from "react";
import axios from "axios";

function LowStockList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/dashboard/low-stock",
    );

    setItems(res.data);
  };

  return (
    <div className="border border-black-200 bg-white p-5 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          ⚠️ Low Stock Items
        </h2>

        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
          {items.length}
        </span>
      </div>

      {/* CONTENT */}
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          No low stock items 🎉
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              {/* NAME */}
              <span className="font-medium text-gray-800">{item.name}</span>

              {/* STOCK BADGE */}
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-xs font-semibold">
                {item.stock} left
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LowStockList;
