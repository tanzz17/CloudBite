/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-empty */
/* DishSearch.jsx */
import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Utensils, Zap, ArrowRight, XCircle, ChevronLeft, FastForward } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../Api/api";
import { resolveBackendAssetUrl } from "../../config/apiBase";

const getUserId = () => JSON.parse(localStorage.getItem("user"))?.id;

const addToCartApi = async (userId, foodId, quantity = 1) =>
  (await api.post(`/customers/cart/add/${userId}/${foodId}?quantity=${quantity}`)).data;

const getCartApi = async (userId) =>
  (await api.get(`/customers/cart/user/${userId}`)).data;

const DishCard = ({ dish, onAddToCart }) => {
  const navigate = useNavigate();
  const imageUrl =
    resolveBackendAssetUrl(dish.images?.[0]) || "https://via.placeholder.com/400x300?text=Delicious+Dish";
  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);

  return (
    <div
      onClick={() => dish.kitchenId && navigate(`/kitchen/${dish.kitchenId}`)}
      className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-gray-100 cursor-pointer flex flex-col h-full"
    >
      <div className="relative w-full h-52 overflow-hidden">
        <img src={imageUrl} alt={dish.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <span className={`absolute top-4 right-4 text-[10px] font-black tracking-widest px-3 py-1 rounded-full shadow-lg backdrop-blur-md ${
          dish.vegetarian ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
        }`}>
          {dish.vegetarian ? "VEG" : "NON-VEG"}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-black text-gray-800 line-clamp-1 group-hover:text-orange-600 transition-colors">{dish.name}</h3>
        <p className="text-xs font-bold text-orange-500 flex items-center mb-3 uppercase tracking-widest">
          <Utensils className="w-3 h-3 mr-1" /> {dish.kitchenName}
        </p>
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-grow leading-relaxed">{dish.description}</p>

        <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-4">
          <span className="text-2xl font-black text-gray-900 tracking-tighter">{formatPrice(dish.price)}</span>
          <button
            disabled={!dish.available}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(dish);
            }}
            className={`h-11 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-90 ${
              dish.available ? "bg-orange-500 text-white shadow-orange-200 hover:bg-orange-600" : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {dish.available ? (
              <>
                <Zap size={14} fill="currentColor" /> Add
              </>
            ) : (
              "Sold Out"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const DishSearch = () => {
  const searchInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });

  const userId = getUserId();
  const navigate = useNavigate();

  const cartItemsCount = cart.items?.reduce((t, i) => t + i.quantity, 0) || 0;
  const cartTotal = cart.totalPrice ?? cart.total ?? 0;

  const fetchCartData = async () => {
    if (!userId) return;
    try {
      const data = await getCartApi(userId);
      setCart(data || { items: [], totalPrice: 0 });
    } catch {}
  };

  const fetchResults = async (query) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/public/search/dishes?q=${encodeURIComponent(trimmedQuery)}`);
      setResults(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError("Server disconnected.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchTerm(query);
    const timer = setTimeout(() => fetchResults(query), 300);
    return () => clearTimeout(timer);
  }, [searchParams]);

  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
    fetchCartData();
  }, []);

  const handleAddToCart = async (dish) => {
    if (!userId) return toast.error("Login to order!");

    if (cart.items?.length > 0) {
      const existingKitchenId = cart.items[0]?.food?.kitchen?.id || cart.items[0]?.kitchenId;
      if (existingKitchenId && existingKitchenId != dish.kitchenId) {
        toast.error("Clear your cart to order from another kitchen!");
        return;
      }
    }

    try {
      await addToCartApi(userId, dish.id, 1);
      toast.success("Added to your feast!");
      fetchCartData();
    } catch {
      toast.error("Failed to add.");
    }
  };


  return (
    <div className="min-h-screen bg-[#fafbfc] pb-32 mt-20">
      {/* --- Sticky Glass Header with Back Button --- */}
      <div className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-gray-100 pt-10 pb-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <button 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold transition-all bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
            >
                <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
            </button>

            <div className="flex-1 w-full relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="What's on your mind today?"
                    value={searchTerm}
                    onChange={(e) => setSearchParams({ q: e.target.value })}
                    className="w-full pl-14 pr-14 py-5 bg-white rounded-3xl shadow-inner border-2 border-transparent focus:border-orange-500/20 focus:outline-none text-xl font-medium placeholder-gray-300 transition-all"
                />
                {searchTerm && (
                    <button onClick={() => setSearchParams({})} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors">
                        <XCircle size={24} />
                    </button>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl mt-12">
        {/* --- Dynamic Content --- */}
        {!searchTerm && (
            <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="mb-6 inline-flex p-4 bg-orange-50 rounded-full text-orange-500">
                    <FastForward size={48} />
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Ready to explore?</h2>
                <p className="text-gray-400 font-medium">Type your favorite dish or browse trending cuisines below.</p>
                
                <div className="mt-10 flex flex-wrap justify-center gap-3">
                    {["Paneer", "Thali", "Momos", "Pizza", "Biryani"].map(tag => (
                        <button 
                            key={tag}
                            onClick={() => setSearchParams({ q: tag })}
                            className="px-6 py-2 bg-white rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm"
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center py-20">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                <Utensils className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" />
            </div>
            <p className="font-black text-orange-600 mt-6 animate-pulse tracking-widest uppercase text-xs">Cooking up results...</p>
          </div>
        )}

        {error && <div className="text-center p-8 bg-red-50 text-red-600 rounded-[2rem] font-bold border border-red-100">{error}</div>}

        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in slide-in-from-bottom-10 duration-700">
            {results.map(dish => (
              <DishCard key={dish.id} dish={dish} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}

        {!isLoading && searchTerm.length >= 2 && results.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] shadow-xl border border-gray-50 max-w-2xl mx-auto">
            <span className="text-6xl mb-6 block">🥡</span>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No matching dishes</h3>
            <p className="text-gray-400">Our chefs are talented, but they don't have this yet!</p>
          </div>
        )}
      </div>

      {/* --- Swiggy Style Floating Cart Pill --- */}
      {cartItemsCount > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50">
          <button
            onClick={() => navigate("/customer/cart")}
            className="w-full bg-[#60b246] text-black p-5 rounded-3xl flex items-center justify-between shadow-[0_20px_50px_rgba(96,178,70,0.4)] hover:scale-[1.02] transition-all active:scale-95 group"
          >
            <div className="flex flex-col items-start border-r border-white/20 pr-6">
              <span className="text-[10px] font-white uppercase tracking-[0.2em] opacity-80 leading-none mb-1">
                {cartItemsCount} {cartItemsCount === 1 ? 'Item' : 'Items'} Added
              </span>
              <span className="text-xl font-black">₹{cartTotal}</span>
            </div>
            <div className="flex items-center gap-2 font-black italic tracking-tighter text-lg">
              VIEW CART 
              <div className="bg-white/20 p-2 rounded-xl group-hover:translate-x-2 transition-transform">
                <ArrowRight size={20} />
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default DishSearch;