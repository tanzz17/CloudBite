/* ActiveOrders.jsx */
import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MapPin,
  Package,
  CheckCircle,
  Navigation,
  Zap,
  Power,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import {
  getActiveOrders,
  updateDeliveryStatus,
  updateDeliveryLocation,
  acceptOrder,
  goOnline,
  goOffline,
  getMyDeliveryProfile,
} from "../../Api/deliveryApi";
import { connectOrderSocket, disconnectSocket } from "../../socket";
import { ThemeContext } from "../../context/ThemeContext";

export default function ActiveOrders() {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const hasConnected = useRef(false);

  const gpsWatchRef = useRef(null);
  const gpsOrderIdRef = useRef(null);
  const gpsLastSentRef = useRef(0);
  const gpsErrorShownRef = useRef(false);

  const getErrorMessage = (err) => {
    if (typeof err?.response?.data === "string") return err.response.data;
    if (err?.response?.data?.message) return err.response.data.message;
    return "Protocol error: check system logs.";
  };

  const stopGpsWatch = useCallback(() => {
    if (gpsWatchRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(gpsWatchRef.current);
    }
    gpsWatchRef.current = null;
    gpsOrderIdRef.current = null;
    gpsLastSentRef.current = 0;
    gpsErrorShownRef.current = false;
  }, []);

  const startGpsWatch = useCallback((orderId) => {
    if (!navigator.geolocation) {
      if (!gpsErrorShownRef.current) {
        toast.error("Geolocation is not supported on this device.");
        gpsErrorShownRef.current = true;
      }
      return;
    }

    // No-op if already watching same order
    if (gpsOrderIdRef.current === orderId && gpsWatchRef.current !== null) return;

    stopGpsWatch();
    gpsOrderIdRef.current = orderId;

    gpsWatchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const now = Date.now();
        if (now - gpsLastSentRef.current < 3000) return; // throttle 3s
        gpsLastSentRef.current = now;

        const { latitude, longitude, heading, speed } = pos.coords;

        try {
          await updateDeliveryLocation(orderId, {
            lat: latitude,
            lng: longitude,
            heading: heading ?? undefined,
            speed: speed ?? undefined,
          });
        } catch (err) {
          // keep silent in UI to avoid spam; debug in console
          console.error("Location update failed:", err?.response?.data || err?.message || err);
        }
      },
      (err) => {
        if (!gpsErrorShownRef.current) {
          toast.error("Location permission denied. Live tracking will be unavailable.");
          gpsErrorShownRef.current = true;
        }
        console.error("Geolocation error:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 3000,
      }
    );
  }, [stopGpsWatch]);

  const fetchInitialData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [ordersRes, profileRes] = await Promise.all([getActiveOrders(), getMyDeliveryProfile()]);
      setOrders(ordersRes.data || []);
      const currentStatus = profileRes?.data?.status;
      setIsAvailable(currentStatus === "AVAILABLE" || currentStatus === "BUSY" || currentStatus === "ONLINE");
    } catch (err) {
      console.error("Data Sync Error:", err);
      if (!isSilent) toast.error("Failed to sync with dispatch.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    if (!hasConnected.current) {
      connectOrderSocket("delivery", (event) => {
        if (event?.orderId) {
          if (event.status === "READY_FOR_PICKUP") {
            toast.success("New order available!");
            fetchInitialData(true);
          } else {
            setOrders((prev) =>
              prev.map((o) => (o.orderId === event.orderId ? { ...o, orderStatus: event.status } : o))
            );
          }
        }
      });
      hasConnected.current = true;
    }

    return () => {
      stopGpsWatch();
      if (hasConnected.current) {
        disconnectSocket();
        hasConnected.current = false;
      }
    };
  }, [fetchInitialData, stopGpsWatch]);

  // Start/stop live GPS stream based on active OUT_FOR_DELIVERY order
  useEffect(() => {
    const liveOrder = orders.find((o) => o.orderStatus === "OUT_FOR_DELIVERY");
    if (liveOrder) {
      startGpsWatch(liveOrder.orderId);
    } else {
      stopGpsWatch();
    }
  }, [orders, startGpsWatch, stopGpsWatch]);

  const handleToggleStatus = async () => {
    try {
      if (isAvailable) {
        await goOffline();
        toast.success("Shift ended");
      } else {
        await goOnline();
        toast.success("Online - Systems Ready");
      }
      fetchInitialData(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleAcceptOrder = async (orderId) => {
    if (!isAvailable) {
      toast.error("Go Online to accept missions.");
      return;
    }
    try {
      setProcessingId(orderId);
      await acceptOrder(orderId);
      toast.success("Mission Accepted!");
      setTimeout(() => navigate("../dashboard"), 400);
    } catch (err) {
      toast.error(getErrorMessage(err));
      fetchInitialData(true);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      setProcessingId(orderId);
      await updateDeliveryStatus(orderId, status);

      if (status === "DELIVERED") {
        stopGpsWatch();
        toast.success("Mission Accomplished!");
        setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
        setTimeout(() => navigate("../history"), 500);
      } else {
        toast.success(`Status updated: ${status.replace(/_/g, " ")}`);
        fetchInitialData(true);
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center mt-40">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={32} />
        <div className="italic font-black text-orange-500 tracking-[0.3em] text-[10px] uppercase">
          Synchronizing...
        </div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4">
      {/* System Status Toggle */}
      <div className={`mb-8 p-6 rounded-[2.5rem] flex items-center justify-between border transition-all duration-500 ${
        isAvailable
          ? (isDarkMode ? "bg-green-500/10 border-green-500/20" : "bg-green-50 border-green-100")
          : (isDarkMode ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-100")
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isAvailable ? "bg-green-500" : "bg-red-500"} shadow-lg`}>
            {isAvailable ? <Wifi className="text-white" size={20} /> : <WifiOff className="text-white" size={20} />}
          </div>
          <div>
            <p className={`text-[9px] font-black uppercase tracking-widest ${isAvailable ? "text-green-600" : "text-red-500"}`}>System Status</p>
            <p className={`text-lg font-black italic tracking-tighter ${isDarkMode ? "text-white" : "text-gray-900"}`}>{isAvailable ? "AVAILABLE" : "OFF DUTY"}</p>
          </div>
        </div>
        <button
          onClick={handleToggleStatus}
          className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-2 ${isAvailable ? "bg-red-500 text-white" : "bg-green-500 text-black"}`}
        >
          <Power size={14} strokeWidth={3} /> {isAvailable ? "Go Offline" : "Go Online"}
        </button>
      </div>

      <div className="mb-10">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-80">Rider Dispatch</h2>
        <h1 className={`text-4xl font-black tracking-tighter mt-1 italic ${isDarkMode ? "text-white" : "text-gray-900"}`}>CURRENT <span className="text-orange-500">TASKS.</span></h1>
      </div>

      {orders.length === 0 ? (
        <div className={`p-16 rounded-[3.5rem] border-2 border-dashed text-center ${isDarkMode ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
          <Package className="text-orange-500 mx-auto mb-6 opacity-30" size={48} />
          <p className="font-black italic text-xl tracking-tight text-orange-500">RADAR CLEAR.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isProcessing = processingId === order.orderId;
            return (
              <div key={order.orderId} className={`p-8 rounded-[3rem] border flex flex-col md:flex-row justify-between gap-8 transition-all hover:border-orange-500/20 ${isDarkMode ? "bg-[#1c2231] border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-xl"}`}>
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-500 p-3 rounded-2xl shadow-lg">
                      <Zap size={20} className="text-white fill-white" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] block">Mission ID</span>
                      <h3 className={`text-xl font-black italic tracking-tighter ${isDarkMode ? "text-white" : "text-gray-800"}`}>#{order.orderId}</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] bg-orange-500 text-black">
                      {order.orderStatus?.replace(/_/g, " ")}
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Customer</p>
                        <p className={`text-sm font-bold ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Payout</p>
                        <p className="text-sm font-black text-green-500">{"\u20B9"}{order.deliveryFee || "30.00"}</p>
                      </div>
                    </div>
                    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                      <MapPin size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] font-bold text-gray-500 leading-relaxed">{order.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center min-w-[220px]">
                  {order.orderStatus === "READY_FOR_PICKUP" && (
                    <button
                      disabled={isProcessing || !isAvailable}
                      onClick={() => handleAcceptOrder(order.orderId)}
                      className={`w-full font-black text-[10px] uppercase py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${isAvailable ? "bg-orange-500 text-black hover:bg-orange-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Navigation size={18} /> Accept Mission</>}
                    </button>
                  )}

                  {order.orderStatus === "ON_THE_WAY" && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(order.orderId, "OUT_FOR_DELIVERY")}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black text-[10px] uppercase py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><Navigation size={18} /> Start Delivery</>}
                    </button>
                  )}

                  {order.orderStatus === "OUT_FOR_DELIVERY" && (
                    <button
                      disabled={isProcessing}
                      onClick={() => handleUpdateStatus(order.orderId, "DELIVERED")}
                      className="w-full bg-green-500 hover:bg-green-600 text-black font-black text-[10px] uppercase py-5 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> Complete Drop</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}



