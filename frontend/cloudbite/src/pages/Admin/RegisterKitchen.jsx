import toast from "react-hot-toast";
import React, { useState, useContext } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../Api/api";
import { ThemeContext } from "../../context/ThemeContext";
import { FiUser, FiMail, FiLock, FiHome, FiMapPin, FiPlusCircle } from "react-icons/fi";

const getErrorMessage = (err) => {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (status === 403) {
    return "Access denied (403). Please login with an admin account and try again.";
  }

  if (typeof data === "string") return data;
  if (data?.message) return data.message;
  if (data?.error) return data.error;

  return "Something went wrong";
};

export default function RegisterKitchen() {
  const { isDarkMode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    kitchenName: "",
    kitchenAddress: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("jwt");
    if (!token) {
      toast.error("Admin login required");
      return;
    }

    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      kitchenName: formData.kitchenName.trim(),
      kitchenAddress: formData.kitchenAddress.trim(),
    };

    setLoading(true);

    try {
      const res = await api.post("/auth/admin/register-kitchen", payload);

      toast.success(res.data?.message || "Kitchen registered successfully!");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        kitchenName: "",
        kitchenAddress: "",
      });
    } catch (err) {
      console.error("Registration Error:", err);
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClass = `w-full pl-12 pr-4 py-4 rounded-2xl border transition-all duration-300 outline-none font-medium ${
    isDarkMode
      ? "bg-[#1c2233] border-white/10 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
      : "bg-white border-gray-200 text-gray-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
  }`;

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-4xl font-black tracking-tighter mb-2">
            Register New <span className="text-indigo-500">Kitchen</span>
          </h2>
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">
            Setup cloud kitchen credentials and location details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group md:col-span-2">
            <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              name="kitchenName"
              placeholder="Cloud Kitchen Name (e.g., Spicy Delights)"
              required
              value={formData.kitchenName}
              onChange={handleChange}
              className={inputBaseClass}
            />
          </div>

          <div className="relative group">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              name="fullName"
              placeholder="Owner's Full Name"
              required
              value={formData.fullName}
              onChange={handleChange}
              className={inputBaseClass}
            />
          </div>

          <div className="relative group">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Owner's Email Address"
              required
              value={formData.email}
              onChange={handleChange}
              className={inputBaseClass}
            />
          </div>

          <div className="relative group md:col-span-2">
            <FiMapPin className="absolute left-4 top-6 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <textarea
              name="kitchenAddress"
              placeholder="Complete Kitchen Address"
              required
              rows="3"
              value={formData.kitchenAddress}
              onChange={handleChange}
              className={`${inputBaseClass} pl-12 pt-5 resize-none`}
            />
          </div>

          <div className="relative group md:col-span-2">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="password"
              name="password"
              placeholder="Assign Account Password"
              required
              value={formData.password}
              onChange={handleChange}
              className={inputBaseClass}
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center justify-center gap-3 w-full md:w-auto px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/20 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <FiPlusCircle size={18} />
                  <span>Register Kitchen</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
