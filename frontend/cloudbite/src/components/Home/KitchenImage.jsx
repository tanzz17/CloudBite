import React, { useContext } from 'react';
import { ThemeContext } from "../../context/ThemeContext";

export default function KitchenImage({ image, name }) {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <div className='flex flex-col items-center p-2 group'> 
      <div className={`w-28 h-28 md:w-36 md:h-36 overflow-hidden rounded-full border-4 transition-all duration-300 ${
          isDarkMode ? "border-gray-800 group-hover:border-orange-500" : "border-white group-hover:border-orange-500"
        } shadow-xl mb-4`}> 
        <img 
          className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500' 
          src={image} 
          alt={name} 
        />
      </div>
      <span className={`font-black text-xs uppercase tracking-widest text-center transition-colors ${
          isDarkMode ? "text-gray-400 group-hover:text-orange-400" : "text-gray-600 group-hover:text-orange-600"
        }`}>
        {name}
      </span> 
    </div>
  );
}