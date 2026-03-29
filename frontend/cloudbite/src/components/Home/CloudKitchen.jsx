import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import api from "../../Api/api";
import { resolveBackendAssetUrl } from "../../config/apiBase";

export default function CloudKitchens() {
  const [kitchens, setKitchens] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useContext(ThemeContext);

  const chefImageUrl =
    "https://www.shutterstock.com/image-photo/african-american-female-chef-having-600nw-2150289105.jpg";

  useEffect(() => {
    api
      .get("/kitchens/all")
      .then((res) => {
        setKitchens(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load kitchens");
        setLoading(false);
      });
  }, []);

  const getImageUrl = (url) => {
    if (!url) return "/default-kitchen.jpg";
    return resolveBackendAssetUrl(url) || "/default-kitchen.jpg";
  };

  return (
    <div className="w-full mt-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            Popular Cloud Kitchens
          </h2>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest mt-1">
            Handpicked for your taste
          </p>
        </div>
        <Link to="/all-kitchens" className="text-orange-500 hover:text-orange-600 transition-colors text-sm font-bold flex items-center gap-1">
          See all <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-60 rounded-xl animate-pulse ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`} />
            ))
          : kitchens.map((kitchen) => (
              <Link key={kitchen.id} to={`/kitchen/${kitchen.id}`} className="group flex flex-col transition-all duration-300">
                <div className={`relative h-44 w-full overflow-hidden rounded-xl border ${
                  isDarkMode ? "bg-[#1a1f2e] border-gray-800" : "bg-gray-50 border-gray-200"
                }`}>
                  <img
                    src={getImageUrl(kitchen.logoUrl)}
                    alt={kitchen.name}
                    className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="mt-3">
                  <h3 className={`font-bold text-base truncate group-hover:text-orange-500 transition-colors ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    {kitchen.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <AccessTimeIcon className="text-gray-400 !text-sm" />
                    <span className="text-xs text-gray-500">{kitchen.open ? "Open now" : "Closed"}</span>
                  </div>
                </div>
              </Link>
            ))}
      </div>

      <section className="mt-24">
        <div className={`flex flex-col md:flex-row items-stretch rounded-2xl overflow-hidden border ${
          isDarkMode ? "bg-[#0f172a] border-gray-800" : "bg-white border-gray-100 shadow-sm"
        }`}>
          <div className="w-full md:w-5/12 h-64 md:h-auto overflow-hidden">
            <img src={chefImageUrl} alt="Chef" className="w-full h-full object-cover" />
          </div>

          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
            <span className="text-orange-500 font-bold text-xs uppercase tracking-[0.2em] mb-3">Our Mission</span>
            <h2 className={`text-3xl font-bold tracking-tight mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              The Heart behind <span className="text-orange-500">CloudBite</span>
            </h2>
            <p className={`text-sm md:text-base leading-relaxed mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              CloudBite was built to empower local culinary experts. We bring the authentic taste of
              home-style cooking from professional cloud kitchens directly to your doorstep.
            </p>
            <div>
              <button className="border-2 border-orange-500 text-orange-500 px-6 py-2 rounded-full font-bold text-xs hover:bg-orange-500 hover:text-white transition-all uppercase tracking-widest">
                Read Story
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
