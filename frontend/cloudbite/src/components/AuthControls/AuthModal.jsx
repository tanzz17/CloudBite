/* eslint-disable no-unused-vars */
import React, { useState, useContext, useEffect } from "react";
import {
  Dialog,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import toast from "react-hot-toast";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthControls/AuthContext";
import {
  loginUser,
  registerCustomer,
  sendForgotPasswordOtp,
  resetPassword,
} from "../../Api/api";

export default function AuthModal({ open, handleClose, initialMode = "login" }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Constants for validation
  const MIN_PW = 8;
  const MAX_PW = 20;

  useEffect(() => {
    if (open) {
      setStep(initialMode);
    }
  }, [open, initialMode]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your credentials");
      return;
    }
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      await login({
        jwtToken: res.jwtToken,
        role: res.user.role,
        user: res.user,
      });
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error("Name, email, and password are required");
      return;
    }

    // Password Length Validation
    if (password.length < MIN_PW) {
      toast.error(`Password must be at least ${MIN_PW} characters`);
      return;
    }

    setLoading(true);
    try {
      await registerCustomer({ fullName, email, password });
      toast.success("Signup successful! Welcome to the Tribe.");
      setStep("login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast.error("Enter your registered email");
      return;
    }
    setLoading(true);
    try {
      const res = await sendForgotPasswordOtp(email);
      toast.success(res.message || "OTP sent to your email");
      setStep("otp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      toast.error("Enter OTP");
      return;
    }
    setStep("resetPassword");
  };

  const handlePasswordReset = async () => {
    if (!newPassword.trim() || !otp.trim()) {
      toast.error("Enter OTP and new password");
      return;
    }

    if (newPassword.length < MIN_PW) {
      toast.error(`New password must be at least ${MIN_PW} characters`);
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ email, otp, newPassword });
      toast.success(res.message || "Password reset successful!");
      setStep("login");
      handleClose(); 
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const BackButton = ({ toStep }) => (
    <Button
      variant="text"
      sx={{ mt: 1, textTransform: "none", fontWeight: 'bold' }}
      onClick={() => setStep(toStep)}
    >
      ← Back
    </Button>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '2rem', overflow: 'hidden' } }}
    >
      <Box className="grid md:grid-cols-2 grid-cols-1">
        {!isMobile && (
          <Box
            className="bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=800')",
            }}
          />
        )}

        <Box className="relative p-10 bg-white">
          <IconButton
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400"
          >
            <CloseIcon />
          </IconButton>

          {loading && (
            <Box className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-sm">
              <CircularProgress sx={{ color: '#f97316' }} />
            </Box>
          )}

          {/* LOGIN VIEW */}
          {step === "login" && (
            <Box className="animate-in fade-in duration-500">
              <Typography variant="h4" className="font-black tracking-tighter italic text-gray-900 mb-1">
                WELCOME <span className="text-orange-500">BACK.</span>
              </Typography>
              <Typography variant="body2" className="text-gray-500 mb-6 font-medium">Log in to continue your feast.</Typography>
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: MAX_PW }}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3, py: 1.5, borderRadius: '1rem', fontWeight: '900', bgcolor: "#f97316", '&:hover': { bgcolor: '#ea580c' }, boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.2)' }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "AUTHENTICATING..." : "LOGIN"}
              </Button>
              <Box className="mt-4 flex justify-between items-center">
                 <Button variant="text" sx={{ color: '#f97316', fontSize: '0.75rem', fontWeight: 'bold' }} onClick={() => setStep("forgot")}>
                    Forgot Password?
                  </Button>
                  <Button variant="text" sx={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold' }} onClick={() => setStep("signup")}>
                    Create Account
                  </Button>
              </Box>
            </Box>
          )}

          {/* SIGNUP VIEW */}
          {step === "signup" && (
            <Box className="animate-in fade-in duration-500">
              <Typography variant="h4" className="font-black tracking-tighter italic text-gray-900 mb-1">
                JOIN THE <span className="text-orange-500">TRIBE.</span>
              </Typography>
              <Typography variant="body2" className="text-gray-500 mb-6 font-medium">Create an account to start ordering.</Typography>
              <TextField
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: MAX_PW }}
                helperText={`${password.length}/${MAX_PW} characters`}
              />

              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3, py: 1.5, borderRadius: '1rem', fontWeight: '900', bgcolor: "#f97316", '&:hover': { bgcolor: '#ea580c' }, boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.2)' }}
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? "CREATING..." : "SIGN UP"}
              </Button>
              <BackButton toStep="login" />
            </Box>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {step === "forgot" && (
            <Box className="animate-in fade-in duration-500">
              <Typography variant="h5" className="font-black italic text-gray-800 mb-2">RECOVER ACCOUNT</Typography>
              <TextField
                label="Registered Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2, py: 1.5, borderRadius: '1rem', fontWeight: '900', bgcolor: "#f97316" }}
                onClick={handleSendOtp}
                disabled={loading}
              >
                SEND OTP
              </Button>
              <BackButton toStep="login" />
            </Box>
          )}

          {/* OTP VERIFICATION VIEW */}
          {step === "otp" && (
            <Box className="animate-in fade-in duration-500">
              <Typography variant="h5" className="font-black italic text-gray-800 mb-2">VERIFY IDENTITY</Typography>
              <TextField
                label="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2, py: 1.5, borderRadius: '1rem', fontWeight: '900', bgcolor: "#f97316" }}
                onClick={handleVerifyOtp}
              >
                VERIFY
              </Button>
              <BackButton toStep="forgot" />
            </Box>
          )}

          {/* RESET PASSWORD VIEW */}
          {step === "resetPassword" && (
            <Box className="animate-in fade-in duration-500">
              <Typography variant="h5" className="font-black italic text-gray-800 mb-2">NEW PASSWORD</Typography>
              <TextField
                label="New Password"
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                margin="normal"
                inputProps={{ maxLength: MAX_PW }}
                helperText={`${newPassword.length}/${MAX_PW}`}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2, py: 1.5, borderRadius: '1rem', fontWeight: '900', bgcolor: "#f97316" }}
                onClick={handlePasswordReset}
                disabled={loading}
              >
                SAVE PASSWORD
              </Button>
              <BackButton toStep="login" />
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}