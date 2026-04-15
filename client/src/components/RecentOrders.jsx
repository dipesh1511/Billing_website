import { useEffect, useState } from "react";
import axios from "axios";

function RecentOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/dashboard/recent-orders",
    );

    setOrders(res.data);
  };

  return (
    <div className="border border-black-200 bg-white p-5 rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          🧾 Recent Orders
        </h2>

        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
          {orders.length}
        </span>
      </div>

      {/* CONTENT */}
      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No orders yet</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              {/* LEFT */}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>

                <span className="text-xs text-gray-500">
                  Order ID: {order._id.slice(-5)}
                </span>
              </div>

              {/* RIGHT */}
              <span className="text-green-600 font-semibold">
                ₹{order.totalAmount || 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentOrders;
