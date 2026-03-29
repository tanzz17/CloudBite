import React, { useState, useContext } from "react";
import { User, ShoppingBag, Heart, LogOut, ArrowLeft } from "lucide-react"; 
import CustomerInfo from "./CustomerInfo";
import CustomerOrders from "./CustomerOrders"; 
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../components/AuthControls/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CustomerProfile() {
  // Local state manages the "current view" without changing the URL
  const [activeSection, setActiveSection] = useState("welcome");
  const { isDarkMode } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return <CustomerInfo />;
      case "orders":
        return <CustomerOrders />;
      case "wishlist":
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Heart size={80} className="text-orange-500 opacity-20 mb-6" />
            <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-2">My Favourites</h3>
            <p className="text-gray-500 font-medium max-w-xs">
              Your top-rated cloud kitchen dishes will appear here. ❤️
            </p>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
             <div className="w-24 h-24 bg-orange-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl rotate-3">
                <User size={48} className="text-white -rotate-3" />
             </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 italic leading-none">
              WELCOME TO <br /> THE <span className="text-orange-500">TRIBE.</span>
            </h1>
            <p className={`text-lg max-w-md leading-relaxed font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              Manage your profile, track your local orders, and enjoy exclusive cloud kitchen flavors.
            </p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen pt-20 flex flex-col md:flex-row transition-all duration-700 ${
        isDarkMode ? "bg-[#0b0f1a] text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Sidebar - Remains constant and fixed */}
      <aside className={`w-full md:w-80 p-8 md:fixed md:h-full transition-all duration-500 z-40 ${
          isDarkMode ? "bg-[#161b29] border-r border-white/5" : "bg-orange-50 border-r border-orange-100"
        }`}
      >
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-10 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-orange-500 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="mb-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-80">Customer Panel</h2>
            <h1 className="text-2xl font-black tracking-tighter mt-1">DASHBOARD</h1>
            <div className="h-1.5 w-12 bg-orange-500 mt-3 rounded-full"></div>
        </div>

        <nav className="space-y-3">
          <button
            onClick={() => setActiveSection("account")}
            className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
              activeSection === "account"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/20 translate-x-2"
                : isDarkMode ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:bg-white"
            }`}
          >
            <User size={20} /> My Account
          </button>

          <button
            onClick={() => setActiveSection("orders")}
            className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
              activeSection === "orders"
                ? "bg-orange-500 text-white shadow-xl translate-x-2"
                : isDarkMode ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:bg-white"
            }`}
          >
            <ShoppingBag size={20} /> My Orders
          </button>

          <button
            onClick={() => setActiveSection("wishlist")}
            className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 ${
              activeSection === "wishlist"
                ? "bg-orange-500 text-white shadow-xl shadow-orange-500/20 translate-x-2"
                : isDarkMode ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:bg-white"
            }`}
          >
            <Heart size={20} /> Favourites
          </button>

          <div className="pt-12 border-t border-gray-500/10 mt-6">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all duration-300"
              >
                <LogOut size={20} /> Logout
              </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-80 p-6 md:p-12 min-h-screen">
        <div className={`h-full min-h-[85vh] rounded-[3.5rem] p-8 md:p-12 ${
          isDarkMode ? "bg-[#161b29]/40 border border-white/5" : "bg-gray-50 border border-orange-100/50"
        }`}>
            {renderSection()}
        </div>
      </main>
    </div>
  );
}