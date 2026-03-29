import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiList,
  FiPlusSquare,
  FiShoppingBag,
  FiUser,
  FiLogOut,
  FiArrowLeft
} from "react-icons/fi";
import axios from "axios";
import { apiUrl } from "../../config/apiBase";
import { AuthContext } from "../../components/AuthControls/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

export default function KitchenLayout({ children }) {
  const { logout } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [kitchen, setKitchen] = useState(null);

  useEffect(() => {
    const fetchKitchen = async () => {
      const token = localStorage.getItem("jwt");
      if (!token) return;

      try {
        const res = await axios.get(apiUrl("/auth/my-kitchen"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKitchen(res.data);
      } catch (err) {
        console.error("Error fetching kitchen details:", err?.response?.data || err);
      }
    };
    fetchKitchen();
  }, []);

  return (
    <div className={`min-h-screen pt-20 flex flex-col md:flex-row transition-all duration-700 ${
      isDarkMode ? "bg-[#0b0f1a] text-white" : "bg-white text-gray-900"
    }`}>
      
      {/* Sidebar - Matching Customer Dashboard */}
      <aside className={`w-full md:w-80 p-8 md:fixed md:h-full transition-all duration-500 z-40 ${
          isDarkMode ? "bg-[#161b29] border-r border-white/5" : "bg-orange-50 border-r border-orange-100"
        }`}
      >
        {/* Brand/Back Link */}
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-10 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-orange-500 transition-colors group"
        >
          <FiArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="mb-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-80">Partner Portal</h2>
            <h1 className="text-2xl font-black tracking-tighter mt-1">
              {kitchen?.kitchenName ? kitchen.kitchenName.toUpperCase() : "KITCHEN"}
            </h1>
            <div className="h-1.5 w-12 bg-orange-500 mt-3 rounded-full"></div>
        </div>

        <nav className="space-y-3">
          <SidebarButton
            icon={<FiHome size={20} />}
            label="Dashboard"
            isActive={location.pathname === "/kitchen/dashboard"}
            onClick={() => navigate("/kitchen/dashboard")}
            isDarkMode={isDarkMode}
          />
          <SidebarButton
            icon={<FiShoppingBag size={20} />}
            label="Orders"
            isActive={location.pathname === "/kitchen/orders"}
            onClick={() => navigate("/kitchen/orders")}
            isDarkMode={isDarkMode}
          />
          <SidebarButton
            icon={<FiList size={20} />}
            label="Manage Menu"
            isActive={location.pathname === "/kitchen/manage-menu"}
            onClick={() => navigate("/kitchen/manage-menu")}
            isDarkMode={isDarkMode}
          />
          <SidebarButton
            icon={<FiPlusSquare size={20} />}
            label="Add New Dish"
            isActive={location.pathname === "/kitchen/add-dish"}
            onClick={() => navigate("/kitchen/add-dish")}
            isDarkMode={isDarkMode}
          />
          <SidebarButton
            icon={<FiUser size={20} />}
            label="Profile"
            isActive={location.pathname === "/kitchen/profile"}
            onClick={() => navigate("/kitchen/profile")}
            isDarkMode={isDarkMode}
          />

          <div className="pt-12 border-t border-gray-500/10 mt-6">
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all duration-300"
            >
              <FiLogOut size={20} /> Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-80 p-6 md:p-12 min-h-screen">
        <div className={`h-full min-h-[85vh] rounded-[3.5rem] p-8 md:p-12 ${
          isDarkMode ? "bg-[#161b29]/40 border border-white/5" : "bg-gray-50 border border-orange-100/50"
        }`}>
            {children}
        </div>
      </main>
    </div>
  );
}

// Optimized Sidebar Button component
function SidebarButton({ icon, label, onClick, isActive, isDarkMode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
        isActive
          ? "bg-orange-500 text-white shadow-xl shadow-orange-500/20 translate-x-2"
          : isDarkMode 
            ? "text-gray-400 hover:text-white hover:bg-white/5" 
            : "text-gray-600 hover:bg-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}


