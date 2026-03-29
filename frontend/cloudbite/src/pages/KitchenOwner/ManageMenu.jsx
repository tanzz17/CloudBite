/* eslint-disable react-hooks/exhaustive-deps */
/* ManageMenu.jsx */
import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import KitchenLayout from "./KitchenLayout";
import { Edit, Trash2, X, Layers, Loader2 } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import api from "../../Api/api";

export default function ManageMenu() {
  const [kitchen, setKitchen] = useState(null);
  const [foods, setFoods] = useState([]);
  const [editingFood, setEditingFood] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useContext(ThemeContext);

  useEffect(() => {
    const fetchKitchen = async () => {
      try {
        const res = await api.get("/auth/my-kitchen");
        setKitchen(res.data);
      } catch {
        toast.error("Failed to load kitchen");
      }
    };
    fetchKitchen();
  }, []);

  const fetchFoods = async () => {
    if (!kitchen?.id) return;
    try {
      const res = await api.get(`/kitchen-owner/foods/${kitchen.id}`);
      setFoods(res.data || []);
    } catch {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (kitchen?.id) fetchFoods();
  }, [kitchen?.id]);

  const handleDelete = async (foodId) => {
    if (!window.confirm("Are you sure you want to delete this dish?")) return;
    try {
      await api.delete(`/kitchen-owner/foods/${kitchen.id}/${foodId}`);
      toast.success("Dish deleted successfully");
      fetchFoods();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEditClick = (food) => {
    setEditingFood(food);
    setEditData({
      name: food.name || "",
      description: food.description || "",
      price: food.price || "",
      image: food.images?.[0] || "",
      categoryName: food.categoryName || "",
      subCategoryName: food.subCategoryName || "",
      available: food.available || false,
      vegetarian: food.vegetarian || false,
      seasonal: food.seasonal || false,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "categoryName") {
      setEditData((prev) => ({ ...prev, categoryName: value, subCategoryName: "" }));
    } else {
      setEditData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        name: editData.name,
        description: editData.description,
        price: parseFloat(editData.price),
        available: editData.available,
        vegetarian: editData.vegetarian,
        seasonal: editData.seasonal,
        images: [editData.image],
        category: { name: editData.categoryName },
        subCategory: editData.subCategoryName ? { name: editData.subCategoryName } : null,
      };

      await api.put(`/kitchen-owner/foods/${kitchen.id}/${editingFood.id}`, payload);
      toast.success("Dish updated successfully!");
      setEditingFood(null);
      fetchFoods();
    } catch {
      toast.error("Update failed");
    }
  };


  return (
    <KitchenLayout>
      <div className="animate-in fade-in duration-700">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500 opacity-80">
              Catalog Control
            </h2>
            <h1 className={`text-4xl font-black tracking-tighter mt-1 italic ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              MANAGE <span className="text-orange-500">MENU.</span>
            </h1>
          </div>
          <p className={`text-xs font-bold uppercase tracking-widest opacity-50 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            {foods.length} Dishes listed
          </p>
        </div>

        {!kitchen || loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="animate-spin mb-4 text-orange-500" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Loading Pantry...
            </p>
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <Layers size={64} className="mx-auto mb-4" />
            <p className="font-black uppercase tracking-widest text-sm">
              Your menu is empty
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {foods.map((dish) => (
              <div
                key={dish.id}
                className={`group relative rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:translate-y-[-5px] ${
                  isDarkMode ? "bg-[#1c2231] border border-white/5" : "bg-white border border-gray-100 shadow-xl shadow-gray-200/50"
                }`}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={dish.images?.[0] || "https://via.placeholder.com/400x250"}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {dish.name}
                    </h3>
                    <span className="text-xl font-black italic text-orange-500">
                      ₹{dish.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      isDarkMode ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-500"
                    }`}>
                      {dish.categoryName}
                    </span>

                    {dish.subCategoryName && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-orange-100 text-orange-600">
                        {dish.subCategoryName}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditClick(dish)}
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20"
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      className="p-4 rounded-2xl text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ FULL EDIT MODAL */}
      {editingFood && (
        <div className="fixed inset-0 bg-[#0b0f1a]/80 backdrop-blur-xl flex justify-center items-center z-[100] p-4">
          <div className={`w-full max-w-xl rounded-[3rem] p-10 relative border ${
            isDarkMode ? "bg-[#1c2231] border-white/10 text-white" : "bg-white border-gray-100 text-gray-900"
          }`}>

            <button onClick={() => setEditingFood(null)} className="absolute top-8 right-8">
              <X size={24} />
            </button>

            <h2 className="text-3xl font-black tracking-tighter italic mb-8">
              EDIT <span className="text-orange-500">DISH.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Name */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2 block">
                  Dish Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  className="w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2 block">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500"
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2 block">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={editData.price}
                  onChange={handleEditChange}
                  className="w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500"
                />
              </div>

              {/* Image */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2 block">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={editData.image}
                  onChange={handleEditChange}
                  className="w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2 block">
                  Category
                </label>
                <select
                  name="categoryName"
                  value={editData.categoryName}
                  onChange={handleEditChange}
                  className="w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500"
                >
                  <option value="">Select Category</option>
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

              {/* SubCategory dynamic */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-2 block">
                  Sub Category
                </label>
                <select
  name="subCategoryName"
  value={editData.subCategoryName}
  onChange={handleEditChange}
  className="w-full p-4 rounded-2xl text-sm font-bold border outline-none focus:border-orange-500"
>
  <option value="">Select SubCategory</option>

  {editData.categoryName === "Breakfast" && (
    <>
      <option value="South Indian">South Indian</option>
      <option value="Maharashtrian">Maharashtrian</option>
    </>
  )}

  {editData.categoryName === "Main Course" && (
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

  {editData.categoryName === "Chinese" && (
    <>
      <option value="Veg Starters">Veg Starters</option>
      <option value="Non-Veg Starters">Non-Veg Starters</option>
      <option value="Noodles">Noodles</option>
      <option value="Fried Rice">Fried Rice</option>
    </>
  )}

  {editData.categoryName === "Thali" && (
    <>
      <option value="Veg Thali">Veg Thali</option>
      <option value="Non-Veg Thali">Non-Veg Thali</option>
    </>
  )}
</select>

              </div>

              {/* Toggles */}
              <div className="md:col-span-2 flex gap-6 pt-4">
                <label><input type="checkbox" name="available" checked={editData.available} onChange={handleEditChange}/> Available</label>
                <label><input type="checkbox" name="vegetarian" checked={editData.vegetarian} onChange={handleEditChange}/> Vegetarian</label>
                <label><input type="checkbox" name="seasonal" checked={editData.seasonal} onChange={handleEditChange}/> Seasonal</label>
              </div>

            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setEditingFood(null)} className="flex-1 py-4 rounded-2xl bg-gray-200 font-black text-[10px] uppercase tracking-widest">
                Discard
              </button>
              <button onClick={handleSaveEdit} className="flex-1 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-black font-black text-[10px] uppercase tracking-widest">
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </KitchenLayout>
  );
}
