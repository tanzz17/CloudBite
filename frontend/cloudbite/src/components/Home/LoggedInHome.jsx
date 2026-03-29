// src/components/Home/LoggedInHome.jsx

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../AuthControls/AuthContext';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Reuse carousel and cloud kitchen components
import MultiItemCarousel from './MultiItemCarousel';
import CloudKitchen from './CloudKitchen';

// Optional: You can keep hero images or reuse banner if needed
import bannerImage1 from "./Banner/1.jpeg";
import bannerImage2 from "./Banner/2.jpg";
import bannerImage3 from "./Banner/3.jpg";
import bannerImage4 from "./Banner/4.jpg";

const bannerImages = [bannerImage1, bannerImage2, bannerImage3, bannerImage4];

const LoggedInHome = () => {
  const { user } = useContext(AuthContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hero slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <header className="relative w-full h-[60vh] flex items-center justify-center text-white p-4 overflow-hidden">
        {bannerImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-2000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          ></div>
        ))}
        <div className="absolute inset-0 bg-black opacity-40 z-10"></div>
        <div className="relative z-20 text-left max-w-2xl mx-auto md:ml-20">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-lg md:text-xl font-light mb-6">
            Ready to order your favorite meals?
          </p>

          <div className="relative flex flex-col sm:flex-row items-center justify-start space-y-4 sm:space-y-0 sm:space-x-4 w-full">
            <div className="relative w-full sm:w-[500px]">
              <input
                type="text"
                placeholder="Search for biryani, thali, or local favorites..."
                className="w-full p-4 pl-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 text-gray-800 shadow-md placeholder-gray-500"
              />
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 !text-xl" />
            </div>
            <button className="group w-full sm:w-auto px-4 py-4 bg-orange-500 rounded-full font-semibold hover:bg-white hover:text-orange-500 transition-colors duration-300 flex items-center justify-center space-x-2 shadow-lg">
              <span className="p-2 mr-2 rounded-full bg-white group-hover:bg-white transition-colors duration-300">
                <ArrowForwardIcon className="!text-2xl text-orange-500 group-hover:text-orange-500 transition-colors duration-300" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Cards */}
      <div className="container mx-auto px-5 py-8 mt-8 grid md:grid-cols-3 gap-6">
        <div className="p-4 bg-white shadow rounded flex flex-col justify-between">
          <h3 className="font-semibold text-lg">Recent Orders</h3>
          <p className="mt-2 text-gray-600">You have 3 orders this week.</p>
          <Link to="/orders" className="mt-3 text-orange-500 hover:underline">
            View Orders
          </Link>
        </div>

        <div className="p-4 bg-white shadow rounded flex flex-col justify-between">
          <h3 className="font-semibold text-lg">Favorite Restaurants</h3>
          <p className="mt-2 text-gray-600">You love "The Spice Hub" and "Pasta Palace".</p>
          <Link to="/favorites" className="mt-3 text-orange-500 hover:underline">
            View Favorites
          </Link>
        </div>

        <div className="p-4 bg-white shadow rounded flex flex-col justify-between">
          <h3 className="font-semibold text-lg">Recommended Meals</h3>
          <p className="mt-2 text-gray-600">Try "Grilled Chicken Salad" and "Veggie Burger Deluxe".</p>
          <Link to="/menu" className="mt-3 text-orange-500 hover:underline">
            Order Now
          </Link>
        </div>
      </div>

      {/* Top Meals Carousel */}
      <section className="mt-10">
        <h2 className="text-4xl font-light text-center mb-6">Popular Meals</h2>
        <MultiItemCarousel />
      </section>

      {/* Cloud Kitchen Section */}
      <section className="mt-10">
        <CloudKitchen />
      </section>

      {/* CTA Section */}
      <section className="bg-orange-500 text-white py-16 px-4 mt-12">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
            Ready to order?
          </h2>
          <p className="text-lg md:text-xl font-light mb-8">
            Get your favorite meals delivered right to your doorstep.
          </p>
          <Link to="/menu">
            <button className="px-8 py-4 bg-white text-orange-500 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center mx-auto space-x-2 shadow-lg">
              <span>Browse Menu</span>
              <ArrowForwardIcon className="!text-xl" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LoggedInHome;
