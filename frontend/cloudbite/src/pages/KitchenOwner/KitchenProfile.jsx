/* KitchenProfile.jsx */
import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import { Edit, Check, X, Upload, MapPin, Clock, Store } from "lucide-react";
import KitchenLayout from "./KitchenLayout";
import { ThemeContext } from "../../context/ThemeContext";
import api from "../../Api/api";
import { resolveBackendAssetUrl } from "../../config/apiBase";

export default function KitchenProfile() {
  const { isDarkMode } = useContext(ThemeContext);
  // eslint-disable-next-line no-unused-vars
  const [kitchen, setKitchen] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("kitchenData");
    if (saved) {
      const parsed = JSON.parse(saved);
      setKitchen(parsed);
      setFormData(parsed);
      setPreview(parsed.logoUrl || "/placeholder.jpg");
    }
  }, []);

  useEffect(() => {
    const fetchKitchen = async () => {
      try {
        const res = await api.get("/auth/my-kitchen");
        const data = res.data;
        const logoUrl = data.logoUrl || data.images?.[0] || "/placeholder.jpg";
        const updated = { ...data, logoUrl };

        setKitchen(updated);
        setFormData(updated);
        setPreview(logoUrl);
        localStorage.setItem("kitchenData", JSON.stringify(updated));
      } catch (err) {
        console.error("Error fetching kitchen:", err);
      }
    };
    fetchKitchen();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSave = async () => {
    try {
      const multipartData = new FormData();
      multipartData.append("name", formData.name || "");
      multipartData.append("address", formData.address || "");
      multipartData.append("description", formData.description || "");
      multipartData.append("openingHours", formData.openingHours || "");
      multipartData.append("closingHours", formData.closingHours || "");
      multipartData.append("open", String(Boolean(formData.open)));
      if (file) multipartData.append("image", file);

      const res = await api.put(`/kitchen-owner/update-my-kitchen/${formData.id}`, multipartData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data;
      const logoUrl = updated.logoUrl || updated.images?.[0] || "/placeholder.jpg";
      const merged = { ...updated, logoUrl };

      setKitchen(merged);
      setFormData(merged);
      setPreview(logoUrl);
      localStorage.setItem("kitchenData", JSON.stringify(merged));
      toast.success("Identity updated successfully");
      setIsEditing(false);
      setFile(null);
    } catch (err) {
      const msg =
        (typeof err?.response?.data === "string" && err.response.data) ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Update failed";
      toast.error(msg);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("blob:")) return url;
    return resolveBackendAssetUrl(url) || "/placeholder.jpg";
  };

  return (
    <KitchenLayout>
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-80">Management</h2>
            <h1 className={`text-4xl font-black tracking-tighter mt-1 italic ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              KITCHEN <span className="text-orange-500">PROFILE.</span>
            </h1>
          </div>
          
          <div className="flex gap-3">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                <Edit size={14} /> Edit Identity
              </button>
            ) : (
              <>
                <button onClick={() => setIsEditing(false)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? "bg-white/10 text-white" : "bg-gray-200 text-gray-700"}`}>
                  <X size={14} /> Cancel
                </button>
                <button onClick={handleSave} className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-green-500/20">
                  <Check size={14} /> Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Identity Card */}
        <div className={`p-8 md:p-12 rounded-[3rem] border ${isDarkMode ? "bg-[#1c2231] border-white/5" : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"}`}>
          
          {/* Logo & Basic Info */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12 pb-12 border-b border-gray-100/10">
            <div className="relative group">
              <img
                src={getImageUrl(preview)}
                alt="Kitchen Logo"
                className="w-32 h-32 rounded-[2.5rem] border-4 border-orange-500 object-cover shadow-2xl transition-transform group-hover:scale-105"
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[2.5rem] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="text-white" size={24} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
            
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h3 className={`text-3xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {formData.name || "Brand Name"}
                </h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${formData.open ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                  {formData.open ? "Online" : "Offline"}
                </span>
              </div>
              <p className={`flex items-center justify-center md:justify-start gap-2 text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                <MapPin size={14} className="text-orange-500" /> {formData.address || "Location not set"}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Field label="Kitchen Name" name="name" icon={<Store size={12}/>} value={formData.name} disabled={!isEditing} onChange={handleChange} isDark={isDarkMode} />
              <Field label="Opening Hours" name="openingHours" icon={<Clock size={12}/>} value={formData.openingHours} disabled={!isEditing} onChange={handleChange} isDark={isDarkMode} />
              <Field label="Closing Hours" name="closingHours" icon={<Clock size={12}/>} value={formData.closingHours} disabled={!isEditing} onChange={handleChange} isDark={isDarkMode} />
              <div className="md:col-span-2">
                <Field label="Full Address" name="address" icon={<MapPin size={12}/>} value={formData.address} disabled={!isEditing} onChange={handleChange} isDark={isDarkMode} />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="3"
                  className={`w-full p-4 rounded-2xl text-sm font-bold border outline-none transition-all ${
                    !isEditing ? "opacity-60 cursor-not-allowed" : "focus:border-orange-500"
                  } ${isDarkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-100"}`}
                />
              </div>
            </div>

            {/* Availability Toggle */}
            <div className={`p-6 rounded-3xl border flex items-center justify-between ${isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>Store Status</p>
                <p className={`text-sm font-bold ${formData.open ? "text-green-500" : "text-red-500"}`}>
                  Currently {formData.open ? "Accepting Orders" : "Closed to Public"}
                </p>
              </div>
              
              <div 
                onClick={() => isEditing && setFormData(prev => ({ ...prev, open: !prev.open }))}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${isEditing ? "cursor-pointer" : "opacity-50 cursor-not-allowed"} ${formData.open ? "bg-green-500" : "bg-gray-400"}`}
              >
                <div className={`h-6 w-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${formData.open ? "translate-x-6" : "translate-x-0"}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </KitchenLayout>
  );
}

function Field({ label, name, value, disabled, onChange, icon, isDark }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">
        {icon} {label}
      </label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-4 rounded-2xl text-sm font-bold border outline-none transition-all ${
          disabled ? "opacity-60 cursor-not-allowed" : "focus:border-orange-500"
        } ${isDark ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-100"}`}
      />
    </div>
  );
}


