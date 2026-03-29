/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import { User, Mail, Phone, Truck, Activity, ShieldCheck } from "lucide-react";
import { getMyDeliveryProfile } from "../../Api/deliveryApi";
import { ThemeContext } from "../../context/ThemeContext";

export default function DeliveryProfile() {
  const { isDarkMode } = useContext(ThemeContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getMyDeliveryProfile();
      setProfile(res.data);
    } catch (error) {
      toast.error("Access denied. Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center mt-20 italic font-black animate-pulse text-orange-500 tracking-[0.3em]">SYNCHRONIZING...</div>
  );

  if (!profile) return (
    <div className="text-center mt-20 font-black text-red-500">PROFILE DATA NOT FOUND</div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-80">Rider Verification</h2>
        <h1 className={`text-4xl font-black tracking-tighter mt-1 italic ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          FLEET <span className="text-orange-500">IDENTITY.</span>
        </h1>
      </div>

      {/* Main Identity Card */}
      <div className={`p-8 md:p-12 rounded-[3.5rem] border overflow-hidden relative ${
        isDarkMode ? "bg-[#1c2231] border-white/5" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"
      }`}>
        
        {/* Verification Badge */}
        <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full">
          <ShieldCheck size={14} className="text-green-500" />
          <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Verified Partner</span>
        </div>

        {/* Profile Info Rows */}
        <div className="space-y-8 mt-4">
          <ProfileRow icon={<User size={14}/>} label="Full Name" value={profile.user?.fullName} isDark={isDarkMode} />
          <ProfileRow icon={<Mail size={14}/>} label="Registry Email" value={profile.user?.email} isDark={isDarkMode} />
          <ProfileRow icon={<Phone size={14}/>} label="Primary Contact" value={profile.phone} isDark={isDarkMode} />
          <ProfileRow icon={<Truck size={14}/>} label="Fleet Class" value={profile.vehicleType} isDark={isDarkMode} />
          
          <div className="pt-6 border-t border-gray-100/10 flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 flex items-center gap-2">
              <Activity size={14} /> Current Status
            </label>
            <span className={`text-xs font-black px-4 py-1.5 rounded-full tracking-tighter ${
              profile.status === "AVAILABLE" 
                ? "bg-green-500/10 text-green-500" 
                : "bg-gray-500/10 text-gray-500"
            }`}>
              {profile.status}
            </span>
          </div>
        </div>

        {/* Startup Branding */}
        <div className="mt-12 text-center opacity-20">
           <p className="text-[8px] font-black uppercase tracking-[0.5em]">Tribe Logistics Network</p>
        </div>
      </div>
    </div>
  );
}

const ProfileRow = ({ icon, label, value, isDark }) => (
  <div className="group transition-all">
    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2 flex items-center gap-2">
      {icon} {label}
    </p>
    <p className={`text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
      {value || "Not Assigned"}
    </p>
  </div>
);