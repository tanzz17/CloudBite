import React, { useEffect, useState } from "react";
import api from "../../Api/api";
import toast from "react-hot-toast";
import { User, MapPin, Phone, Mail, Edit, Save, X } from "lucide-react";

export default function CustomerInfo() {
  const [customer, setCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    place: "",
    postalCode: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return toast.error("No user found. Please login again.");

    const { email, id: userId } = storedUser;

    api
      .get("/customers/profile", { params: { email, userId } })
      .then((res) => {
        setCustomer(res.data);
        setFormData(res.data);
      })
      .catch(() => toast.error("Failed to fetch customer profile"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) return toast.error("User not found");

      const userId = storedUser.id;
      const res = await api.put(`/customers/update/${userId}`, formData);
      setCustomer(res.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-[#1c1c1e] rounded-2xl shadow-lg p-8 max-w-3xl mx-auto border border-gray-300 dark:border-gray-700 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <User className="text-orange-500" size={30} />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            My Account Details
          </h2>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            <Edit size={16} /> Edit
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Save size={16} /> Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(customer);
              }}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              <X size={16} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2d] text-gray-900 dark:text-gray-100 placeholder-gray-500 ${
              !isEditing && "opacity-80"
            }`}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-[#2a2a2d] text-gray-700 dark:text-gray-200">
            <Mail size={16} />
            <span>{formData.email}</span>
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone
              size={16}
              className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-300"
            />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2d] text-gray-900 dark:text-gray-100 ${
                !isEditing && "opacity-80"
              }`}
            />
          </div>
        </div>

        {/* Place */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City / Place
          </label>
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2d] text-gray-900 dark:text-gray-100 ${
              !isEditing && "opacity-80"
            }`}
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address
          </label>
          <div className="relative">
            <MapPin
              size={16}
              className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-300"
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full pl-10 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2d] text-gray-900 dark:text-gray-100 ${
                !isEditing && "opacity-80"
              }`}
            />
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Postal Code
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            disabled={!isEditing}
            className={`w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2d] text-gray-900 dark:text-gray-100 ${
              !isEditing && "opacity-80"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
