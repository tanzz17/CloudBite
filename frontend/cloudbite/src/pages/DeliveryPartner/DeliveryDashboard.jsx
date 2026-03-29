import React, { useContext } from "react";
import { FiZap } from "react-icons/fi";
import { ThemeContext } from "../../context/ThemeContext";

export default function DeliveryDashboard() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div className="h-[80vh] flex flex-col justify-center max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Centered Minimal Content */}
      <div className={`p-12 rounded-[3.5rem] border text-center ${
        isDarkMode ? "bg-[#1c2231] border-white/5" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"
      }`}>
        
        {/* Animated Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 rounded-[2rem] text-white mb-8 shadow-lg shadow-orange-500/20">
          <FiZap size={32} className="animate-pulse" />
        </div>

        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 mb-4">
          Fleet Status
        </h2>

        <h1 className={`text-4xl md:text-5xl font-black tracking-tighter italic mb-6 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}>
          READY TO <span className="text-orange-500">RIDE?</span>
        </h1>

        <p className={`text-base font-medium leading-relaxed max-w-sm mx-auto ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}>
          Your dashboard is clear. Flip your status to <span className="font-bold text-orange-500 italic">Online</span> in the sidebar to start receiving delivery requests in your area.
        </p>

        {/* Startup "Trust" indicator */}
        <div className="mt-12 pt-8 border-t border-gray-100/10">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-30">
            Real-time Logistics Engine v1.0
          </p>
        </div>
      </div>
    </div>
  );
}