/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-empty */
/* KitchenMenuPage.jsx */
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ShoppingCart, ArrowLeft, ArrowRight, MapPin, Zap, Info } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import api from "../../Api/api";
import { resolveBackendAssetUrl } from "../../config/apiBase";

const getUserId = () => JSON.parse(localStorage.getItem("user"))?.id;

const addToCartApi = async (userId, foodId, quantity = 1) =>
  (await api.post(`/customers/cart/add/${userId}/${foodId}?quantity=${quantity}`)).data;

const getCartApi = async (userId) =>
  (await api.get(`/customers/cart/user/${userId}`)).data;

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price || 0);

const getImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/300x300?text=No+Image";
  return resolveBackendAssetUrl(url) || "https://via.placeholder.com/300x300?text=No+Image";
};

const MenuItemCard = ({ item, onAddToCart, isDarkMode }) => {
  const isVeg = item.vegetarian;
  return (
    <div className={`flex rounded-[2rem] border p-6 mb-6 justify-between items-center transition-all duration-300 hover:scale-[1.01] ${
      isDarkMode ? "bg-[#1c2231] border-white/5 shadow-2xl" : "bg-white border-gray-100 shadow-xl shadow-gray-200/40"
    }`}>
      <div className="flex-grow flex flex-col justify-between pr-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-3 h-3 rounded-full border flex items-center justify-center ${isVeg ? "border-green-500" : "border-red-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? "bg-green-500" : "bg-red-500"}`}></span>
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isVeg ? "text-green-500" : "text-red-500"}`}>
              {isVeg ? "Pure Veg" : "Non-Veg"}
            </span>
          </div>
          <h3 className={`text-xl font-black italic tracking-tighter mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {item.name}
          </h3>
          <p className={`text-xs font-medium leading-relaxed line-clamp-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            {item.description || "Authentic local flavor prepared fresh in our cloud kitchen."}
          </p>
        </div>
        <div className="flex justify-between items-center mt-6">
          <span className={`text-xl font-black tracking-tighter ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {formatPrice(item.price)}
          </span>
          <button
            onClick={() => onAddToCart(item)}
            className={`px-6 py-2 rounded-xl text-xs font-black tracking-[0.1em] transition-all border shadow-lg active:scale-95 ${
              isDarkMode
                ? "bg-orange-500 border-orange-500 text-white shadow-orange-500/20"
                : "bg-white border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
            }`}
          >
            ADD
          </button>
        </div>
      </div>

      <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 relative rounded-[1.5rem] overflow-hidden shadow-inner bg-gray-100">
        <img src={getImageUrl(item.images?.[0])} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
      </div>
    </div>
  );
};

// --- Main Kitchen Menu Page ---
export default function KitchenMenuPage() {
  const { kitchenId } = useParams();
  const navigate = useNavigate();
  const userId = getUserId();
  const { isDarkMode } = useContext(ThemeContext);

  const [kitchen, setKitchen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [filterCategory, setFilterCategory] = useState("All");

  const cartItemsCount = cart.items?.reduce((t, i) => t + i.quantity, 0) || 0;
  const cartTotal = cart.totalPrice ?? cart.total ?? 0;

  useEffect(() => {
    const fetchKitchenData = async () => {
      try {
        const [resKitchen, resMenu] = await Promise.all([
          api.get(`/kitchens/${kitchenId}`),
          api.get(`/kitchen/${kitchenId}`),
        ]);
        setKitchen(resKitchen.data);
        setMenuItems(resMenu.data || []);
      } catch {
        toast.error("Network Error: Verification failed.");
      } finally {
        setLoading(false);
      }
    };
    fetchKitchenData();
  }, [kitchenId]);

  useEffect(() => {
    if (userId) fetchCartData();
  }, [userId]);

  const fetchCartData = async () => {
    try {
      const data = await getCartApi(userId);
      setCart(data || { items: [], totalPrice: 0 });
    } catch {}
  };

  const handleAddToCart = async (item) => {
    if (!userId) return toast.error("Please login to the Tribe first!");

    if (cart.items && cart.items.length > 0) {
      const existingKitchenId = cart.items[0]?.food?.kitchen?.id || cart.items[0]?.kitchenId;
      if (existingKitchenId && existingKitchenId != kitchenId) {
        const confirmClear = window.confirm(
          "Single Kitchen Policy: Your cart contains items from another kitchen. Clear cart to add this item?"
        );
        if (confirmClear) {
          try {
            await api.delete(`/customers/cart/clear/${userId}`);
            await addToCartApi(userId, item.id, 1);
            toast.success("Cart cleared and item added!");
            fetchCartData();
          } catch {
            toast.error("Failed to reset cart.");
          }
        }
        return;
      }
    }

    try {
      await addToCartApi(userId, item.id, 1);
      toast.success(`${item.name} added!`);
      fetchCartData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add item.");
    }
  };

  const filteredItems = menuItems.filter((item) =>
    filterCategory === "All" ? true : filterCategory === "Veg" ? item.vegetarian : !item.vegetarian
  );

  if (loading) return (
    <div className={`min-h-screen flex flex-col justify-center items-center ${isDarkMode ? "bg-[#0b0f1a]" : "bg-gray-50"}`}>
        <div className="flex italic font-black animate-pulse text-orange-500 tracking-[0.3em] uppercase">Opening Menu...</div>
    </div>
  );

  return (
    <div className={`min-h-screen pb-32 mt-16 transition-colors duration-500 ${isDarkMode ? "bg-[#0b0f1a] text-white" : "bg-gray-50 text-gray-900"}`}>
      
      {/* --- Kitchen Header --- */}
      <div className={`sticky top-0 z-30 pt-8 pb-10 border-b backdrop-blur-md ${isDarkMode ? "bg-[#0b0f1a]/80 border-white/5" : "bg-white/80 border-gray-100"}`}>
        <div className="max-w-5xl mx-auto px-6">
          <button onClick={() => navigate(-1)} className={`mb-6 flex items-center text-[10px] font-black uppercase tracking-widest gap-2 opacity-60 hover:opacity-100 transition-opacity`}>
            <ArrowLeft size={14} /> Back to Hub
          </button>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] overflow-hidden border-4 border-orange-500 shadow-2xl shadow-orange-500/20">
                <img src={getImageUrl(kitchen?.logoUrl || kitchen?.images?.[0])} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-80 mb-2">Verified Kitchen</h2>
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-3 leading-none">{kitchen?.name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center opacity-70">
                    <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <MapPin size={12} className="text-orange-500" /> {kitchen?.address}
                    </p>
                    <span className="hidden md:inline text-gray-500">•</span>
                    <p className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <Info size={12} className="text-orange-500" /> {kitchen?.description?.substring(0, 45)}...
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Filter & Menu --- */}
      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="flex gap-3 mb-12 overflow-x-auto pb-2 no-scrollbar">
            {["All", "Veg", "Non-Veg"].map((cat) => (
                <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        filterCategory === cat 
                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" 
                        : isDarkMode ? "bg-white/5 border-white/5 text-gray-400" : "bg-white border-gray-100 text-gray-500"
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
            {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} isDarkMode={isDarkMode} />
                ))
            ) : (
                <div className="text-center py-20 opacity-50 font-black uppercase tracking-widest text-xs italic">
                    No items available in this category.
                </div>
            )}
        </div>
      </div>

      {/* --- Floating Cart Action Bar --- */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-8 left-0 right-0 z-40 px-6">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => navigate("/customer/cart")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black p-6 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-orange-500/40 transition-transform active:scale-95"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-2 rounded-xl">
                    <Zap size={20} className="fill-white" />
                </div>
                <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 text-left">Checkout Required</p>
                    <p className="text-lg font-black italic tracking-tighter leading-none">{cartItemsCount} Items • {formatPrice(cartTotal)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                Review Cart <ArrowRight size={18} />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}