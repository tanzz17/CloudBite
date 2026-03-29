/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiClock, FiUser, FiLogOut, FiActivity } from "react-icons/fi";
import { useAuth } from "../../components/AuthControls/AuthContext";
import { getMyDeliveryProfile, goOnline, goOffline } from "../../Api/deliveryApi";
import { ThemeContext } from "../../context/ThemeContext"; // Assuming you use the same context
import toast from "react-hot-toast";

const DeliverySidebar = () => {
  const { logout } = useAuth();
  const { isDarkMode } = useContext(ThemeContext);
  const [status, setStatus] = useState("OFFLINE");
  const [partnerName, setPartnerName] = useState("Partner");

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await getMyDeliveryProfile();
      setStatus(res.data.status);
      setPartnerName(res.data.user.fullName);
    } catch (err) {
      console.error("Profile fetch failed");
    }
  };

  const toggleStatus = async () => {
    try {
      if (status === "OFFLINE") {
        await goOnline();
        setStatus("AVAILABLE");
        toast.success("You are now receiving orders!");
      } else {
        await goOffline();
        setStatus("OFFLINE");
        toast.success("Shift ended successfully");
      }
    } catch (err) {
      toast.error(err.response?.data || "Failed to change status");
    }
  };

  const isLive = status === "AVAILABLE" || status === "BUSY";

  return (
    <div className={`w-72 h-full flex flex-col transition-colors duration-500 border-r ${
      isDarkMode ? "bg-[#0f172a] border-white/5" : "bg-white border-gray-100"
    }`}>
      
      {/* Rider Identity Card */}
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl italic shadow-lg ${
              isLive ? "bg-orange-500 shadow-orange-500/20" : "bg-gray-400"
            }`}>
              {partnerName.charAt(0)}
            </div>
            {isLive && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
              </span>
            )}
          </div>
          <div>
            <p className={`text-sm font-black tracking-tight leading-none ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {partnerName}
            </p>
            <p className="text-[9px] text-orange-500 font-black mt-1 tracking-[0.2em] uppercase">Fleet Captain</p>
          </div>
        </div>

        {/* Status Toggle Button */}
        <button
          onClick={toggleStatus}
          className={`w-full py-4 rounded-2xl font-black text-[10px] tracking-[0.15em] transition-all duration-300 border flex items-center justify-center gap-3 ${
            isLive 
              ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20" 
              : isDarkMode 
                ? "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10" 
                : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
          {status === "OFFLINE" ? "GO ONLINE" : status.toUpperCase()}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-2">
        <SidebarLink to="/delivery/dashboard" icon={<FiHome size={18}/>} label="Overview" end isDark={isDarkMode} />
        <SidebarLink to="active-orders" icon={<FiActivity size={18}/>} label="Active Orders" isDark={isDarkMode} />
        <SidebarLink to="history" icon={<FiClock size={18}/>} label="History" isDark={isDarkMode} />
        <SidebarLink to="profile" icon={<FiUser size={18}/>} label="Settings" isDark={isDarkMode} />
      </nav>

      {/* Logout Footer */}
      <div className="p-6">
        <button
          onClick={logout}
          className={`w-full flex items-center justify-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all  ${
            isDarkMode 
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" 
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
        >
          <FiLogOut size={16} /> Logout Shift
        </button>
      </div>
    </div>
  );
};

// Sub-component for clean NavLinks
const SidebarLink = ({ to, icon, label, end = false, isDark }) => (
  <NavLink 
    to={to} 
    end={end}
    className={({ isActive }) => `
      flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300
      ${isActive 
        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]" 
        : isDark 
          ? "text-gray-400 hover:bg-white/5 hover:text-white" 
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }
    `}
  >
    {icon} {label}
  </NavLink>
);

export default DeliverySidebar;