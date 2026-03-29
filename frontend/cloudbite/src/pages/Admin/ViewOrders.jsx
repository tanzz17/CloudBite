import React, { useEffect, useState, useContext } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../Api/api";
import { ThemeContext } from "../../context/ThemeContext";
import {
  FiShoppingBag,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiSearch,
  FiRefreshCcw,
} from "react-icons/fi";
import toast from "react-hot-toast";

const ViewOrders = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/all");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Order Sync Error:", err);
      toast.error("Failed to sync global orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const id = String(order.orderId ?? order.id ?? "");
    return (
      order.kitchenName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.includes(searchTerm) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-3">
              <FiShoppingBag className="text-indigo-500" />
              Global <span className="text-indigo-500">Orders</span>
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold uppercase tracking-widest opacity-50">Ledger Oversight</p>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase">
                {filteredOrders.length} Total
              </span>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Kitchen, Customer or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isDarkMode ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200"
                }`}
              />
            </div>
            <button
              onClick={fetchAllOrders}
              className={`p-4 rounded-2xl transition-all active:scale-95 ${
                isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <FiRefreshCcw className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Polling Database...</p>
          </div>
        ) : (
          <div
            className={`overflow-hidden rounded-[2.5rem] border ${
              isDarkMode ? "border-white/5 bg-[#161b29]/20 shadow-2xl" : "border-gray-100 bg-white shadow-xl shadow-indigo-500/5"
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`uppercase text-[10px] tracking-[0.2em] font-black border-b ${
                      isDarkMode ? "text-gray-500 border-white/5" : "text-gray-400 border-gray-50"
                    }`}
                  >
                    <th className="py-6 px-8">Order & Customer</th>
                    <th className="py-6 px-6">Source (Kitchen)</th>
                    <th className="py-6 px-6">Amount</th>
                    <th className="py-6 px-6">Status</th>
                    <th className="py-6 px-8 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? "divide-white/5" : "divide-gray-50"}`}>
                  {filteredOrders.map((order) => {
                    const id = order.orderId ?? order.id;
                    const shortAddress = order.deliveryAddress
                      ? `${order.deliveryAddress.substring(0, 35)}...`
                      : "N/A";

                    return (
                      <tr key={id} className="group hover:bg-indigo-500/[0.03] transition-colors cursor-default">
                        <td className="py-6 px-8">
                          <div>
                            <div className="font-black text-sm uppercase flex items-center gap-2">
                              #{id}
                              <span className="text-[10px] font-medium opacity-40 lowercase">
                                by {order.customerName || "Unknown"}
                              </span>
                            </div>
                            <div className="text-[10px] opacity-40 font-bold flex items-center gap-1 uppercase mt-1">
                              <FiMapPin size={10} className="text-indigo-500" /> {shortAddress}
                            </div>
                          </div>
                        </td>

                        <td className="py-6 px-6">
                          <div className="text-sm font-bold text-indigo-500">{order.kitchenName || "N/A"}</div>
                          <div className="text-[9px] font-black opacity-30 uppercase tracking-tighter">
                            Kitchen ID: {order.kitchenId ?? "N/A"}
                          </div>
                        </td>

                        <td className="py-6 px-6">
                          <span className="font-black text-sm tabular-nums">
                            ₹{Number(order.totalPrice ?? order.totalAmount ?? 0).toLocaleString("en-IN")}
                          </span>
                        </td>

                        <td className="py-6 px-6">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                              order.orderStatus === "DELIVERED"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : order.orderStatus === "CANCELLED"
                                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            }`}
                          >
                            {order.orderStatus === "DELIVERED" ? <FiCheckCircle /> : <FiClock />}
                            {order.orderStatus || "PENDING"}
                          </div>
                        </td>

                        <td className="py-6 px-8 text-right">
                          <div className="text-xs font-bold opacity-60">
                            {new Date(order.orderDate || Date.now()).toLocaleDateString("en-GB")}
                          </div>
                          <div className="text-[10px] opacity-30 font-black">
                            {new Date(order.orderDate || Date.now()).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="py-20 text-center">
                <p className="opacity-40 font-black uppercase tracking-[0.3em] text-xs">
                  Zero records match your criteria
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ViewOrders;
