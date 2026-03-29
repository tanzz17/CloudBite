/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../Api/api";

export default function AvailableOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/delivery/orders/available-for-delivery");
      setOrders(res.data || []);
    } catch (err) {
      toast.error("Failed to load available orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const acceptOrder = async (orderId) => {
    try {
      await api.post(`/delivery/orders/${orderId}/accept`);
      toast.success("Order accepted");
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data || "Cannot accept order");
    }
  };

  if (loading) return <p>Loading available orders...</p>;

  return (
    <div className="max-w-3xl space-y-4">
      <h2 className="text-2xl font-bold">Available Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders ready for pickup</p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-5 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">Order #{order.orderId}</p>
              <p className="text-sm text-gray-600">
                Kitchen: {order.kitchenName || "Unknown"}
              </p>
              <p className="text-sm text-gray-600">
                Address: {order.deliveryAddress}
              </p>
            </div>

            <button
              onClick={() => acceptOrder(order.orderId)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Accept
            </button>
          </div>
        ))
      )}
    </div>
  );
}

