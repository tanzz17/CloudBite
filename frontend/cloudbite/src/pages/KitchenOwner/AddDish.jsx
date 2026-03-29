/* AddDish.jsx */
import React, { useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import KitchenLayout from "./KitchenLayout";
import api from "../../Api/api";
import { PlusCircle, Image as ImageIcon, IndianRupee, Tag, Info } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.message) return data.message;
  if (data.error) return data.error;
  return fallback;
};
export default function AddDish(){
  const { isDarkMode } = useContext(ThemeContext);
  const [kitchen, setKitchen] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    subCategory: "",
    available: true,
    vegetarian: false,
    seasonal: false,
  });

  useEffect(() => {
    const fetchKitchen = async () => {
      try {
        const res = await api.get("/auth/my-kitchen");
        setKitchen(res.data);
      } catch (err) {
        console.error("Error fetching kitchen:", err);
      }
    };
    fetchKitchen();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!kitchen) {
      toast.error("Kitchen not found. Please try again.");
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        available: formData.available,
        vegetarian: formData.vegetarian,
        seasonal: formData.seasonal,
        images: [formData.image],
        category: { name: formData.category },
        subCategory: formData.subCategory ? { name: formData.subCategory } : null,
      };

      await api.post(`/kitchen-owner/add-item/${kitchen.id}`, payload);

      toast.success("Dish added to the tribe!");
      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        category: "",
        subCategory: "",
        available: true,
        vegetarian: false,
        seasonal: false,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add dish"));
    }
  };

  return (
    <KitchenLayout>
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header section */}
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-80">
            Catalog Expansion
          </h2>
          <h1 className={`text-4xl font-black tracking-tighter mt-1 italic ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            ADD NEW <span className="text-orange-500">DISH.</span>
          </h1>
        </div>

        {/* Main Form Container */}
        <div className={`p-8 md:p-12 rounded-[3rem] border ${
          isDarkMode
            ? "bg-[#1c2231] border-white/5"
            : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"
        }`}>

          <form onSubmit={handleSubmit} className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Dish Name */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">
                  <Tag size={12} /> Dish Identity
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="E.g. Smoked Butter Chicken"
                  className={`w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500 transition-all ${
                    isDarkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-100"
                  }`}
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">
                  <Info size={12} /> Flavor Profile
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  required
                  placeholder="Describe the taste, ingredients, and soul of the dish..."
                  className={`w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500 transition-all ${
                    isDarkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-100"
                  }`}
                ></textarea>
              </div>

              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">
                  <IndianRupee size={12} /> Pricing
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  placeholder="299"
                  className={`w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500 transition-all ${
                    isDarkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-100"
                  }`}
                />
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">
                  <Layers size={12} /> Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className={`w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer ${
                    isDarkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Thali">Thali</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Sandwiches">Sandwiches</option>
                  <option value="Pizzas">Pizzas</option>
                  <option value="Momos">Momos</option>
                  <option value="Wraps & Rolls">Wraps & Rolls</option>
                </select>
              </div>

              {/* SubCategory */}
              <div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">
                  <Layers size={12} /> Sub Category (Optional)
                </label>
                <select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  
                  className={`w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer ${
                    isDarkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <option value="">Select Sub Category (Optional)</option>

                  {formData.category === "Breakfast" && (
                    <>
                      <option value="South Indian">South Indian</option>
                      <option value="Maharashtrian">Maharashtrian</option>
                    </>
                  )}

                  {formData.category === "Main Course" && (
                    <>
                      <option value="Veg Starters">Veg Starters</option>
                      <option value="Non-Veg Starters">Non-Veg Starters</option>
                      <option value="Veg Main Course">Veg Main Course</option>
                      <option value="Non-Veg Main Course">Non-Veg Main Course</option>
                      <option value="Breads">Breads</option>
                      <option value="Veg Rice">Veg Rice</option>
                      <option value="Non-Veg Rice">Non-Veg Rice</option>
                    </>
                  )}

                  {formData.category === "Chinese" && (
                    <>
                      <option value="Veg-Straters">Veg-Straters</option>
                      <option value="Non-Veg Starters">Non-Veg Starters</option>
                      <option value="Noodles">Noodles</option>
                      <option value="Fried Rice">Fried Rice</option>
                    </>
                  )}

                  {formData.category === "Thali" && (
                    <>
                      <option value="Veg Thali">Veg Thali</option>
                      <option value="Non-Veg Thali">Non-Veg Thali</option>
                    </>
                  )}
                </select>
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">
                  <ImageIcon size={12} /> Visual Link (URL)
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  placeholder="https://images.unsplash.com/your-dish-url"
                  className={`w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500 transition-all ${
                    isDarkMode ? "bg-white/5 border-white/5 text-white" : "bg-gray-50 border-gray-100"
                  }`}
                />
              </div>
            </div>

            {/* Status Toggles Section */}
            <div className={`p-6 rounded-3xl border flex flex-wrap gap-8 ${
              isDarkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
            }`}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} className="accent-orange-500 w-5 h-5 cursor-pointer" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>Live on Menu</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="vegetarian" checked={formData.vegetarian} onChange={handleChange} className="accent-green-500 w-5 h-5 cursor-pointer" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>Vegetarian</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="seasonal" checked={formData.seasonal} onChange={handleChange} className="accent-blue-500 w-5 h-5 cursor-pointer" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>Seasonal Special</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-black text-xs uppercase tracking-[0.2em] py-6 rounded-[2rem] shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              <PlusCircle size={20} /> Deploy to Menu
            </button>

          </form>
        </div>
      </div>
    </KitchenLayout>
  );
}

const Layers = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);


