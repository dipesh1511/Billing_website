import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form,
      );

      // ✅ IMPORTANT CHANGE
      login(res.data.token);

      navigate("/dashboard");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-96 border border-gray-200"
      >
        {/* TITLE */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          🔐 Login
        </h2>

        {/* EMAIL */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-600 mb-1 block">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-black-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
            autoComplete="current-email"
            onChange={handleChange}
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-600 mb-1 block">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2 border border-black-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
            autoComplete="current-password"
            onChange={handleChange}
          />
        </div>

        {/* BUTTON */}
        <button className="w-full bg-gradient-to-r cursor-pointer from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 rounded-md shadow-md transition">
          Login
        </button>

        {/* FOOTER */}
        <p className="mt-5 text-center text-sm text-gray-600">
          No account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-medium hover:underline"
          >
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
