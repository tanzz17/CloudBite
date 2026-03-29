/* KitchenDashboard.jsx */
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import KitchenLayout from "./KitchenLayout";
import api from "../../Api/api";

export default function KitchenDashboard() {
  const [kitchen, setKitchen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKitchen = async () => {
      try {
        const res = await api.get("/auth/my-kitchen");
        setKitchen(res.data);
      } catch (error) {
        console.error("Error fetching kitchen:", error);
        toast.error("Failed to fetch your kitchen details");
      } finally {
        setLoading(false);
      }
    };
    fetchKitchen();
  }, []);

  if (loading) {
    return (
      <KitchenLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-gray-500 text-lg animate-pulse">
            Loading your kitchen dashboard...
          </p>
        </div>
      </KitchenLayout>
    );
  }

  if (!kitchen) {
    return (
      <KitchenLayout>
        <div className="text-center mt-20">
          <h2 className="text-xl text-gray-700 font-semibold">
            No kitchen found for your account.
          </h2>
        </div>
      </KitchenLayout>
    );
  }

  return (
    <KitchenLayout>
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
        {/* Greeting Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-lg px-10 py-14 max-w-3xl  transition-transform hover:scale-[1.02]">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
            Welcome back,{" "}
            <span className="text-blue-600">
              {kitchen.ownerName?.split(" ")[0] || "Chef"}
            </span> 👋
          </h1>

          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            It’s wonderful to see{" "}
            <span className="font-semibold text-gray-900">{kitchen.name}</span>{" "}
            back in action! Your dedication to great taste and customer delight
            keeps <span className="text-red-600 font-semibold">CloudBite</span>{" "}
            thriving every single day. Let’s make today another day full of
            flavor, smiles, and success! 🍽️
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-1 w-12 bg-blue-500 rounded"></div>
            <p className="text-gray-500 text-sm italic">
              “Cooking is love made visible.”
            </p>
            <div className="h-1 w-12 bg-red-500 rounded"></div>
          </div>
        </div>
      </div>
    </KitchenLayout>
  );
}
