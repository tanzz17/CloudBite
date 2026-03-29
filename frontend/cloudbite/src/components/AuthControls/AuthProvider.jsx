// // src/components/AuthControl/AuthProvider.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { getUserProfile } from "../../Api/api";
// import { AuthContext } from "./AuthContext";

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const jwt = localStorage.getItem("jwt");
//     if (jwt) {
//       getUserProfile(jwt)
//         .then((data) => setUser(data))
//         .catch((err) => {
//           console.error("Failed to fetch profile with stored token:", err);
//           localStorage.removeItem("jwt");
//         });
//     }
//   }, []);

//   const login = async (authData) => {
//     try {
//       const token = authData.jwtToken;
//       if (!token) throw new Error("No token received from backend");

//       localStorage.setItem("jwt", token);

//       const userProfile = await getUserProfile(token);
//       setUser(userProfile);

//       toast.success("Login Successful!");
//       navigate("/");
//     } catch (error) {
//       console.error("Login process failed:", error);
//       toast.error("Login failed. Please try again.");
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("jwt");
//     setUser(null);
//     toast.success("Logged out successfully.");
//     navigate("/");
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

