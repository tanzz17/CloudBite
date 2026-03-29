import React, { useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../Api/api";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const email = (location.state?.email || "").trim().toLowerCase();

  const handleVerify = async (e) => {
    e.preventDefault();

    const cleanOtp = otp.trim();
    const cleanPassword = newPassword.trim();

    if (!email) {
      toast.error("Session expired. Please request OTP again.");
      navigate("/send-otp");
      return;
    }

    if (!cleanOtp || !cleanPassword) {
      toast.error("Please enter OTP and new password");
      return;
    }

    if (cleanPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword({
        email,
        otp: cleanOtp,
        newPassword: cleanPassword,
      });

      toast.success(data?.message || "Password reset successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP or request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Verify OTP & Reset Password
        </h2>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Enter OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-all duration-200 disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
