import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHome,
  FiList,
  FiPlusSquare,
  FiShoppingBag,
  FiLogOut,
  FiTruck,
  FiArrowLeft,
} from "react-icons/fi";
import { AuthContext } from "../../components/AuthControls/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

export default function AdminLayout({ children }) {
  const { logout } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className={`min-h-screen pt-20 flex flex-col md:flex-row transition-all duration-700 ${
        isDarkMode ? "bg-[#0b0f1a] text-white" : "bg-white text-gray-900"
      }`}
    >
      <aside
        className={`w-full md:w-80 p-8 md:fixed md:h-full transition-all duration-500 z-40 ${
          isDarkMode
            ? "bg-[#161b29] border-r border-white/5"
            : "bg-indigo-50/30 border-r border-indigo-100"
        }`}
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-10 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-500 transition-colors group"
        >
          <FiArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Site
        </button>

        <div className="mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 opacity-80">
            Admin Console
          </h2>
          <h1 className="text-2xl font-black tracking-tighter mt-1">CLOUDBITE</h1>
          <div className="h-1.5 w-12 bg-indigo-500 mt-3 rounded-full" />
        </div>

        <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)] no-scrollbar">
          <AdminSidebarButton
            icon={<FiHome size={20} />}
            label="Dashboard"
            isActive={location.pathname === "/admin/dashboard"}
            onClick={() => navigate("/admin/dashboard")}
            isDarkMode={isDarkMode}
          />
          <AdminSidebarButton
            icon={<FiPlusSquare size={20} />}
            label="Register Kitchen"
            isActive={location.pathname === "/admin/register-kitchen"}
            onClick={() => navigate("/admin/register-kitchen")}
            isDarkMode={isDarkMode}
          />
          <AdminSidebarButton
            icon={<FiList size={20} />}
            label="Manage Kitchens"
            isActive={location.pathname === "/admin/kitchens"}
            onClick={() => navigate("/admin/kitchens")}
            isDarkMode={isDarkMode}
          />
          <AdminSidebarButton
            icon={<FiShoppingBag size={20} />}
            label="Orders"
            isActive={location.pathname === "/admin/orders"}
            onClick={() => navigate("/admin/orders")}
            isDarkMode={isDarkMode}
          />
          <AdminSidebarButton
            icon={<FiTruck size={20} />}
            label="Add Delivery Partner"
            isActive={location.pathname === "/admin/register-delivery-partner"}
            onClick={() => navigate("/admin/register-delivery-partner")}
            isDarkMode={isDarkMode}
          />
          <AdminSidebarButton
            icon={<FiTruck size={20} />}
            label="Manage Partners"
            isActive={location.pathname === "/admin/delivery-partners"}
            onClick={() => navigate("/admin/delivery-partners")}
            isDarkMode={isDarkMode}
          />

          <div className="pt-8 border-t border-gray-500/10 mt-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all duration-300"
            >
              <FiLogOut size={20} /> Logout
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 md:ml-80 p-6 md:p-12 min-h-screen">
        <div
          className={`h-full min-h-[85vh] rounded-[3.5rem] p-8 md:p-12 ${
            isDarkMode
              ? "bg-[#161b29]/40 border border-white/5"
              : "bg-gray-50 border border-indigo-100/30"
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}

function AdminSidebarButton({ icon, label, onClick, isActive, isDarkMode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${
        isActive
          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-2"
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
