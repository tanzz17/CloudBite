import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { resetPassword, sendForgotPasswordOtp } from "../Api/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return toast.error("Please enter your email");

    try {
      setLoading(true);
      const data = await sendForgotPasswordOtp(cleanEmail);
      toast.success(data?.message || "OTP sent successfully!");
      setEmail(cleanEmail);
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const cleanOtp = otp.trim();
    const cleanPassword = newPassword.trim();

    if (!cleanOtp || !cleanPassword) return toast.error("Please fill all fields");
    if (cleanPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);
      const data = await resetPassword({
        email,
        otp: cleanOtp,
        newPassword: cleanPassword,
      });

      toast.success(data?.message || "Password reset successful!");
      setOtpSent(false);
      setEmail("");
      setOtp("");
      setNewPassword("");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">
          {otpSent ? "Reset Your Password" : "Forgot Password"}
        </h2>

        {!otpSent ? (
          <>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 p-3 rounded-lg mb-4 focus:ring focus:ring-orange-200"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-70"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 p-3 rounded-lg mb-4"
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              className="w-full border border-gray-300 p-3 rounded-lg mb-4"
            />
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-70"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
