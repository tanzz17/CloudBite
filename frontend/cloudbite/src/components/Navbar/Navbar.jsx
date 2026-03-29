import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthControls/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

import {
  Menu,
  MenuItem,
  Avatar,
  IconButton,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export default function Navbar({ onLoginClick }) { 
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const avatarLetter = user
    ? (user.fullName?.trim()[0] || user.email?.[0] || "").toUpperCase()
    : "";

  const isHomePage = location.pathname === "/";

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 px-6 py-4 lg:px-20 flex justify-between items-center transition-all duration-500 backdrop-blur-lg ${
        isDarkMode 
          ? "bg-[#0b0f1af2] border-b border-white/10" 
          : "bg-orange-500 shadow-lg border-b border-orange-600"
      }`}
      style={{ height: "80px" }}
    >
      {/* 🔹 Logo */}
      <div
        className="logo font-black text-2xl cursor-pointer tracking-tighter uppercase flex items-center gap-2 text-white"
        onClick={() => {
          navigate("/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-sm text-white border border-white/20">CB</div>
        <span>
          CloudBite <span className={isDarkMode ? "text-orange-500" : "text-orange-100"}>Express</span>
        </span>
      </div>

      <div className="flex items-center space-x-3 lg:space-x-6">
        
        {/* 🌗 Theme Toggle */}
        <IconButton onClick={toggleTheme} sx={{ transition: 'transform 0.3s' }} className="hover:rotate-12">
          {isDarkMode ? (
            <LightModeIcon className="text-yellow-400" />
          ) : (
            <DarkModeIcon className="text-white" />
          )}
        </IconButton>

        {/* ✅ Profile Logic (Search and Cart Removed) */}
        {user ? (
          <>
            <IconButton 
              onClick={handleMenuClick}
              sx={{ 
                p: 0, 
                border: '2px solid rgba(249, 115, 22, 0.4)',
                '&:hover': { border: '2px solid #f97316' }
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#f97316",
                  color: "white",
                  fontWeight: "900",
                  fontSize: "0.9rem",
                  width: 40,
                  height: 40,
                }}
              >
                {avatarLetter}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                elevation: 10,
                sx: {
                  bgcolor: isDarkMode ? "#161b29" : "#ffffff", 
                  color: isDarkMode ? "#ffffff" : "#1f2937",
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: "16px",
                  overflow: 'visible',
                  border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                  "&:before": {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 20,
                    width: 10,
                    height: 10,
                    bgcolor: isDarkMode ? "#161b29" : "#ffffff",
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                    borderTop: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                    borderLeft: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                  },
                  "& .MuiMenuItem-root": {
                    fontSize: "0.9rem",
                    fontWeight: "700",
                    margin: "4px 8px",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    "&:hover": {
                      bgcolor: isDarkMode ? "rgba(249, 115, 22, 0.1)" : "#fff7ed",
                      color: "#f97316",
                    },
                  },
                },
              } }
            >
              <div className="px-5 py-3 border-b border-gray-700/30 mb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Signed in as</p>
                <p className="text-sm font-black truncate">{user?.fullName || 'Foodie'}</p>
              </div>

              <MenuItem onClick={() => navigate("/customer/profile")}>
                My Profile
              </MenuItem>
              
              {/* <MenuItem onClick={() => navigate("/customer/orders")}>
                My Orders
              </MenuItem> */}

              <MenuItem 
                onClick={handleLogout}
                sx={{ mt: 1, borderTop: isDarkMode ? "1px solid #374151" : "1px solid #f3f4f6", color: "#ef4444 !important" }}
              >
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          isHomePage && (
            <button 
              onClick={onLoginClick}
              className="px-6 py-2 rounded-full bg-white text-orange-500 font-black text-sm uppercase tracking-widest hover:bg-orange-100 transition-colors shadow-lg"
            >
              Login
            </button>
          )
        )}
      </div>
    </nav>
  );
}