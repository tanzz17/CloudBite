import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import api from "../../Api/api";
import { ThemeContext } from "../../context/ThemeContext";
import { FiUser, FiMail, FiLock, FiPhone, FiTruck, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function RegisterDeliveryPartner() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    vehicleType: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await api.post("/admin/register-delivery-partner", formData);
      setStatus({ type: "success", message: "Delivery partner registered successfully!" });
      setTimeout(() => navigate("/admin/delivery-partners"), 2000);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        "Failed to register delivery partner";
      setStatus({ type: "error", message });
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
            Onboard <span className="text-indigo-500">Partner</span>
          </h2>
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">
            Add a new delivery professional to the fleet
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={handleChange}
              className={inputBaseClass}
            />
          </div>

          <div className="relative group">
            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              required
              value={formData.email}
              onChange={handleChange}
              className={inputBaseClass}
            />
          </div>

          <div className="relative group">
            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              required
              value={formData.phone}
              onChange={handleChange}
              className={inputBaseClass}
            />
          </div>

          <div className="relative group">
            <FiTruck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <select
              name="vehicleType"
              required
              value={formData.vehicleType}
              onChange={handleChange}
              className={`${inputBaseClass} appearance-none`}
            >
              <option value="" disabled>
                Select Vehicle Type
              </option>
              <option value="Bike">Bike</option>
              <option value="Scooter">Scooter</option>
              <option value="Cycle">Cycle</option>
            </select>
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

          <div className="md:col-span-2 mt-4 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-600/20 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Registering..." : "Confirm Registration"}
            </button>

            {status.message && (
              <div
                className={`flex items-center gap-3 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2 ${
                  status.type === "success"
                    ? "bg-green-500/10 text-green-500 border border-green-500/20"
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {status.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
                <p className="text-sm font-bold uppercase tracking-wider">{status.message}</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
