/* src/pages/Customer/CustomerOrders.jsx */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Loader2, Package, Calendar, CreditCard, CheckCircle,
  Clock, Truck, XCircle, ChevronDown, ChevronUp, Banknote, MapPin
} from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import { connectOrderSocket, disconnectSocket } from "../../socket";
import api from "../../Api/api";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price || 0);

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const STATUS_CONFIG = {
  PAYMENT_PENDING: { label: "Payment Pending", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock, dot: "bg-yellow-400" },
  PENDING: { label: "Order Placed", color: "text-blue-600 bg-blue-50 border-blue-200", icon: Clock, dot: "bg-blue-400" },
  CONFIRMED: { label: "Confirmed", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: CheckCircle, dot: "bg-indigo-400" },
  READY_FOR_PICKUP: { label: "Ready for Pickup", color: "text-purple-600 bg-purple-50 border-purple-200", icon: Package, dot: "bg-purple-400" },
  ON_THE_WAY: { label: "On the Way", color: "text-orange-600 bg-orange-50 border-orange-200", icon: Truck, dot: "bg-orange-400" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-orange-600 bg-orange-50 border-orange-200", icon: Truck, dot: "bg-orange-400" },
  DELIVERED: { label: "Delivered", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle, dot: "bg-green-400" },
  CANCELLED: { label: "Cancelled", color: "text-red-600 bg-red-50 border-red-200", icon: XCircle, dot: "bg-red-400" },
};

const DELIVERY_CHARGES = 35;

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [payingOrderId, setPayingOrderId] = useState(null);
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchOrders = async () => {
    try {
      if (!user) return;
      const res = await api.get(`/orders/user/${user.id}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setOrders(data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    if (orders.length === 0) return;
    orders.forEach((order) => {
      connectOrderSocket(order.orderId, (event) => {
        setOrders((prev) =>
          prev.map((o) => o.orderId === event.orderId ? { ...o, orderStatus: event.status } : o)
        );
        toast.success(`Order #${event.orderId}: ${event.status.replaceAll("_", " ")}`);
      });
    });
    return () => disconnectSocket();
  }, [orders]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handlePayNow = async (order) => {
    try {
      setPayingOrderId(order.orderId);

      const paymentRes = await api.post(`/payment/create-order/${order.orderId}`);
      const { razorpayOrderId, amount, keyId } = paymentRes.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Payment gateway failed to load.");
        setPayingOrderId(null);
        return;
      }

      const options = {
        key: keyId,
        amount: amount * 100,
        currency: "INR",
        name: "CloudBite",
        description: "Food Order Payment",
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post(`/payment/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Payment successful! Order confirmed.");
            fetchOrders();
          } catch {
            toast.error("Payment verification failed.");
          } finally {
            setPayingOrderId(null);
          }
        },
        prefill: { name: user?.fullName || "", contact: user?.phone || "" },
        theme: { color: "#F97316" },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled.");
            setPayingOrderId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Failed to initiate payment.");
      setPayingOrderId(null);
    }
  };

  const canPayOnline = (order) =>
    (order.paymentMode === "COD" || order.paymentStatus !== "PAID") &&
    order.orderStatus !== "CANCELLED" &&
    order.orderStatus !== "DELIVERED";


  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <Loader2 className="animate-spin text-orange-500" size={28} />
        <p className={`text-xs font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          Loading your orders...
        </p>
      </div>
    );

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>My Orders</h1>
        <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
          {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      {orders.length === 0 ? (
        <div className={`text-center py-20 rounded-2xl border ${isDarkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className={`font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>No orders yet</p>
          <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Your order history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusKey = order.orderStatus?.toUpperCase();
            const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG["PENDING"];
            const StatusIcon = status.icon;
            const isExpanded = expandedOrders[order.orderId];
            const itemsSubtotal = order.totalPrice - DELIVERY_CHARGES;
            const isPaying = payingOrderId === order.orderId;
            const showPayNow = canPayOnline(order);

            return (
              <div
                key={order.orderId}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  isDarkMode ? "bg-[#1c2231] border-white/8" : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                {/* Order Card Top */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className={`font-bold text-base leading-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {order.kitchenName}
                      </h3>
                      <div className={`flex items-center gap-2 mt-1 text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                        <Calendar size={11} />
                        <span>
                          {new Date(order.orderDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </span>
                        <span className="opacity-40">•</span>
                        <span className="font-mono">#{order.orderId}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${status.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  <div className={`text-sm mb-3 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {order.items?.slice(0, 2).map((item, i) => (
                      <span key={i}>
                        {i > 0 && ", "}
                        {item.quantity}x {item.foodName}
                      </span>
                    ))}
                    {order.items?.length > 2 && (
                      <span className={isDarkMode ? "text-gray-500" : "text-gray-400"}>
                        {" "}+{order.items.length - 2} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-base ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                        {formatPrice(order.totalPrice)}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        order.paymentMode === "ONLINE" && order.paymentStatus === "PAID"
                          ? isDarkMode ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-50 text-green-600 border-green-200"
                          : order.paymentMode === "COD"
                          ? isDarkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200"
                          : isDarkMode ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-yellow-50 text-yellow-600 border-yellow-200"
                      }`}>
                        {order.paymentMode === "ONLINE" && order.paymentStatus === "PAID" ? (
                          <><CreditCard size={9} /> Paid Online</>
                        ) : order.paymentMode === "COD" ? (
                          <><Banknote size={9} /> COD</>
                        ) : (
                          <><Clock size={9} /> Payment Pending</>
                        )}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleExpand(order.orderId)}
                      className={`flex items-center gap-1 text-xs font-semibold ${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"} transition-colors`}
                    >
                      {isExpanded ? "Less" : "Details"}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {/* ADDED: Track Order button for OUT_FOR_DELIVERY orders */}
                  {order.orderStatus === "OUT_FOR_DELIVERY" && (
                    <button
                      onClick={() => navigate(`/customer/track/${order.orderId}`)}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-black text-[10px] uppercase py-3 rounded-xl tracking-widest active:scale-95 transition-all"
                    >
                      <MapPin size={13} /> Track Order
                    </button>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className={`px-5 pb-5 border-t ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
                    <div className="pt-4 space-y-2">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {item.foodName}
                            <span className={`ml-1 text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>x{item.quantity}</span>
                          </span>
                          <span className={`text-sm font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {formatPrice((item.unitPrice || 0) * (item.quantity || 1))}
                          </span>
                        </div>
                      ))}
                      <div className={`border-t pt-2 mt-2 space-y-1 ${isDarkMode ? "border-white/5" : "border-gray-100"}`}>
                        <div className={`flex justify-between text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                          <span>Item Total</span>
                          <span>{formatPrice(itemsSubtotal)}</span>
                        </div>
                        <div className={`flex justify-between text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                          <span>Delivery & Service Charges</span>
                          <span>{formatPrice(DELIVERY_CHARGES)}</span>
                        </div>
                        <div className={`flex justify-between text-sm font-bold pt-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          <span>Total</span>
                          <span>{formatPrice(order.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pay Now Banner */}
                {showPayNow && (
                  <div className={`px-5 py-3 border-t flex items-center justify-between gap-3 ${
                    isDarkMode ? "border-white/5 bg-yellow-500/5" : "border-yellow-100 bg-yellow-50"
                  }`}>
                    <div>
                      <p className={`text-xs font-semibold ${isDarkMode ? "text-yellow-400" : "text-yellow-700"}`}>
                        {order.paymentMode === "COD" ? "Switch to online payment" : "Complete your payment"}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isDarkMode ? "text-yellow-500/60" : "text-yellow-600/70"}`}>
                        Net Banking or UPI accepted
                      </p>
                    </div>
                    <button
                      onClick={() => handlePayNow(order)}
                      disabled={isPaying}
                      className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-60 shrink-0"
                    >
                      {isPaying ? <Loader2 size={12} className="animate-spin" /> : <CreditCard size={12} />}
                      Pay {formatPrice(order.totalPrice)}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}



