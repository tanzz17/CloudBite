/* src/pages/Customer/CustomerRegister.jsx */
import React, { useState, useContext } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../../components/AuthControls/AuthContext";
import { Link } from "react-router-dom";
import { registerCustomer } from "../../Api/api";

export default function CustomerRegister() {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await registerCustomer({
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
      });
      login(data);
      toast.success("Registration Successful!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded-lg">
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account? <Link to="/login" className="text-orange-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
