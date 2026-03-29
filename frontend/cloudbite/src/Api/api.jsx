// src/Api/api.js
import axios from "axios";
import { API_BASE_URL } from "../config/apiBase";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const isAuthEndpoint =
      config.url?.includes("/auth/signin") ||
      config.url?.includes("/auth/signup") ||
      config.url?.includes("/auth/forgot-password") ||
      config.url?.includes("/auth/reset-password");

    if (!isAuthEndpoint) {
      const token = localStorage.getItem("jwt");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const registerCustomer = async (customerData) => {
  const response = await api.post("/auth/signup/customer", customerData);

  const data = response.data;
  if (data.jwtToken) {
    localStorage.setItem("jwt", data.jwtToken);
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/auth/signup", userData);
  localStorage.setItem("jwt", response.data.jwtToken);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  return response.data;
};

export const loginUser = async (loginData) => {
  const response = await api.post("/auth/signin", loginData);
  localStorage.setItem("jwt", response.data.jwtToken);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  return response.data;
};

export const getUserProfile = async () => {
  const userData = localStorage.getItem("user");
  if (userData) return JSON.parse(userData);
  return null;
};

export const updateUserProfile = async (updatedUser) => {
  const userId = updatedUser.id;
  const response = await api.put(`/user/update/${userId}`, updatedUser);
  return response.data;
};

export const sendForgotPasswordOtp = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const response = await api.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
};

export default api;
