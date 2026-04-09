import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import StatsCard from "../components/StatsCard";
import LowStockList from "../components/LowStockList";
import RecentOrders from "../components/RecentOrders";
import SalesChart from "../components/SalesChart";

function Dashboard() {
  const [stats, setStats] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dashboardData, setDashboardData] = useState({
    dailyData: {},
    monthlyData: {},
    topProducts: [],
  });

  useEffect(() => {
    fetchDashboard();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get("http://localhost:5000/api/dashboard");
    setStats(res.data);
  };

  const fetchDashboard = async () => {
    const res = await axios.get("http://localhost:5000/api/orders/dashboard");

    setDashboardData(res.data);
  };

  // 🔥 FORMAT FIX
  const formatDateKey = (date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  const formatMonthKey = (date) => {
    const d = new Date(date + "-01");
    return `${d.getFullYear()}-${d.getMonth() + 1}`;
  };

  // 🔥 TOTALS
  const weekSales = Object.values(dashboardData.dailyData || {}).reduce(
    (a, b) => a + b,
    0,
  );

  const last7MonthSales = Object.values(dashboardData.monthlyData || {}).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <Layout>
      {/* Stats */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-black-100">
          <p className="text-sm text-gray-500">Products</p>
          <h2 className="text-2xl font-bold text-gray-800">
            {stats.totalProducts || 0}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-black-100">
          <p className="text-sm text-gray-500">Orders</p>
          <h2 className="text-2xl font-bold text-gray-800">
            {stats.totalOrders || 0}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-black-100">
          <p className="text-sm text-gray-500">Sales</p>
          <h2 className="text-2xl font-bold text-green-600">
            ₹{stats.totalSales || 0}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-black-100">
          <p className="text-sm text-gray-500">Low Stock</p>
          <h2 className="text-2xl font-bold text-red-500">
            {stats.lowStock || 0}
          </h2>
        </div>
      </div>

      {/* Sales */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* DAILY */}
        <div className="bg-white border border-black rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Daily Revenue</h3>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="cursor-pointer border border-blue-400 text-sm px-2 py-1 rounded"
            />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            ₹
            {selectedDate
              ? dashboardData.dailyData?.[formatDateKey(selectedDate)] || 0
              : weekSales}
          </h2>

          {!selectedDate && (
            <div className="space-y-1 text-sm">
              {Object.entries(dashboardData.dailyData || {}).map(([d, v]) => (
                <div key={d} className="flex justify-between text-gray-600">
                  <span>{d}</span>
                  <span>₹{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MONTHLY */}
        <div className="bg-white border border-black rounded-lg shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">
              Monthly Revenue
            </h3>

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="cursor-pointer border border-blue-400 text-sm px-2 py-1 rounded"
            />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            ₹
            {selectedMonth
              ? dashboardData.monthlyData?.[formatMonthKey(selectedMonth)] || 0
              : last7MonthSales}
          </h2>

          {!selectedMonth && (
            <div className="space-y-1 text-sm">
              {Object.entries(dashboardData.monthlyData || {}).map(([m, v]) => (
                <div key={m} className="flex justify-between text-gray-600">
                  <span>{m}</span>
                  <span>₹{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOP PRODUCTS */}
        <div className="bg-white border border-black rounded-lg shadow-sm p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Top Products
          </h3>

          <div className="space-y-2">
            {dashboardData.topProducts.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm border-b last:border-none pb-1"
              >
                <span className="text-gray-800">{p[0]}</span>

                <span className="text-gray-600 font-medium">{p[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}

      <div className="grid grid-cols-2 gap-6">
        <LowStockList />
        <RecentOrders />
      </div>

      <div className="mt-6">
        <SalesChart />
      </div>
    </Layout>
  );
}

export default Dashboard;
