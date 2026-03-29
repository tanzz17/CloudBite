import React, { useEffect, useState, useContext } from "react";
import Slider from "react-slick";
import toast from "react-hot-toast";
import api from "../../Api/api";
import { SampleNextArrow, SamplePrevArrow } from "../../components/Home/Arrow";
import { ThemeContext } from "../../context/ThemeContext";

const ReOrderSlider = ({ userId }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [reorderItems, setReorderItems] = useState([]);

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchReorderItems = async () => {
      try {
        const res = await api.get(`/orders/reorder/${userId}`);
        setReorderItems(res.data);
      } catch (err) {
        console.log("Reorder fetch error:", err);
      }
    };

    if (userId) fetchReorderItems();
  }, [userId]);

  // ✅ ADD TO CART (Your Flow Based)
  const handleAddToCart = (item) => {
    toast.success("Added to cart");
    // redirect to search (matches your current system)
    window.location.href = `/search?q=${encodeURIComponent(item.dishName)}`;
  };

  // ✅ AUTOMATIC SLIDER SETTINGS
  // We check if items > 5 so the slider doesn't glitch on empty space
  const isIterable = reorderItems.length > 5;

  const settings = {
    dots: false,
    infinite: isIterable, // Only loop if there are enough items
    autoplay: isIterable, // Auto-scroll enabled
    autoplaySpeed: 1000,  // Slide every 1 second
    pauseOnHover: true,   // Stops sliding when user hovers to click
    cssEase: "linear",    // Makes the transition feel smoother
    speed: 800,           // Transition speed
    slidesToShow: 5,
    slidesToScroll: 1,    // Best for autoplay to move 1 by 1
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { 
        breakpoint: 1280, 
        settings: { 
          slidesToShow: 4, 
          infinite: reorderItems.length > 4,
          autoplay: reorderItems.length > 4 
        } 
      },
      { 
        breakpoint: 1024, 
        settings: { 
          slidesToShow: 3,
          infinite: reorderItems.length > 3,
          autoplay: reorderItems.length > 3
        } 
      },
      { 
        breakpoint: 768, 
        settings: { 
          slidesToShow: 2,
          infinite: reorderItems.length > 2,
          autoplay: reorderItems.length > 2
        } 
      },
      { 
        breakpoint: 480, 
        settings: { 
          slidesToShow: 1,
          infinite: reorderItems.length > 1,
          autoplay: reorderItems.length > 1
        } 
      },
    ],
  };

  if (!reorderItems.length) return null;

  return (
    <div className="py-6">
      {/* HEADING */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
          Re-Order
        </h2>
        <p className="text-sm text-gray-500 italic">Based on your previous orders</p>
      </div>

      {/* SLIDER */}
      <Slider {...settings} className="px-2">
        {reorderItems.map((item) => (
          <div key={item.dishId} className="px-2 outline-none">
            <div
              onClick={() => handleAddToCart(item)}
              className={`rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden border ${
                isDarkMode
                  ? "bg-[#1e2435] border-gray-700 hover:shadow-2xl hover:border-orange-500"
                  : "bg-white border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200"
              }`}
            >
              {/* IMAGE */}
              <div className="h-36 w-full overflow-hidden">
                <img
                  src={item.imageUrl || "/placeholder-food.png"}
                  alt={item.dishName}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>

              {/* INFO */}
              <div className="p-3">
                <h3 className={`font-semibold text-sm line-clamp-1 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
                  {item.dishName}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  {item.kitchenName}
                </p>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-orange-500 font-bold">
                    ₹{item.price}
                  </p>
                  <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                    Order Again
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ReOrderSlider;
