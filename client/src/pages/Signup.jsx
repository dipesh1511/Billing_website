import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("Signup successful");
      navigate("/");
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
          ✨ Create Account
        </h2>

        {/* NAME */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-600 mb-1 block">
            Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-black-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
            onChange={handleChange}
          />
        </div>

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
            autoComplete="new-email"
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
            placeholder="Create a password"
            className="w-full px-4 py-2 border border-black-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
            autoComplete="new-password"
            onChange={handleChange}
          />
        </div>

        {/* BUTTON */}
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-md shadow-md transition cursor-pointer">
          Signup
        </button>

        {/* FOOTER */}
        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
