/* DeliveryHistory.jsx */
import React, { useEffect, useState, useContext } from "react";
import { getDeliveryHistory } from "../../Api/deliveryApi";
import toast from "react-hot-toast";
import { CheckCircle, Clock, MapPin, IndianRupee, Hash, Truck } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

export default function DeliveryHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    getDeliveryHistory()
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const totalRiderEarnings = orders.reduce((sum, order) => sum + Number(order.deliveryFee || 0), 0);

  if (loading)
    return (
      <div className="flex justify-center mt-20 italic font-black animate-pulse text-orange-500 tracking-[0.3em]">
        RETRIEVING MISSION LOGS...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-80">
            Rider Archives
          </h2>
          <h1 className={`text-4xl font-black tracking-tighter mt-1 italic ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            COMPLETED <span className="text-orange-500">DEPLOYS.</span>
          </h1>
        </div>

        <div className={`p-4 rounded-[2rem] border flex items-center gap-4 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
          <div className="bg-orange-500 p-2 rounded-xl text-black">
            <Truck size={18} strokeWidth={3} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-gray-500">Service Earnings</p>
            <p className={`text-xl font-black italic ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              ₹{totalRiderEarnings.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="p-20 rounded-[3.5rem] border-2 border-dashed text-center opacity-50">
          <Clock className="mx-auto mb-4" /> NO HISTORY FOUND
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.orderId} className={`group p-6 rounded-[2.5rem] border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-orange-500/30 ${isDarkMode ? "bg-[#1c2231] border-white/5" : "bg-white border-gray-100 shadow-sm"}`}>
              <div className="flex items-center gap-5">
                <div className="bg-green-500/10 text-green-500 p-4 rounded-2xl group-hover:bg-green-500 group-hover:text-black transition-all">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">
                      <Hash size={10} />
                      {order.orderId}
                    </span>
                    <span className={`text-xs font-bold ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      • {order.customerName}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-gray-500 italic">
                    <MapPin size={14} />
                    <p className="text-[11px] leading-tight">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:text-right border-t md:border-none pt-4 md:pt-0">
                <div className="md:hidden text-[10px] font-black text-gray-500 uppercase">Mission Data</div>

                <div className="flex flex-col md:items-end">
                  <div className={`text-xl font-black flex items-center md:justify-end gap-0.5 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    <span className="text-xs text-green-500 mr-1 font-bold">+</span>
                    <IndianRupee size={16} strokeWidth={3} className="text-green-500" />
                    {Number(order.deliveryFee || 0).toFixed(2)}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[8px] font-black px-2 py-0.5 bg-gray-500/10 rounded uppercase tracking-widest text-gray-500">
                      COD: ₹{Number(order.totalPrice || 0).toFixed(0)}
                    </p>
                    <p className="text-[9px] font-bold text-gray-500 uppercase">
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "ARCHIVED"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
