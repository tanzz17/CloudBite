/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useMemo, useContext } from "react";
import axios from "axios";
import { apiUrl } from "../../config/apiBase";
import toast from "react-hot-toast";
import { Loader2, Package, Clock, Check, MapPin, Truck, CheckCircle, Zap, UtensilsCrossed, XCircle, CreditCard, Banknote } from "lucide-react";
import KitchenLayout from "./KitchenLayout";
import { connectOrderSocket, disconnectSocket } from "../../socket";
import { ThemeContext } from "../../context/ThemeContext";

const formatPrice = (p) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(p || 0);

const getStatusDetails = (s) => {
  switch (s) {
    case "PENDING": return { text: "Pending", icon: Clock, class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" };
    case "CONFIRMED": return { text: "Confirmed", icon: Check, class: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    case "READY_FOR_PICKUP": return { text: "Ready", icon: Package, class: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" };
    case "ON_THE_WAY": return { text: "Partner Assigned", icon: Zap, class: "bg-orange-500/10 text-orange-500 border-orange-500/20" };
    case "OUT_FOR_DELIVERY": return { text: "Out for Delivery", icon: Truck, class: "bg-orange-500/10 text-orange-500 border-orange-500/20" };
    case "DELIVERED": return { text: "Completed", icon: CheckCircle, class: "bg-green-500/10 text-green-500 border-green-500/20" };
    case "CANCELLED": return { text: "Cancelled", icon: XCircle, class: "bg-red-500/10 text-red-500 border-red-500/20" };
    default: return { text: s, icon: Package, class: "bg-gray-500/10 text-gray-500 border-gray-500/20" };
  }
};

export default function KitchenOrdersPage() {
  const { isDarkMode } = useContext(ThemeContext);
  const [orders, setOrders] = useState([]);
  const [kitchenId, setKitchenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");
  const token = localStorage.getItem("jwt");

  useEffect(() => {
    const saved = localStorage.getItem("kitchenData");
    if (saved) setKitchenId(JSON.parse(saved).id);
    else fetchKitchen();
  }, []);

  const fetchKitchen = async () => {
    try {
      const res = await axios.get(apiUrl("/auth/my-kitchen"), { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem("kitchenData", JSON.stringify(res.data));
      setKitchenId(res.data.id);
    } catch (err) {
      toast.error("Kitchen profile not found");
    }
  };

  const fetchOrders = () => {
    if (!kitchenId) return;
    axios.get(apiUrl(`/orders/kitchen/${kitchenId}`), { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setOrders(res.data || []))
      .catch(() => toast.error("Failed to fetch orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [kitchenId]);

  useEffect(() => {
    connectOrderSocket("kitchen", (event) => {
      if (event?.orderId) {
        setOrders((prev) => prev.map((o) => o.orderId === event.orderId ? { ...o, orderStatus: event.status } : o));
        if (event.status === "PENDING") fetchOrders();
      }
    });
    return () => disconnectSocket();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(apiUrl(`/orders/${orderId}/status?status=${status}`), {}, { headers: { Authorization: `Bearer ${token}` } });
      setOrders((prev) => prev.map((o) => o.orderId === orderId ? { ...o, orderStatus: status } : o));
      toast.success(`Status updated to ${status.replace(/_/g, ' ')}`);
    } catch (err) {
      toast.error(err.response?.data || "Update failed");
    }
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === "ALL") return orders;
    if (activeTab === "READY_FOR_PICKUP") {
      return orders.filter(o => o.orderStatus === "READY_FOR_PICKUP" || o.orderStatus === "ON_THE_WAY");
    }
    return orders.filter((o) => o.orderStatus === activeTab);
  }, [orders, activeTab]);

  const tabs = ["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "ALL"];

  return (
    <KitchenLayout>
      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-80">Kitchen Hub</h2>
            <h1 className={`text-4xl font-black tracking-tighter mt-1 italic ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              ORDER <span className="text-orange-500">TERMINAL.</span>
            </h1>
          </div>
          <div className={`px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${isDarkMode ? "bg-white/5 border-white/10 text-gray-400" : "bg-gray-50 border-gray-100 text-gray-500"}`}>
            Active Tickets: {filteredOrders.length}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
          {tabs.map((id) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-6 py-3 rounded-2xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all border ${
                activeTab === id
                  ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105"
                  : isDarkMode
                  ? "bg-white/5 border-white/5 text-gray-400 hover:border-white/20"
                  : "bg-white border-gray-100 text-gray-500 shadow-sm hover:border-orange-200"
              }`}
            >
              {id === "READY_FOR_PICKUP" ? "Ready / Handover" : id.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Order Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOrders.map((order) => {
            const s = getStatusDetails(order.orderStatus);
            const Icon = s.icon;

            const dFee = order.deliveryFee || 0;
            const pFee = order.platformFee || 0;
            const dishPrice = order.totalPrice - (dFee + pFee);

            const isOnline = order.paymentMode === "ONLINE";
            const isPaid = order.paymentStatus === "PAID";

            return (
              <div key={order.orderId} className={`rounded-[2.5rem] border p-8 flex flex-col justify-between transition-all hover:scale-[1.01] ${isDarkMode ? "bg-[#1c2231] border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-xl shadow-gray-200/40"}`}>
                <div>
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Order Ref</span>
                      <span className={`text-lg font-black italic tracking-tighter ${isDarkMode ? "text-white" : "text-gray-900"}`}>#{order.orderId}</span>
                    </div>

                    <div className="flex gap-3 text-right items-start">
                      {/* Payment Badge */}
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment</span>
                        {isOnline ? (
                          <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1 border ${
                            isPaid
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          }`}>
                            <CreditCard size={9} />
                            {isPaid ? "Paid" : "Unpaid"}
                          </span>
                        ) : (
                          <span className="text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                            <Banknote size={9} />
                            COD
                          </span>
                        )}
                      </div>

                      {/* Dish Price */}
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">Dish Price</span>
                        <span className="text-xl font-black text-green-500 tracking-tighter leading-none">{formatPrice(dishPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Status Badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border mb-6 ${s.class}`}>
                    <Icon size={12} /> {s.text}
                  </div>

                  {/* Kitchen Ticket Items */}
                  <div className={`mb-6 p-5 rounded-[2rem] border-2 border-dashed ${isDarkMode ? "bg-white/5 border-white/10" : "bg-orange-50/50 border-orange-100"}`}>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-orange-500 mb-3 flex items-center gap-2">
                      <UtensilsCrossed size={12} /> Items to Prepare
                    </h4>
                    <div className="space-y-3">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="bg-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded-md min-w-[28px] text-center">
                              {item.quantity}x
                            </span>
                            <p className={`text-sm font-bold tracking-tight ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                              {item.foodName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Address */}
                  <div className="space-y-4">
                    <div>
                      <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>Customer</p>
                      <p className={`text-sm font-bold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{order.customerName}</p>
                    </div>
                    <div className={`flex items-start gap-2 p-3 rounded-2xl ${isDarkMode ? "bg-white/5" : "bg-gray-50"}`}>
                      <MapPin size={14} className="text-orange-500 shrink-0 mt-0.5" />
                      <p className={`text-[11px] font-bold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="mt-8 flex flex-col gap-3">
                  {order.orderStatus === "PENDING" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.orderId, "CONFIRMED")}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                      >
                        Accept & Confirm
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.orderId, "CANCELLED")}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <XCircle size={14} /> Reject Order
                      </button>
                    </>
                  )}

                  {order.orderStatus === "CONFIRMED" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.orderId, "READY_FOR_PICKUP")}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-black font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                      >
                        Mark as Ready
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.orderId, "CANCELLED")}
                        className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <XCircle size={14} /> Cancel Order
                      </button>
                    </>
                  )}

                  {order.orderStatus === "READY_FOR_PICKUP" && (
                    <div className={`text-center py-4 rounded-2xl border border-dashed animate-pulse text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? "border-white/10 text-gray-500" : "border-gray-200 text-gray-400"}`}>
                      Waiting for Partner...
                    </div>
                  )}

                  {order.orderStatus === "ON_THE_WAY" && (
                    <button
                      onClick={() => updateOrderStatus(order.orderId, "OUT_FOR_DELIVERY")}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3"
                    >
                      <Truck size={16} /> Handover Food
                    </button>
                  )}

                  {order.orderStatus === "OUT_FOR_DELIVERY" && (
                    <div className="text-orange-500 font-black text-[10px] uppercase tracking-[0.2em] text-center py-4 flex items-center justify-center gap-3 bg-orange-500/5 rounded-2xl border border-orange-500/20">
                      <Truck size={16} /> Transit in Progress
                    </div>
                  )}

                  {order.orderStatus === "DELIVERED" && (
                    <div className="text-green-500 font-black text-[10px] uppercase tracking-[0.2em] text-center py-4 flex items-center justify-center gap-3 bg-green-500/5 rounded-2xl border border-green-500/20">
                      <CheckCircle size={16} /> Mission Completed
                    </div>
                  )}

                  {order.orderStatus === "CANCELLED" && (
                    <div className="text-red-500 font-black text-[10px] uppercase tracking-[0.2em] text-center py-4 flex items-center justify-center gap-3 bg-red-500/5 rounded-2xl border border-red-500/20">
                      <XCircle size={16} /> Order Cancelled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </KitchenLayout>
  );
}


