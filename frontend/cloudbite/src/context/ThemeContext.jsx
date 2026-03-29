/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from "react";

// Create context
export const ThemeContext = createContext();

const ThemeProviderCustom = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle theme and save to localStorage
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      document.documentElement.classList.toggle("dark", newMode);
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Default export (important!)
export default ThemeProviderCustom;
