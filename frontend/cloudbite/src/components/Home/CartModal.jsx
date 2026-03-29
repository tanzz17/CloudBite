/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../Api/api";
import { resolveBackendAssetUrl } from "../../config/apiBase";

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.id;
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price || 0);

const getCartApi = async (userId) => {
  const res = await api.get(`/customers/cart/user/${userId}`);
  return res.data;
};

// IMPORTANT: backend update endpoint is PUT + foodId
const updateQuantityApi = async (userId, foodId, quantity) => {
  const res = await api.put(`/customers/cart/update/${userId}/${foodId}?quantity=${quantity}`);
  return res.data;
};

// IMPORTANT: backend remove endpoint expects cartItemId, not foodId
const removeItemApi = async (userId, cartItemId) => {
  const res = await api.delete(`/customers/cart/remove/${userId}/${cartItemId}`);
  return res.data;
};

const clearCartApi = async (userId) => {
  const res = await api.delete(`/customers/cart/clear/${userId}`);
  return res.data;
};

const getImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/300x300?text=No+Image";
  return resolveBackendAssetUrl(url) || "https://via.placeholder.com/300x300?text=No+Image";
};

export default function CartPage() {
  const userId = getUserId();
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    fetchCart();
  }, [userId]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCartApi(userId);

      const uniqueKitchens = new Set(data.items?.map((item) => item.food?.kitchen?.id));
      if (uniqueKitchens.size > 1) {
        toast.error("Your cart contains items from multiple kitchens.");
      }

      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (foodId, newQuantity) => {
    if (newQuantity <= 0) {
      const item = cart?.items?.find((i) => i.food?.id === foodId);
      if (item) await handleRemoveItem(item.id);
      return;
    }
    try {
      await updateQuantityApi(userId, foodId, newQuantity);
      fetchCart();
    } catch {
      toast.error("Failed to update quantity!");
    }
  };

  // pass cartItemId here
  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeItemApi(userId, cartItemId);
      toast.success("Item removed!");
      fetchCart();
    } catch {
      toast.error("Failed to remove item!");
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const uniqueKitchens = new Set(cart.items?.map((item) => item.food?.kitchen?.id));
    if (uniqueKitchens.size > 1) {
      toast.error("You can checkout items from only one kitchen at a time.");
      return;
    }

    navigate("/checkout");
  };

  if (loading) return null;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-gray-600">
        <ShoppingBag size={48} className="mb-3 text-gray-400" />
        <p className="text-lg font-medium mb-3">Your cart is empty.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
        >
          Explore Kitchens
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24">
      <div className="bg-white shadow-md py-4 mb-6 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-700 hover:text-green-600 transition"
          >
            <ArrowLeft size={20} className="mr-1" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 mr-4">
              <img
                src={getImageUrl(item.food?.images?.[0])}
                alt={item.food?.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900">{item.food?.name}</h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-1">
                {item.food?.description || "Tasty and freshly prepared"}
              </p>
              <p className="font-semibold text-gray-800 mt-1">
                {formatPrice(item.food?.price)}
              </p>

              <div className="flex items-center mt-2">
                <button
                  onClick={() => handleQuantityChange(item.food.id, item.quantity - 1)}
                  className="px-2 py-1 border border-gray-300 rounded-l-md hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-3 border-t border-b border-gray-300 text-gray-800">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.food.id, item.quantity + 1)}
                  className="px-2 py-1 border border-gray-300 rounded-r-md hover:bg-gray-100"
                >
                  +
                </button>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="ml-4 text-red-500 hover:text-red-600 transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl py-4 z-30">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">
              Total ({cart.items.length} items)
            </p>
            <p className="text-xl font-bold text-gray-900">
              {formatPrice(cart.totalPrice || 0)}
            </p>
          </div>
          <button
            onClick={handleCheckout}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
