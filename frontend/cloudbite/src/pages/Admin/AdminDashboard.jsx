/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../components/AuthControls/AuthContext";
import AdminLayout from "./AdminLayout";
import { ThemeContext } from "../../context/ThemeContext";
import api from "../../Api/api";
import {
  FiShoppingBag,
  FiTruck,
  FiTrendingUp,
  FiActivity,
  FiMapPin,
  FiRefreshCw,
  FiLifeBuoy,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalKitchens: 0,
    activePartners: 0,
    totalOrders: 0,
    revenue: 0,
  });

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/dashboard/stats");
      setStats(res.data || {});
    } catch (_err) {
      toast.error("Failed to fetch dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const statCards = [
    {
      label: "Total Kitchens",
      value: stats.totalKitchens ?? 0,
      icon: <FiMapPin />,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Active Fleet",
      value: stats.activePartners ?? 0,
      icon: <FiTruck />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders ?? 0,
      icon: <FiShoppingBag />,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Revenue",
      value: `₹${Number(stats.revenue ?? 0).toLocaleString("en-IN")}`,
      icon: <FiTrendingUp />,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  const firstName = user?.fullName?.split(" ")[0] || "Admin";

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-3">
              Welcome back, <span className="text-indigo-500">{firstName}</span>
            </h1>
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
              <FiActivity
                className={`${loading ? "animate-pulse" : ""} text-indigo-500`}
              />
              {loading
                ? "Syncing Platform Records..."
                : "Platform Overview & Control Center"}
            </p>
          </div>

          <button
            onClick={fetchDashboardStats}
            className={`p-4 rounded-2xl transition-all active:scale-95 ${
              isDarkMode
                ? "bg-white/5 hover:bg-white/10"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-[2.5rem] border group transition-all duration-500 hover:translate-y-[-4px] ${
                isDarkMode
                  ? "bg-[#1c2233] border-white/5 shadow-2xl shadow-black/20"
                  : "bg-white border-gray-100 shadow-xl shadow-indigo-500/5"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center text-2xl mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6`}
              >
                {card.icon}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">
                {card.label}
              </p>
              <h3 className="text-3xl font-black tracking-tight italic">
                {loading ? "---" : card.value}
              </h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div
            className={`lg:col-span-2 p-10 rounded-[3rem] border ${
              isDarkMode ? "bg-[#161b29]/50 border-white/5" : "bg-white border-gray-100"
            }`}
          >
            <h4 className="text-xl font-black tracking-tight mb-6">Live Platform Activity</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      loading ? "bg-amber-500 animate-ping" : "bg-green-500"
                    }`}
                  />
                  <p className="text-sm font-medium opacity-80">
                    {loading
                      ? "Establishing handshake with backend..."
                      : "All services operational. Database nodes synced."}
                  </p>
                </div>
                <span className="text-[10px] font-black opacity-30 uppercase">
                  {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`p-10 rounded-[3rem] border flex flex-col justify-center items-center text-center ${
              isDarkMode ? "bg-indigo-600/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-100"
            }`}
          >
            <FiLifeBuoy className="text-4xl text-indigo-500 mb-4" />
            <h4 className="font-black uppercase tracking-widest text-xs mb-2">Platform Support</h4>
            <p className="text-sm opacity-70 mb-6 font-medium">
              Encountering issues with kitchen onboarding or payments?
            </p>
            <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
              Contact Tech Team
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
