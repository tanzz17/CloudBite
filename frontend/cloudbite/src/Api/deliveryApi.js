import api from "./api";

// Profile
export const getMyDeliveryProfile = () =>
  api.get("/delivery/me");

// Online / Offline
export const goOnline = () =>
  api.put("/delivery/online");

export const goOffline = () =>
  api.put("/delivery/offline");

// Orders
export const getActiveOrders = () =>
  api.get("/delivery/orders/active");

export const updateDeliveryStatus = (orderId, status) =>
  api.put(`/delivery/orders/${orderId}/status?status=${status}`);

export const updateDeliveryLocation = (orderId, { lat, lng, heading, speed }) => {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });

  if (heading !== undefined && heading !== null) params.append("heading", String(heading));
  if (speed !== undefined && speed !== null) params.append("speed", String(speed));

  return api.put(`/delivery/orders/${orderId}/location?${params.toString()}`);
};

export const getDeliveryHistory = () =>
  api.get("/delivery/orders/history");

export const acceptOrder = (orderId) =>
  api.post(`/delivery/orders/${orderId}/accept`);
