import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext"; 
import { useNavigate } from "react-router-dom";

export default function CarouselItem({ image, name }) {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/search?q=${name}`)}
      className="group flex flex-col items-center cursor-pointer transition-all duration-300"
    >
      <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 transition-all duration-500 transform group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] ${
        isDarkMode ? "border-gray-800 group-hover:border-orange-500" : "border-white group-hover:border-orange-500 shadow-lg"
      }`}>
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:rotate-6"
          src={image}
          alt={name}
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </div>

      <span className={`mt-4 font-black text-sm md:text-base uppercase tracking-tighter transition-colors duration-300 ${
        isDarkMode ? "text-gray-400 group-hover:text-orange-400" : "text-gray-700 group-hover:text-orange-600"
      }`}>
        {name}
      </span>
    </div>
  );
}