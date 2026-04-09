import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getOffline, clearOffline } from "../utils/offline";
import axios from "axios";

function Layout({ children }) {
  const [dark, setDark] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  });

  useEffect(() => {
    const syncData = async () => {
      const orders = getOffline("orders");

      for (let o of orders) {
        await axios.post("http://localhost:5000/api/orders", o);
      }

      clearOffline("orders");

      const products = getOffline("products");

      for (let p of products) {
        await axios.post("http://localhost:5000/api/products", p);
      }

      clearOffline("products");
    };

    window.addEventListener("online", syncData);

    return () => window.removeEventListener("online", syncData);
  }, []);

  // 🔥 active link style
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-yellow-400 border-b-2 border-yellow-400 pb-1"
      : "hover:text-yellow-400 transition";

  return (
    // <div className="min-h-screen bg-gray-100">
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        {/* LOGO */}
        <h2 className="text-xl font-bold tracking-wide">💼 Billing System</h2>

        {/* MODE */}
        <div
          className={`text-center text-sm py-1 rounded-xl 
              ${isOnline ? "" : ""} text-white`}
        >
          {isOnline ? "Online" : "Offline Mode"}
        </div>

        {/* MENU */}
        <ul className="flex items-center space-x-6 text-sm font-medium">
          <li>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink to="/products" className={linkClass}>
              Products
            </NavLink>
          </li>

          <li>
            <NavLink to="/billing" className={linkClass}>
              Billing
            </NavLink>
          </li>

          <li>
            <NavLink to="/reports" className={linkClass}>
              Reports
            </NavLink>
          </li>

          {/* LOGOUT */}
          <li>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-1.5 rounded-md hover:from-red-600 hover:to-red-700 transition cursor-pointer"
            >
              Logout
            </button>
          </li>
          <li>
            <button
              onClick={() => setDark(!dark)}
              className="cursor-pointer px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black"
            >
              {dark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-6">{children}</div>
    </div>
  );
}

export default Layout;
