/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from "react";
import api from "../../Api/api";
import AdminLayout from "./AdminLayout";
import { ThemeContext } from "../../context/ThemeContext";
import {
  FiTruck,
  FiTrash2,
  FiPhone,
  FiActivity,
  FiPower,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";

const ManageDeliveryPartners = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/delivery-partners");
      setPartners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load delivery partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const forceOffline = async (id) => {
    try {
      await api.put(`/admin/delivery-partners/${id}/offline`);
      toast.success("Partner pushed offline");
      fetchPartners();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    }
  };

  const deletePartner = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name || "this partner"}?`)) return;

    try {
      await api.delete(`/admin/delivery-partners/${id}`);
      toast.success("Partner deleted successfully");
      fetchPartners();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete partner");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-3">
              <FiTruck className="text-indigo-500" />
              Delivery <span className="text-indigo-500">Fleet</span>
            </h2>
            <p className="text-sm font-bold uppercase tracking-widest opacity-60">
              Real-time partner monitoring and management
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`px-6 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-[0.2em] ${
                isDarkMode
                  ? "bg-white/5 border-white/10 text-gray-400"
                  : "bg-indigo-50 border-indigo-100 text-indigo-600"
              }`}
            >
              Fleet Size: {partners.length}
            </div>
            <button
              onClick={fetchPartners}
              className="p-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
              Syncing Logistics...
            </p>
          </div>
        ) : partners.length === 0 ? (
          <div
            className={`text-center py-20 rounded-[3rem] border-2 border-dashed ${
              isDarkMode ? "border-white/5" : "border-gray-200"
            }`}
          >
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
              No active partners found
            </p>
          </div>
        ) : (
          <div
            className={`overflow-hidden rounded-[2.5rem] border ${
              isDarkMode ? "border-white/5 bg-[#161b29]/20" : "border-gray-100 bg-white"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`uppercase text-[10px] tracking-[0.2em] font-black ${
                      isDarkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    <th className="py-6 px-8">Partner Information</th>
                    <th className="py-6 px-6">Vehicle</th>
                    <th className="py-6 px-6">Contact</th>
                    <th className="py-6 px-6 text-center">Status</th>
                    <th className="py-6 px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-50"}`}>
                  {partners.map((p) => (
                    <tr key={p.id} className="group hover:bg-indigo-500/[0.02] transition-colors">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                              isDarkMode
                                ? "bg-indigo-500/10 text-indigo-400"
                                : "bg-indigo-50 text-indigo-600"
                            }`}
                          >
                            {p.user?.fullName?.charAt(0) || "P"}
                          </div>
                          <div>
                            <div className="font-black text-sm uppercase tracking-tight">
                              {p.user?.fullName || "Unnamed Partner"}
                            </div>
                            <div className="text-[10px] opacity-40 font-bold uppercase tracking-tighter">
                              UID: #{String(p.id).toUpperCase().slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-6 px-6">
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                            isDarkMode
                              ? "bg-white/5 border-white/5 text-gray-400"
                              : "bg-gray-50 border-gray-100 text-gray-600"
                          }`}
                        >
                          {p.vehicleType || "Standard"}
                        </span>
                      </td>

                      <td className="py-6 px-6">
                        <div className="flex items-center gap-2 text-xs font-bold tracking-tight opacity-70">
                          <FiPhone size={12} className="text-indigo-500" />
                          {p.phone || "N/A"}
                        </div>
                      </td>

                      <td className="py-6 px-6 text-center">
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            p.status === "ONLINE"
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : "bg-gray-500/10 text-gray-500 border border-gray-500/20"
                          }`}
                        >
                          <FiActivity className={p.status === "ONLINE" ? "animate-pulse" : ""} />
                          {p.status}
                        </div>
                      </td>

                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === "ONLINE" && (
                            <button
                              onClick={() => forceOffline(p.id)}
                              title="Force Offline"
                              className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                            >
                              <FiPower size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deletePartner(p.id, p.user?.fullName)}
                            className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-all duration-300"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageDeliveryPartners;
