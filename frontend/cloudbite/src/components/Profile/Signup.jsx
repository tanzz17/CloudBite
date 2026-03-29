// src/components/Signup.jsx
import React, { useState } from "react";
import api from "../../Api/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password } = formData;
    if (!fullName || !email || !password) {
      toast.error("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Register the user (Customer by default)
      const res = await api.post("/auth/signup", {
        fullName,
        email,
        password,
      });

      const data = res.data;

      // 2️⃣ Save auth data
      localStorage.setItem("jwtToken", data.jwtToken);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userEmail", email);

      toast.success("Signup successful!");

      // 3️⃣ Redirect based on role (here customer)
      if (data.role === "ROLE_ADMIN") navigate("/admin/dashboard");
      else if (data.role === "ROLE_KITCHEN_OWNER") navigate("/owner/dashboard");
      else navigate("/");

    } catch (err) {
      console.error("Signup error:", err);
      toast.error(err.response?.data?.message || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white shadow-md rounded-2xl p-6">
      <h2 className="text-2xl font-semibold text-center mb-4">Create an Account</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="border rounded-lg p-2"
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
          className="border rounded-lg p-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Create Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="border rounded-lg p-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center mt-4 text-sm">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-orange-500 cursor-pointer hover:underline"
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default Signup;
