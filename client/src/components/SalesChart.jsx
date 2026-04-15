import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function SalesChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get("http://localhost:5000/api/dashboard/sales");

    const formatted = (res.data || []).map((item) => ({
      date: item._id,
      sales: item.totalSales,
    }));

    setData(formatted);
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-xl hover:shadow-2xl">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <h2 className="text-lg font-semibold text-gray-800">
          📈 Sales Analytics
        </h2>

        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
          Overview
        </span>
      </div>

      {/* CHART */}
      <div className="w-full overflow-x-auto">
        <LineChart width={600} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6b7280" />

          <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />

          <Tooltip contentStyle={{ borderRadius: "10px", border: "none" }} />

          <Line
            type="monotone"
            dataKey="sales"
            stroke="#7c3aed"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </div>
    </div>
  );
}

export default SalesChart;
