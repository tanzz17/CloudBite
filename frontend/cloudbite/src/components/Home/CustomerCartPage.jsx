/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Zap,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
import api from "../../Api/api";
import { resolveBackendAssetUrl } from "../../config/apiBase";

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.id;
};

const getCartApi = async (userId) => {
  const res = await api.get(`/customers/cart/user/${userId}`);
  return res.data;
};

const updateQuantityApi = async (userId, foodId, quantity) => {
  const res = await api.put(`/customers/cart/update/${userId}/${foodId}?quantity=${quantity}`);
  return res.data;
};

const addToCartApi = async (userId, foodId, quantity = 1) => {
  const res = await api.post(`/customers/cart/add/${userId}/${foodId}?quantity=${quantity}`);
  return res.data;
};

const removeItemApi = async (userId, cartItemId) => {
  const res = await api.delete(`/customers/cart/remove/${userId}/${cartItemId}`);
  return res.data;
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price || 0);

const getImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/100x100?text=No+Image";
  return resolveBackendAssetUrl(url) || "https://via.placeholder.com/100x100?text=No+Image";
};

export default function CustomerCartPage() {
  const userId = getUserId();
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [addOns, setAddOns] = useState([]);
  const [addOnsLoading, setAddOnsLoading] = useState(false);
  const [addOnsSourceName, setAddOnsSourceName] = useState("");

  const fetchAddOns = async (foodId, foodName) => {
    if (!foodId) {
      setAddOns([]);
      setAddOnsSourceName("");
      return;
    }
    setAddOnsLoading(true);
    try {
      const res = await api.get(`/public/foods/${foodId}/addons?limit=4`);
      setAddOns(res.data || []);
      setAddOnsSourceName(foodName || "this dish");
    } catch {
      setAddOns([]);
      setAddOnsSourceName("");
    } finally {
      setAddOnsLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const data = await getCartApi(userId);
      setCart(data || { items: [], totalPrice: 0 });
      const firstItem = data?.items?.[0];
      if (firstItem?.foodId) {
        fetchAddOns(firstItem.foodId, firstItem.foodName);
      } else {
        setAddOns([]);
        setAddOnsSourceName("");
      }
    } catch {
      toast.error("Error loading cart!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }
    fetchCart();
  }, [userId]);

  const handleQuantityChange = async (item, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        await handleRemove(item.id, item.foodName);
      } else {
        await updateQuantityApi(userId, item.foodId, newQuantity);
      }
      fetchCart();
    } catch {
      toast.error("Update failed.");
    }
  };

  const handleRemove = async (itemId, foodName) => {
    try {
      await removeItemApi(userId, itemId);
      toast.success(`${foodName || "Item"} removed.`);
      fetchCart();
    } catch {
      toast.error("Remove failed.");
    }
  };

  const handleAddOn = async (food) => {
    try {
      await addToCartApi(userId, food.id, 1);
      toast.success(`${food.name} added`);
      fetchCart();
    } catch {
      toast.error("Failed to add recommendation.");
    }
  };

  if (loading) return null;

  const cartItemCount = cart.items?.length || 0;
  const cartTotal = cart.totalPrice ?? cart.total ?? 0;

  return (
    <div className={`min-h-screen pb-40 transition-colors duration-500 ${isDarkMode ? "bg-[#0b0f1a] text-white" : "bg-gray-50 text-gray-900"}`}>
      <header className={`fixed top-0 left-0 right-0 z-40 border-b backdrop-blur-md transition-colors ${isDarkMode ? "bg-[#0b0f1a]/90 border-white/5" : "bg-white/90 border-gray-100"}`}>
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between mt-20">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-orange-500 transition-colors">
            <ArrowLeft size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black italic tracking-tighter">ORDER TERMINAL</h1>
            <p className="text-[9px] font-bold text-orange-500 uppercase tracking-[0.3em]">
              {cartItemCount} Verified Items
            </p>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-32 mt-20">
        {cartItemCount > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className={`flex items-center p-5 rounded-[2rem] border transition-all ${isDarkMode ? "bg-[#161b29] border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-xl shadow-gray-200/40"}`}>
                  <img src={getImageUrl(item.foodImage)} alt={item.foodName} className="w-20 h-20 object-cover rounded-[1.5rem] mr-5" />
                  <div className="flex-1">
                    <h3 className="font-black italic tracking-tighter text-lg leading-tight">{item.foodName}</h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                      {formatPrice(item.priceAtAddition)} per unit
                    </p>
                    <div className={`flex items-center mt-3 rounded-xl w-fit border overflow-hidden ${isDarkMode ? "border-white/10" : "border-gray-100"}`}>
                      <button onClick={() => handleQuantityChange(item, item.quantity - 1)} className="p-2 hover:bg-orange-500 hover:text-white transition-colors"><Minus size={14} /></button>
                      <span className="px-4 text-xs font-black">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className="p-2 hover:bg-orange-500 hover:text-white transition-colors"><Plus size={14} /></button>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <p className="font-black text-xl italic tracking-tighter text-orange-500">{formatPrice(item.totalPrice)}</p>
                    <button onClick={() => handleRemove(item.id, item.foodName)} className="text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}

              {cartItemCount > 0 && (
                <div className={`mt-6 p-6 rounded-[2.5rem] border ${isDarkMode ? "bg-[#121827] border-white/5" : "bg-white border-gray-100 shadow-xl shadow-gray-200/30"}`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Add-ons</p>
                      <h3 className="text-lg font-black italic tracking-tighter">
                        Pair with {addOnsSourceName || "your dish"}
                      </h3>
                      <p className="text-xs text-gray-500">Handpicked items that go well together.</p>
                    </div>
                  </div>

                  {addOnsLoading ? (
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">Loading recommendations...</div>
                  ) : addOns.length === 0 ? (
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">No add-ons found yet.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addOns.map((food) => (
                        <div key={food.id} className={`flex gap-4 p-4 rounded-2xl border ${isDarkMode ? "bg-[#0f1524] border-white/5" : "bg-gray-50 border-gray-100"}`}>
                          <img
                            src={getImageUrl(food.images?.[0])}
                            alt={food.name}
                            className="w-20 h-20 rounded-2xl object-cover"
                          />
                          <div className="flex-1 flex flex-col">
                            <h4 className="font-black text-sm tracking-tight line-clamp-1">{food.name}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                              {food.description || "Chef recommended pairing for your order."}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-sm font-black text-orange-500">{formatPrice(food.price)}</span>
                              <button
                                onClick={() => handleAddOn(food)}
                                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className={`p-8 rounded-[2.5rem] sticky top-32 border ${isDarkMode ? "bg-[#161b29] border-white/5" : "bg-white border-gray-100 shadow-2xl shadow-gray-200/50"}`}>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-gray-500">Bill Summary</h2>
                <div className="space-y-4 border-b border-dashed border-gray-700 pb-6 mb-6">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-70">
                    <span>Item Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-70">
                    <span>Delivery Fee</span>
                    <span className="text-orange-500">FREE</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <span className="text-sm font-black italic uppercase tracking-tighter">To Pay</span>
                  <span className="text-3xl font-black italic tracking-tighter text-orange-500">{formatPrice(cartTotal)}</span>
                </div>
                <button onClick={() => navigate("/checkout")} className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-orange-500/20 active:scale-95">
                  <CreditCard size={20} /> CHECKOUT
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 flex flex-col items-center">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`}>
              <ShoppingBag size={48} className="text-gray-400 opacity-20" />
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter mb-4 uppercase">Terminal is Empty</h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em] mb-10 max-w-xs leading-loose">
              No flavors detected in your current session.
            </p>
            <button onClick={() => navigate("/")} className="bg-orange-500 text-white font-black px-10 py-4 rounded-2xl tracking-widest text-xs uppercase shadow-xl hover:-translate-y-1 transition-all">
              Browse Neighborhood Hub
            </button>
          </div>
        )}
      </main>

      {cartItemCount > 0 && (
        <div className="fixed bottom-10 left-0 right-0 z-30 flex justify-center px-6 md:hidden">
          <button onClick={() => navigate("/checkout")} className="w-full bg-orange-500 text-white p-5 rounded-2xl font-black italic flex items-center justify-between shadow-2xl">
            <span className="flex items-center gap-2 tracking-tighter text-xl"><Zap size={20} /> {formatPrice(cartTotal)}</span>
            <span className="uppercase text-[10px] tracking-widest font-black flex items-center gap-2">Proceed <ArrowRight size={14} /></span>
          </button>
        </div>
      )}
    </div>
  );
}
