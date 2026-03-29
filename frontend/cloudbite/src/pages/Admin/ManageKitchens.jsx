import React, { useEffect, useState, useContext } from "react";
import api from "../../Api/api";
import { FiActivity, FiMapPin, FiUser, FiMail, FiServer } from "react-icons/fi";
import DeleteKitchen from "./DeleteKitchen";
import AdminLayout from "./AdminLayout";
import { ThemeContext } from "../../context/ThemeContext";
import toast from "react-hot-toast";

const ManageKitchens = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchKitchens = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth/admin/kitchens");
      setKitchens(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching kitchens:", error);
      toast.error("Failed to fetch kitchens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchens();
  }, []);

  const handleDeleteSuccess = (deletedId) => {
    setKitchens((prev) => prev.filter((k) => k.id !== deletedId));
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-3">
              <FiServer className="text-indigo-500" />
              Manage <span className="text-indigo-500">Kitchens</span>
            </h2>
            <p className="text-sm font-bold uppercase tracking-widest opacity-60">
              Fleet overview and partner moderation
            </p>
          </div>
          <div
            className={`px-6 py-3 rounded-2xl border font-black text-xs uppercase tracking-widest ${
              isDarkMode ? "bg-white/5 border-white/10" : "bg-indigo-50 border-indigo-100 text-indigo-600"
            }`}
          >
            Total Kitchens: {kitchens.length}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
              Fetching Database...
            </p>
          </div>
        ) : kitchens.length === 0 ? (
          <div
            className={`text-center py-20 rounded-[3rem] border-2 border-dashed ${
              isDarkMode ? "border-white/5" : "border-gray-200"
            }`}
          >
            <p className="text-gray-500 font-bold uppercase tracking-widest">No kitchens found</p>
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
                    <th className="py-6 px-8">Kitchen / ID</th>
                    <th className="py-6 px-6">Location</th>
                    <th className="py-6 px-6">Owner Details</th>
                    <th className="py-6 px-6 text-center">Status</th>
                    <th className="py-6 px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-50"}`}>
                  {kitchens.map((kitchen) => (
                    <tr key={kitchen.id} className="group hover:bg-indigo-500/[0.02] transition-colors">
                      <td className="py-6 px-8">
                        <div>
                          <div className="font-black text-sm uppercase tracking-tight">{kitchen.name}</div>
                          <div className="text-[10px] opacity-40 font-bold uppercase tracking-tighter mt-1">
                            ID: #{String(kitchen.id).toUpperCase().slice(-6)}
                          </div>
                        </div>
                      </td>

                      <td className="py-6 px-6">
                        <div className="flex items-start gap-2 max-w-[200px]">
                          <FiMapPin className="mt-1 text-indigo-500 shrink-0" size={14} />
                          <span className="text-xs font-medium leading-relaxed opacity-70">
                            {kitchen.address || "No address provided"}
                          </span>
                        </div>
                      </td>

                      <td className="py-6 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-tight">
                            <FiUser size={12} className="text-indigo-500" /> {kitchen.ownerName || "N/A"}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] opacity-50 italic">
                            <FiMail size={12} /> {kitchen.ownerEmail || "N/A"}
                          </div>
                        </div>
                      </td>

                      <td className="py-6 px-6 text-center">
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            kitchen.open
                              ? "bg-green-500/10 text-green-500 border border-green-500/20"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}
                        >
                          <FiActivity className={kitchen.open ? "animate-pulse" : ""} />
                          {kitchen.open ? "Live" : "Closed"}
                        </div>
                      </td>

                      <td className="py-6 px-8 text-right">
                        <DeleteKitchen
                          kitchenId={kitchen.id}
                          kitchenName={kitchen.name}
                          onDeleteSuccess={handleDeleteSuccess}
                        />
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

export default ManageKitchens;
