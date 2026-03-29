import React, { useState } from "react";
import api from "../../Api/api";
import toast from "react-hot-toast";
import { useAuth } from "../../components/AuthControls/AuthContext";

const Login = () => {
  const { login } = useAuth(); // ✅ USE CONTEXT

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return toast.error("All fields are required");
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/signin", formData);

      // ✅ ONLY THIS
      login(res.data);

    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={handleChange}
          className="border rounded-lg p-2"
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData.password}
          onChange={handleChange}
          className="border rounded-lg p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
