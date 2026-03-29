/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import Slider from "react-slick";
import api from "../../Api/api";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { SampleNextArrow, SamplePrevArrow } from "../../components/Home/Arrow";
import { ThemeContext } from "../../context/ThemeContext";
import { categoryImages } from "../Customer/UserHomeData";

const categoryMap = {
  Breakfast: ["South Indian", "Maharashtrian"],
  "Main Course": ["Veg Starters", "Non-Veg Starters", "Veg Main Course", "Non-Veg Main Course", "Breads", "Veg Rice", "Non-Veg Rice"],
  Chinese: ["Veg Starters", "Non-Veg Starters", "Noodles", "Fried Rice"],
  Thali: ["Veg Thali", "Non-Veg Thali"],
  Dessert: [],
  Beverage: [],
  Sandwiches: [],
  Pizzas: [],
  Momos: [],
  "Wraps & Rolls": [],
};

const RecommendedSlider = ({ onCategorySelect, onSubCategorySelect }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/public/categories");
        setCategories(res.data);
        if (res.data.length > 0) {
          setSelectedCategory(res.data[0]);
          if (onCategorySelect) onCategorySelect(res.data[0]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    if (onCategorySelect) onCategorySelect(category);
  };

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory);
    if (onSubCategorySelect) onSubCategorySelect(subCategory);
  };

  const settings = {
    dots: false,
    infinite: false, // Changed to false for better UX when there are few items
    speed: 500,
    slidesToShow: 7,
    slidesToScroll: 2,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 6 } },
      { breakpoint: 1024, settings: { slidesToShow: 5 } },
      { breakpoint: 768, settings: { slidesToShow: 4 } },
      { breakpoint: 480, settings: { slidesToShow: 3 } },
    ],
  };

  return (
    <div className="py-2">
      {/* ================= CATEGORY SLIDER ================= */}
      <Slider {...settings} className="category-slider py-4">
        {categories.map((category, index) => {
          const matchedCategory = categoryImages.find((c) => c.name === category);
          const isActive = selectedCategory === category;

          return (
            <div key={index} className="px-2 outline-none">
              <div
                onClick={() => handleCategoryClick(category)}
                className="flex flex-col items-center cursor-pointer group"
              >
                {/* Image Container: Square with rounded corners (more modern than perfect circles) */}
                <div
                  className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden transition-all duration-300 ${
                    isActive 
                    ? "shadow-lg shadow-orange-500/20 scale-105" 
                    : "grayscale-[0.4] group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
                  } ${isDarkMode ? "bg-gray-800" : "bg-white border border-gray-100"}`}
                >
                  <img
                    src={matchedCategory?.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400"}
                    alt={category}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Subtle selection overlay */}
                  {isActive && (
                    <div className="absolute inset-0 border-4 border-orange-500 rounded-2xl pointer-events-none" />
                  )}
                </div>

                <h3
                  className={`mt-3 text-xs md:text-sm font-bold tracking-wide transition-colors ${
                    isActive
                      ? "text-orange-500"
                      : isDarkMode ? "text-gray-400 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"
                  }`}
                >
                  {category}
                </h3>
                
                {/* Active Underline Dot */}
                <div className={`h-1.5 w-1.5 rounded-full mt-1 transition-all duration-300 ${isActive ? "bg-orange-500 scale-100" : "bg-transparent scale-0"}`} />
              </div>
            </div>
          );
        })}
      </Slider>

      {/* ================= SUBCATEGORY PILLS ================= */}
      {selectedCategory &&
        categoryMap[selectedCategory] &&
        categoryMap[selectedCategory].length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start animate-in fade-in slide-in-from-top-2 duration-500">
            {categoryMap[selectedCategory].map((subCategory, index) => {
              const isSubActive = selectedSubCategory === subCategory;
              return (
                <button
                  key={index}
                  onClick={() => handleSubCategoryClick(subCategory)}
                  className={`px-5 py-2 rounded-full text-xs font-bold transition-all border ${
                    isSubActive
                      ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20"
                      : isDarkMode
                      ? "bg-[#1e2435] border-gray-700 text-gray-400 hover:border-orange-500/50 hover:text-orange-500"
                      : "bg-white border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500 shadow-sm"
                  }`}
                >
                  {subCategory}
                </button>
              );
            })}
          </div>
        )}
    </div>
  );
};

export default RecommendedSlider;
