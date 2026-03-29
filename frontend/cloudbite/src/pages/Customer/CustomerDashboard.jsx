import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/AuthControls/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import bannerImage1 from "../../components/Home/Banner/1.jpeg";
import bannerImage2 from "../../components/Home/Banner/2.jpg";
import bannerImage3 from "../../components/Home/Banner/3.jpg";
import bannerImage4 from "../../components/Home/Banner/4.jpg";

import CloudKitchens from "../../components/Home/CloudKitchen";
import RecommendedSlider from "./RecommendSlider";
import ReOrderSlider from "./ReOrderSlider";
import { apiUrl } from "../../config/apiBase";

const bannerImages = [bannerImage1, bannerImage2, bannerImage3, bannerImage4];

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim().length > 0) navigate(`/search?q=${encodeURIComponent(value)}`);
  };

  const handleCategorySelect = async (category) => {
    try {
      setSelectedCategory(category);
      setSelectedSubCategory("");
      const res = await fetch(apiUrl(`/public/category/${category}`));
      setFoods(await res.json());
    } catch (error) {
      console.error("Error fetching category foods:", error);
    }
  };

  const handleSubCategorySelect = async (subCategory) => {
    try {
      setSelectedSubCategory(subCategory);
      const res = await fetch(apiUrl(`/public/subcategory/${subCategory}`));
      setFoods(await res.json());
    } catch (error) {
      console.error("Error fetching subcategory foods:", error);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-700 ${
        isDarkMode ? "bg-[#0b0f1a] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* HERO SECTION */}
      <header className="relative w-full h-[75vh] flex items-center justify-center overflow-hidden">
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] scale-105 ${
              index === currentImageIndex ? "opacity-60" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}

        <div
          className={`absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-transparent ${
            isDarkMode ? "to-[#0b0f1a]" : "to-gray-50"
          }`}
        />

        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-white tracking-tighter drop-shadow-2xl">
            Welcome Back,{" "}
            <span className="text-orange-500 italic">
              {user?.fullName?.split(" ")[0] || "Foodie"}!
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 mb-10 font-medium italic opacity-90">
            "Your favorites are just one tap away."
          </p>

          <div className="relative max-w-3xl mx-auto flex items-center group mb-6 backdrop-blur-md bg-white/10 p-2 rounded-2xl border border-white/20 shadow-2xl">
            <div className="absolute left-8 z-30 flex items-center gap-2 border-r pr-4 border-white/30">
              <LocationOnIcon className="text-orange-500" />
              <span className="text-white hidden md:block text-xs font-black uppercase tracking-widest">
                Mumbai
              </span>
            </div>
            <input
              type="text"
              placeholder="Search biryani, thali, or desserts..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-5 pl-40 md:pl-48 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/50 text-lg transition-all"
            />
            <SearchIcon className="absolute right-8 text-gray-400 group-hover:text-orange-500 transition-colors !text-3xl" />
          </div>
        </div>
      </header>

      {/* CATEGORY SECTION */}
      <section className="relative z-30 -mt-20 max-w-7xl mx-auto px-6">
        <div
          className={`p-12 rounded-[3rem] shadow-xl ${
            isDarkMode
              ? "bg-[#161b29] border border-gray-800"
              : "bg-white"
          }`}
        >
          <div className="mb-6 border-l-8 border-orange-500 pl-6">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic">
              Browse by Category
            </h2>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
              {selectedSubCategory
                ? `Showing ${selectedSubCategory} items`
                : selectedCategory
                ? `Showing ${selectedCategory} items`
                : "Explore delicious options"}
            </p>
          </div>

          <RecommendedSlider
            onCategorySelect={handleCategorySelect}
            onSubCategorySelect={handleSubCategorySelect}
          />

          {/* FOOD GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {foods.map((food) => (
              <div
                key={food.id}
                onClick={() =>
                  navigate(`/search?q=${encodeURIComponent(food.name)}`)
                }
                className={`p-4 rounded-2xl shadow-lg cursor-pointer transition-transform hover:scale-105 ${
                  isDarkMode ? "bg-[#1e2435]" : "bg-gray-50"
                }`}
              >
                <img
                  src={food.images?.[0]}
                  alt={food.name}
                  className="w-full h-40 object-cover rounded-xl mb-3"
                />
                <h3 className="font-bold text-lg">{food.name}</h3>
                <p className="text-sm text-gray-500">
                  {food.kitchenName}
                </p>
                <p className="text-orange-500 font-bold mt-2">
                  ₹{food.price}
                </p>
              </div>
            ))}
          </div>
        </div>

        
          {/* ✅ REORDER SLIDER ADDED HERE */}
          <ReOrderSlider userId={user?.id} />
      </section>

      {/* CLOUD KITCHENS */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <CloudKitchens />
      </section>

      {/* FOOTER remains same */}
    </div>
  );
}