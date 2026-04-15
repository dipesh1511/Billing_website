import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import jsPDF from "jspdf";
import { saveOffline } from "../utils/offline";

function Billing() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchProducts();

    const handleKeyDown = (e) => {
      // ESC → Close cart + invoice
      if (e.key === "Escape") {
        setShowCart(false);
        setShowInvoice(false);
      }

      // ENTER → Preview bill (only if cart open)
      if (e.key === "Enter" && showCart) {
        if (cart.length === 0) return;

        setShowInvoice(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCart, cart]);

  const fetchProducts = async () => {
    const res = await axios.get("http://localhost:5000/api/products");
    setProducts(res.data);
  };

  // Categories
  const categories = [...new Set(products.map((p) => p.category))];

  // Filter
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category ? p.category === category : true;
    return matchSearch && matchCategory;
  });

  // Add to Cart
  const addToCart = (product) => {
    const existing = cart.find((item) => item.productId === product._id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          category: product.category,
          quantity: 1,
        },
      ]);
    }
  };

  // Update Quantity
  const updateQuantity = (id, type) => {
    setCart(
      cart.map((item) => {
        if (item.productId === id) {
          if (type === "inc") return { ...item, quantity: item.quantity + 1 };
          if (type === "dec" && item.quantity > 1)
            return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }),
    );
  };

  // Remove Item
  const removeItem = (id) => {
    setCart(cart.filter((item) => item.productId !== id));
  };

  // Total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Checkout
  const handleCheckout = async () => {
    const orderData = {
      items: cart,
      paymentMethod,
      customerName,
      customerPhone,
      paidAmount,
      totalAmount: total,
      createdAt: new Date().toISOString(), // 🔥 important
    };

    try {
      if (!navigator.onLine) {
        // 🔥 OFFLINE SAVE
        saveOffline("orders", orderData);
        alert("Saved Offline ✅");
      } else {
        // 🔥 ONLINE SAVE
        await axios.post("http://localhost:5000/api/orders", orderData);
      }

      // 🔥 INVOICE ALWAYS GENERATE
      generateInvoice(cart, total, paymentMethod, customerName, customerPhone);

      // 🔥 RESET
      setCart([]);
      setShowInvoice(false);
    } catch (error) {
      console.log(error);
    }
  };
  //  show invoice

  // print bill
  const generateInvoice = (
    cart,
    total,
    paymentMethod,
    customerName,
    customerPhone,
  ) => {
    const doc = new jsPDF();

    // SHOP DETAILS
    doc.setFontSize(18);
    doc.text("Deep Mart", 70, 15);

    doc.setFontSize(10);
    doc.text("Address: Dhamangaon,Teh.Bhainsdehi, Dist.Betul,(M.P.)", 10, 25);
    // GST Number
    doc.text("GST No: 22ABCDE1234F1Z5", 10, 30);

    // CUSTOMER DETAILS 🔥
    doc.setFontSize(12);
    doc.text(`Customer: ${customerName || "Walk-in Customer"}`, 10, 40);

    if (customerPhone) {
      doc.text(`Phone: ${customerPhone}`, 10, 45);
    }

    // INVOICE INFO
    const date = new Date();
    const invoiceId = "INV" + Date.now();

    doc.text(`Invoice ID: ${invoiceId}`, 140, 25);
    doc.text(`Date: ${date.toLocaleString()}`, 140, 30);

    // TABLE HEADER
    let y = 60;

    doc.setFontSize(12);
    doc.text("Item", 10, y);
    doc.text("Qty", 90, y);
    doc.text("Price", 120, y);
    doc.text("Total", 160, y);
    doc.text(`Paid: ₹${paidAmount}`, 140, y);
    y += 10;

    doc.text(`Remaining: ₹${total - paidAmount}`, 140, y);
    y += 10;

    doc.text(`Status: ${status}`, 140, y);

    y += 5;
    doc.line(10, y, 200, y);

    y += 10;

    // ITEMS
    cart.forEach((item) => {
      doc.text(`${item.name} (${item.category || "General"})`, 10, y);
      doc.text(String(item.quantity), 90, y);
      doc.text(`₹${item.price}`, 120, y);
      doc.text(`₹${item.price * item.quantity}`, 160, y);

      y += 10;
    });

    // TOTAL
    doc.line(10, y, 200, y);
    y += 10;

    doc.setFontSize(14);
    doc.text(`Total: ₹${total}`, 140, y);

    y += 10;

    doc.setFontSize(12);
    doc.text(`Payment: ${paymentMethod}`, 140, y);

    // FOOTER
    doc.setFontSize(10);
    doc.text("Thank you for shopping!", 70, y + 20);

    doc.save(`invoice_${invoiceId}.pdf`);
  };

  let status = "unpaid";

  if (paidAmount === total) status = "paid";
  else if (paidAmount > 0) status = "due";

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        {/* LEFT: SEARCH + CATEGORY */}
        <div className="flex gap-3 w-full md:w-2/3">
          {/* SEARCH */}
          <div className="flex items-center bg-white border border-black-200 rounded-xl px-3 w-full shadow-sm focus-within:ring-2 focus-within:ring-gray-200">
            <span className="text-gray-400 mr-2">🔍</span>

            <input
              type="text"
              placeholder="Search products..."
              className="w-full py-2 outline-none text-gray-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* CATEGORY */}
          <select
            className="bg-white border border-black-200 rounded-xl px-3 py-2 shadow-sm cursor-pointer focus:ring-2 focus:ring-gray-200"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* RIGHT: CART BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-xl shadow-md transition-all duration-300 cursor-pointer"
          >
            🛒 Cart
            {/* Badge */}
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              {cart.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Section */}

      <div className="flex gap-4 h-[75vh]">
        {/* LEFT PRODUCTS */}
        <div className="w-full bg-white p-6 rounded-xl shadow-md border border-gray-100 overflow-y-auto">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Products</h2>

            <span className="text-sm text-gray-500">
              {filteredProducts.length} items
            </span>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((p) => (
              <div
                key={p._id}
                onClick={() => addToCart(p)}
                className="bg-white border border-black-100 p-4 rounded-xl shadow-sm cursor-pointer 
            hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* PRODUCT NAME */}
                <h3 className="font-semibold text-gray-800 group-hover:text-black">
                  {p.name}
                </h3>

                {/* CATEGORY */}
                <p className="text-xs text-black-300 mt-1">
                  {p.category || "General"}
                </p>

                {/* PRICE */}
                <div className="mt-3 flex justify-between items-center">
                  <p className="text-lg font-bold text-green-600">₹{p.price}</p>

                  {/* ADD ICON */}
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs group-hover:bg-green-200">
                    + Add
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Show Invoice */}
      {showInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[100]">
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100 w-[420px]">
            {/* HEADER */}
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
              Shop Name
            </h2>

            {/* SHOP INFO */}
            <div className="text-center mb-3 flex justify-between items-center">
              <p className="font-semibold text-lg">Deep Mart</p>
              <p className="text-sm text-black-500">Phone: 9876543210</p>
            </div>

            <hr className="my-2" />

            {/* CUSTOMER */}
            <div className="mb-3 flex justify-between items-center">
              <p className="text-sm">
                <span className="font-medium">Customer:</span>{" "}
                {customerName || "Walk-in"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Phone:</span>{" "}
                {customerPhone || "-"}
              </p>
            </div>

            <hr className="my-2" />

            {/* ITEMS */}
            <div className="space-y-2 max-h-[150px] overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.name}
                    <span className="text-xs text-gray-500 ml-1">
                      ({item.category || "General"})
                    </span>
                  </span>

                  <span className="font-medium">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <hr className="my-4" />

            {/* 💎 PREMIUM SUMMARY CARD */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">₹{total}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Paid</span>
                <span className="text-green-600 font-semibold">
                  ₹{paidAmount}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Remaining</span>
                <span className="text-red-500 font-semibold">
                  ₹{total - paidAmount}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>

                <span
                  className={`px-2 py-1 rounded text-sm font-semibold
              ${
                status === "paid"
                  ? "bg-green-100 text-green-700"
                  : status === "due"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              }
            `}
                >
                  {status.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Payment</span>
                <span className="font-medium capitalize">{paymentMethod}</span>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex justify-between mt-5">
              <button
                onClick={() => setShowInvoice(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleCheckout}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition cursor-pointer"
              >
                Confirm & Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show Cart */}

      {showCart && (
        <div
          onClick={() => setShowCart(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[95%] h-[90%] rounded-2xl shadow-2xl flex flex-col p-6"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-2xl font-bold">🛒 Cart</h2>

              <button
                onClick={() => setShowCart(false)}
                className="text-red-500 text-xl hover:scale-110 transition cursor-pointer"
              >
                ❌
              </button>
            </div>

            <div className="grid grid-cols-4 gap-6 my-4">
              {/* CUSTOMER NAME */}
              <div className="col-span-2 flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              {/* PHONE */}
              <div className="col-span-1 flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter phone"
                  className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              {/* PAID */}
              <div className="col-span-1 flex flex-col max-w-[150px/]">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  Paid Amount
                </label>
                <input
                  type="number"
                  placeholder="₹"
                  className="border p-2 rounded-md focus:ring-2 focus:ring-green-500 outline-none transition"
                  value={paidAmount === 0 ? "" : paidAmount}
                  onChange={(e) => {
                    let value = Number(e.target.value);
                    if (value < 0) value = 0;
                    setPaidAmount(Number(value));
                  }}
                />
              </div>
            </div>

            {/* ITEMS (FULL SPACE USE) */}
            <div className="flex-1 overflow-y-auto px-2">
              <div className="grid grid-cols-2 gap-4">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-white border rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition"
                  >
                    {/* TOP */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800 text-sm">
                        {item.name}
                        <span className="text-gray-500 text-xs ml-1">
                          ({item.category})
                        </span>
                      </span>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500  hover:scale-110 transition cursor-pointer"
                      >
                        ❌
                      </button>
                    </div>

                    {/* BOTTOM */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.productId, "dec")}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 rounded cursor-pointer"
                        >
                          -
                        </button>

                        <span className="font-semibold">{item.quantity}</span>

                        <button
                          onClick={() => updateQuantity(item.productId, "inc")}
                          className="bg-green-500 hover:bg-green-700 text-white px-2 rounded cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-semibold text-gray-700 text-sm">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY */}
            <div className="border-t mt-4 pt-4 flex justify-between items-center">
              <div className="space-y-1">
                <p>Total: ₹{total}</p>
                <p className="text-green-600">Paid: ₹{paidAmount}</p>
                <p className="text-red-500">Remaining: ₹{total - paidAmount}</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  className="border p-2 rounded cursor-pointer"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>

                <button
                  onClick={() => setShowInvoice(true)}
                  className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 cursor-pointer"
                >
                  Preview Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Billing;
