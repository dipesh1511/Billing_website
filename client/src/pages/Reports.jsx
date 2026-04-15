import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Reports() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatePayment, setUpdatePayment] = useState(null);
  const [newPaid, setNewPaid] = useState(0);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchOrders();

    if (!updatePayment) return;

    const handleKeyDown = (e) => {
      // ESC → close popup
      if (e.key === "Escape") {
        setUpdatePayment(null);
      }

      // ENTER → update payment
      if (e.key === "Enter") {
        if (!newPaid || newPaid <= 0) {
          alert("Enter valid amount");
          return;
        }

        handleUpdatePayment();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [updatePayment, newPaid]);

  const fetchOrders = async () => {
    const res = await axios.get("http://localhost:5000/api/orders");
    setOrders(res.data);
  };

  const handleUpdatePayment = async () => {
    if (!updatePayment?._id) return;
    if (newPaid <= 0) return alert("enter valid amount");

    try {
      await axios.put(
        `http://localhost:5000/api/orders/update-payment/${updatePayment._id}`,
        { amount: Number(newPaid) },
      );

      alert("Payment Updated");

      setUpdatePayment(null);
      setNewPaid(0);
      fetchOrders();
    } catch (error) {
      console.log(error);
      alert("Error updating payment");
    }
  };

  const sendReminder = (order) => {
    const message = `Hi ${order.customerName},
        Your payment of ₹${order.remainingAmount} is pending.
        Please pay soon.

        - Deep Mart`;

    const url = `https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  const filteredOrders = orders.filter((o) => {
    const matchName = o.customerName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const orderDate = new Date(o.createdAt);

    const matchDate =
      (!startDate || orderDate >= new Date(startDate)) &&
      (!endDate || orderDate <= new Date(endDate));

    return matchName && matchDate;
  });

  const customerMap = {};

  filteredOrders.forEach((o) => {
    if (!customerMap[o.customerName]) {
      customerMap[o.customerName] = {
        total: 0,
        paid: 0,
        due: 0,
        orders: [],
      };
    }

    customerMap[o.customerName].total += o.totalAmount;
    customerMap[o.customerName].paid += o.paidAmount;
    customerMap[o.customerName].due += o.remainingAmount;
    customerMap[o.customerName].orders.push(o);
  });

  const handleClearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Payment History</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-end">
        {/* SEARCH */}
        <div className="flex flex-col w-full md:w-1/3">
          <label className="text-xs font-medium text-gray-600 mb-1">
            Search Customer
          </label>
          <input
            type="text"
            placeholder="Enter customer name"
            className="border border-black-200 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* START DATE */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 mb-1">
            Start Date
          </label>
          <input
            type="date"
            className="border border-black-200 cursor-pointer p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* END DATE */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-600 mb-1">
            End Date
          </label>
          <input
            type="date"
            className="border border-black-200 cursor-pointer p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* CLEAR BUTTON */}
        <div className="flex flex-col justify-end">
          <button
            onClick={handleClearFilters}
            className=" bg-amber-200 border border-black-300 cursor-pointer px-4 py-2 rounded-md text-sm hover:bg-gray-100 transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* 🔥 SUMMARY BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* TOTAL SALES */}
        <div className="bg-white border border-black-200 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Sales</p>

          <h2 className="text-2xl font-semibold text-gray-800">
            ₹{filteredOrders.reduce((s, o) => s + o.totalAmount, 0)}
          </h2>
        </div>

        {/* TOTAL PAID */}
        <div className="bg-white border border-black-200 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Paid</p>

          <h2 className="text-2xl font-semibold text-green-600">
            ₹{filteredOrders.reduce((s, o) => s + o.paidAmount, 0)}
          </h2>
        </div>

        {/* TOTAL DUE */}
        <div className="bg-white border border-black-200 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Due</p>

          <h2 className="text-2xl font-semibold text-red-500">
            ₹{filteredOrders.reduce((s, o) => s + o.remainingAmount, 0)}
          </h2>
        </div>
      </div>

      {/* ORDER TABLE */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <table className="w-full border border-black-200 border-collapse">
          {/* HEADER */}
          <thead>
            <tr className="bg-gray-100 text-black-700 text-sm uppercase">
              <th className="p-3 border border-black-200 text-left">
                Customer
              </th>
              <th className="p-3 border border-black-200 text-left">Phone</th>
              <th className="p-3 border border-black-200 text-center">Total</th>
              <th className="p-3 border border-black-200 text-center">Paid</th>
              <th className="p-3 border border-black-200 text-center">
                Remaining
              </th>
              <th className="p-3 border border-black-200 text-center">
                Status
              </th>
              <th className="p-3 border border-black-200 text-center">
                Action
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {filteredOrders.map((o, index) => (
              <tr
                key={o._id}
                className={`border-b hover:bg-gray-50 transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="p-3 border border-black-200 font-medium text-gray-800">
                  {o.customerName}
                </td>

                <td className="p-3 border border-black-200 text-gray-600">
                  {o.customerPhone}
                </td>

                <td className="p-3 border border-black-200 text-center font-semibold">
                  ₹{o.totalAmount}
                </td>

                <td className="p-3 border-l border-black-200 text-center text-green-600 font-semibold">
                  ₹{o.paidAmount}
                </td>

                <td className="p-3 border-l border-black text-center text-red-500 font-semibold">
                  ₹{o.remainingAmount}
                </td>

                {/* STATUS BADGE */}
                <td className="p-3 border border-black-200 text-center">
                  {o.status === "paid" && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Paid
                    </span>
                  )}

                  {o.status === "due" && (
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Due
                    </span>
                  )}

                  {o.status === "unpaid" && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                      Unpaid
                    </span>
                  )}
                </td>

                {/* ACTION BUTTONS */}
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => setSelectedOrder(o)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer"
                  >
                    View
                  </button>

                  {o.status !== "paid" && (
                    <button
                      onClick={() => setUpdatePayment(o)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer"
                    >
                      Update
                    </button>
                  )}

                  {o.status !== "paid" && (
                    <button
                      onClick={() => sendReminder(o)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer"
                    >
                      Reminder
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 CUSTOMER REPORT */}
      <div className="mt-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Customer Report
          </h2>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* HEADER ROW */}
          <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
            <span>Customer</span>
            <span>Total</span>
            <span>Paid</span>
            <span>Due</span>
          </div>

          {/* DATA */}
          {Object.entries(customerMap).map(([name, data]) => (
            <div
              key={name}
              onClick={() => setSelectedCustomer(data.orders)}
              className="grid grid-cols-4 px-4 py-3 text-sm items-center border-t hover:bg-gray-50 cursor-pointer transition"
            >
              {/* NAME */}
              <span className="font-medium text-gray-800">{name}</span>

              {/* TOTAL */}
              <span className="text-gray-700">₹{data.total}</span>

              {/* PAID */}
              <span className="text-green-600 font-medium">₹{data.paid}</span>

              {/* DUE */}
              <span
                className={`font-medium ${data.due > 0 ? "text-red-500" : "text-gray-500"}`}
              >
                ₹{data.due}
              </span>
            </div>
          ))}
        </div>
      </div>

      {selectedCustomer && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* HEADER */}
          <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              Customer Bills
            </h3>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-sm text-red-500 cursor-pointer hover:text-red-700"
            >
              Close ❌
            </button>
          </div>

          {/* TABLE HEADER */}
          <div className="grid grid-cols-3 px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
            <span>Total</span>
            <span>Paid</span>
            <span>Due</span>
          </div>

          {/* DATA */}
          {selectedCustomer.map((o) => (
            <div
              key={o._id}
              className="grid grid-cols-3 px-4 py-3 text-sm border-t items-center hover:bg-gray-50 transition"
            >
              {/* TOTAL */}
              <span className="text-gray-700">₹{o.totalAmount}</span>

              {/* PAID */}
              <span className="text-green-600 font-medium">
                ₹{o.paidAmount}
              </span>

              {/* DUE */}
              <span
                className={`font-medium ${
                  o.remainingAmount > 0 ? "text-red-500" : "text-gray-500"
                }`}
              >
                ₹{o.remainingAmount}
              </span>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[420px] shadow-2xl print:shadow-none print:w-full print:rounded-none">
            {/* HEADER */}
            <h2 className="text-xl font-bold text-center mb-3 border-b pb-2">
              🧾 Payment Receipt
            </h2>

            {/* SHOP */}
            <div className="text-center mb-3">
              <p className="font-semibold text-lg">Deep Mart</p>
              <p className="text-sm text-gray-500">📞 9876543210</p>
            </div>

            {/* CUSTOMER */}
            <div className="text-sm mb-3 space-y-1">
              <p>
                <span className="text-gray-500">Customer:</span>{" "}
                {selectedOrder.customerName || "N/A"}
              </p>
              <p>
                <span className="text-gray-500">Phone:</span>{" "}
                {selectedOrder.customerPhone || "N/A"}
              </p>
              <p>
                <span className="text-gray-500">Date:</span>{" "}
                {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="border-t my-2"></div>

            {/* ITEMS */}
            <div className="max-h-40 overflow-y-auto text-sm space-y-2 pr-1">
              <div className="flex justify-between font-semibold border-b pb-1">
                <span>Item</span>
                <span>Total</span>
              </div>

              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t my-2"></div>

            {/* PAYMENT */}
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Total</span>
                <span className="font-semibold">
                  ₹{selectedOrder.totalAmount}
                </span>
              </div>

              <div className="flex justify-between text-green-600">
                <span>Paid</span>
                <span className="font-semibold">
                  ₹{selectedOrder.paidAmount}
                </span>
              </div>

              <div className="flex justify-between text-red-500">
                <span>Remaining</span>
                <span className="font-semibold">
                  ₹{selectedOrder.remainingAmount}
                </span>
              </div>

              <div className="flex justify-between mt-2">
                <span>Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold 
            ${
              selectedOrder.status === "paid"
                ? "bg-green-100 text-green-700"
                : selectedOrder.status === "due"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
                >
                  {selectedOrder.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS (HIDE IN PRINT) */}
            <div className="flex justify-between mt-5 print:hidden">
              <button
                onClick={() => window.print()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer"
              >
                🖨️ Print
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {updatePayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[340px] shadow-2xl">
            {/* TITLE */}
            <h2 className="text-lg font-bold text-center mb-4 border-b pb-2">
              💳 Update Payment
            </h2>

            {/* DETAILS */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-black-600 text-sm">Total</span>
                <span className="font-semibold">
                  ₹{updatePayment.totalAmount}
                </span>
              </div>

              <div className="flex justify-between text-green-600">
                <span>Already Paid</span>
                <span className="font-semibold">
                  ₹{updatePayment.paidAmount}
                </span>
              </div>

              <div className="flex justify-between text-red-500">
                <span>Remaining</span>
                <span className="font-semibold">
                  ₹{updatePayment.totalAmount - updatePayment.paidAmount}
                </span>
              </div>
            </div>

            {/* INPUT */}
            <div className="flex flex-col mb-4">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Enter Amount
              </label>

              <input
                type="number"
                min="0"
                placeholder="₹ Enter amount"
                className="border p-2 rounded-md focus:ring-2 focus:ring-green-500 outline-none transition"
                onChange={(e) => setNewPaid(Number(e.target.value))}
                required
              />
            </div>

            {/* BUTTONS */}
            <div className="flex justify-between gap-3">
              <button
                onClick={() => setUpdatePayment(null)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-md transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdatePayment}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Reports;
