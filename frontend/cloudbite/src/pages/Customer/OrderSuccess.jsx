/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useContext } from "react";
import { CheckCircle2, Receipt, ArrowRight, Home, CreditCard, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/api";
import { ThemeContext } from "../../context/ThemeContext";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price || 0);

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const [latestOrder, setLatestOrder] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        const res = await api.get(`/orders/user/${user.id}`);
        if (res.data && res.data.length > 0) {
          setLatestOrder(res.data[res.data.length - 1]);
        }
      } catch (error) {
        console.error("Receipt sync failed");
      }
    };
    fetchLatestOrder();

    const timer = setTimeout(() => {
      // navigate("/customer/orders");
    }, 10000);
    return () => clearTimeout(timer);
  }, [navigate, user.id]);

  const isOnlinePayment = latestOrder?.paymentMode === "ONLINE";
  const paymentLabel = isOnlinePayment ? "Paid Online" : "Cash on Delivery";
  const PaymentIcon = isOnlinePayment ? CreditCard : Wallet;
  const paymentStatusLabel = isOnlinePayment
    ? latestOrder?.paymentStatus === "PAID"
      ? "Payment Confirmed"
      : "Payment Pending"
    : "Pay on Delivery";

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 py-10 transition-colors duration-500 ${isDarkMode ? "bg-[#0b0f1a]" : "bg-gray-50"}`}>

      {/* Success Animation Header */}
      <div className="mb-8 text-center">
        <div className="relative inline-block">
          <CheckCircle2 size={80} className="text-orange-500 animate-pulse" />
          <div className="absolute inset-0 blur-xl bg-orange-500/20 rounded-full -z-10"></div>
        </div>
        <h1 className={`text-4xl font-black italic tracking-tighter uppercase mt-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Order Signal Confirmed
        </h1>
        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mt-2">
          Transaction Finalized
        </p>
        {/* ── Demo payment note ── */}
        <p className={`text-[9px] font-bold uppercase tracking-widest mt-3 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
          Demo transaction — no real charge was made
        </p>
      </div>

      {/* Digital Receipt Card */}
      {latestOrder && (
        <div className={`w-full max-w-md rounded-[2.5rem] p-8 border mb-8 ${isDarkMode ? "bg-[#161b29] border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-xl"}`}>

          <div className="flex justify-between items-center mb-6 border-b border-dashed border-gray-500/20 pb-4">
            <div className="flex items-center gap-2">
              <Receipt size={16} className="text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Digital Invoice</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
              #{latestOrder.orderId}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            {latestOrder.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-sm font-bold opacity-80">{item.quantity}x {item.foodName}</span>
                <span className="text-sm font-black italic">{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className={`space-y-2 pt-4 border-t ${isDarkMode ? "border-white/5" : "border-gray-50"}`}>
            <div className="flex justify-between text-[10px] font-black uppercase opacity-50">
              <span>Delivery Fee</span>
              <span>{formatPrice(latestOrder.deliveryFee || 30)}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase opacity-50">
              <span>Platform Fee</span>
              <span>{formatPrice(latestOrder.platformFee || 5)}</span>
            </div>
            <div className="flex justify-between text-xl font-black italic tracking-tighter mt-4 text-orange-500">
              <span className="uppercase">Grand Total</span>
              <span>{formatPrice(latestOrder.totalPrice)}</span>
            </div>
          </div>

          {/* Payment method badge */}
          <div className={`mt-6 p-4 rounded-2xl border text-center flex items-center justify-center gap-2 ${
            isOnlinePayment ? "bg-green-500/5 border-green-500/10" : "bg-orange-500/5 border-orange-500/10"
          }`}>
            <PaymentIcon size={12} className={isOnlinePayment ? "text-green-500" : "text-orange-500"} />
            <p className={`text-[9px] font-black uppercase tracking-widest ${isOnlinePayment ? "text-green-500" : "text-orange-500"}`}>
              {paymentLabel} — {paymentStatusLabel}
            </p>
          </div>

          {/* ── Simulated transaction note inside receipt ── */}
          <p className={`text-[8px] font-bold uppercase tracking-widest text-center mt-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}>
            Simulated transaction · Test environment only
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button
          onClick={() => navigate("/customer/orders")}
          className="flex-1 bg-orange-500 text-black font-black py-4 rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest"
        >
          Track My Order <ArrowRight size={14} />
        </button>
        <button
          onClick={() => navigate("/")}
          className={`flex-1 font-black py-4 rounded-2xl transition-all border flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest ${
            isDarkMode ? "border-white/10 hover:bg-white/5 text-white" : "border-gray-200 hover:bg-gray-50 text-gray-900"
          }`}
        >
          <Home size={14} /> Back to Hub
        </button>
      </div>

      <p className="text-[8px] font-bold text-gray-500 mt-8 uppercase tracking-[0.3em]">
        Redirecting to dashboard in 10 seconds...
      </p>
    </div>
  );
}
