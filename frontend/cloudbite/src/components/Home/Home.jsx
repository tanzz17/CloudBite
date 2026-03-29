import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SpeedIcon from '@mui/icons-material/Speed';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import bannerImage1 from "./Banner/1.jpeg";
import bannerImage2 from "./Banner/2.jpg";
import bannerImage3 from "./Banner/3.jpg";
import bannerImage4 from "./Banner/4.jpg";

import MultiItemCarousel from "./MultiItemCarousel";
import CloudKitchen from "./CloudKitchen";
import AuthModal from "../AuthControls/AuthModal";
import { ThemeContext } from "../../context/ThemeContext";

const bannerImages = [bannerImage1, bannerImage2, bannerImage3, bannerImage4];

const Home = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState("login");
    const [searchTerm, setSearchTerm] = useState("");
    const { isDarkMode } = useContext(ThemeContext);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        if (value.trim().length > 0) {
            navigate(`/search?q=${encodeURIComponent(value)}`);
        }
    };

    const openAuth = (mode) => {
        setAuthMode(mode);
        setIsAuthOpen(true);
    };

    return (
        <div className={`min-h-screen transition-all duration-700 ${
            isDarkMode ? "bg-[#0b0f1a] text-white" : "bg-white text-gray-900"
        }`}>
            
            {/* 1. HERO SECTION */}
            <header className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
                {bannerImages.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] scale-105 ${
                            index === currentImageIndex ? "opacity-70" : "opacity-0"
                        }`}
                        style={{ backgroundImage: `url(${image})` }}
                    />
                ))}
                {/* Gradient transition into the background color */}
                <div className={`absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-transparent ${isDarkMode ? "to-[#0b0f1a]" : "to-white"}`} />

                <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
                    <h1 className="text-6xl md:text-8xl font-black mb-4 text-white tracking-tighter drop-shadow-2xl">
                        CloudBite <span className="text-orange-500 italic">Express.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-200 mb-10 font-medium italic">
                        "Your neighborhood's best flavors, virtually delivered."
                    </p>

                    <div className="relative max-w-3xl mx-auto flex items-center group mb-8 backdrop-blur-md bg-white/10 p-2 rounded-3xl border border-white/20 shadow-2xl">
                        <div className="absolute left-8 z-30 flex items-center gap-2 border-r pr-4 border-white/30">
                             <LocationOnIcon className="text-orange-500" />
                             <span className="text-white hidden md:block text-sm font-bold uppercase tracking-widest">Mumbai</span>
                        </div>
                        <input
                            type="text"
                            placeholder="Search for Puran Poli, Modak, or Thalis..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full p-6 pl-40 md:pl-48 rounded-2xl bg-white/90 text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/50 text-lg transition-all"
                        />
                        <SearchIcon className="absolute right-8 text-gray-400 group-hover:text-orange-500 !text-3xl" />
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        <button onClick={() => openAuth('login')} className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-xl text-lg hover:-translate-y-1">Log In</button>
                        <button onClick={() => openAuth('signup')} className="bg-white/10 backdrop-blur-md border-2 border-white text-white px-10 py-4 rounded-2xl font-black hover:bg-white hover:text-black transition-all text-lg hover:-translate-y-1">Join The Tribe</button>
                    </div>
                </div>
            </header>

            {/* 2. INSPIRATION SECTION (Minimal Gap via negative margin) */}
            <section className="relative z-30 -mt-20 max-w-7xl mx-auto px-6">
                <div className={`p-10 rounded-[3rem] shadow-2xl transition-colors duration-700 ${
                    isDarkMode ? "bg-[#161b29] border border-gray-800" : "bg-white"
                }`}>
                    <div className="mb-6 border-l-8 border-orange-500 pl-6">
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Inspiration</h2>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em]">Authentic Dishes Near You</p>
                    </div>
                    <MultiItemCarousel onDishSelect={(name) => navigate(`/search?q=${name}`)} />
                </div>
            </section>

            {/* 3. REGIONAL PRIDE SECTION */}
            <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-5xl font-black tracking-tighter mb-8 leading-none">
                        Real Food. <br/><span className="text-orange-500 italic">No Labels.</span>
                    </h2>
                    <p className="text-lg text-gray-500 mb-10 leading-relaxed">
                        We aren't a giant corporation. We are a homegrown startup connecting local cloud kitchens directly to your table.
                    </p>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center"><VerifiedUserIcon className="text-orange-500"/></div>
                            <span className="font-bold">Verified Kitchen Partners</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center"><SpeedIcon className="text-orange-500"/></div>
                            <span className="font-bold">Direct-to-Kitchen Delivery</span>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -inset-4 bg-orange-500 rounded-[3rem] rotate-3 opacity-20"></div>
                    <img src={bannerImage2} alt="Local Food" className="relative rounded-[3rem] shadow-2xl object-cover h-[450px] w-full" />
                </div>
            </section>

{/* 4. PARTNER SECTION */}
<section className="max-w-7xl mx-auto px-6 mb-20">
    <div className={`rounded-[3.5rem] p-12 md:p-16 transition-colors duration-700 ${
        isDarkMode ? "bg-[#161b29] border border-gray-800" : "bg-[#0b0f1a] text-white"
    }`}>
        <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter italic">Are you a Home Chef?</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
                If you cook with passion, we provide the platform to reach your neighborhood. Join our network of verified cloud kitchens.
            </p>
        </div>

        {/* Startup Partnership Procedure Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-orange-500/20">1</div>
                <h4 className="font-black uppercase tracking-widest text-sm mb-3">Submit Registry</h4>
                <p className="text-xs text-gray-500 leading-relaxed px-4">Email your kitchen details and menu to our onboarding team for review.</p>
            </div>
            <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-orange-500/20">2</div>
                <h4 className="font-black uppercase tracking-widest text-sm mb-3">Verification</h4>
                <p className="text-xs text-gray-500 leading-relaxed px-4">Our team conducts a quick quality & safety check of your cloud kitchen setup.</p>
            </div>
            <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-orange-500/20">3</div>
                <h4 className="font-black uppercase tracking-widest text-sm mb-3">Go Live</h4>
                <p className="text-xs text-gray-500 leading-relaxed px-4">Access your Kitchen Terminal and start receiving orders from the Tribe.</p>
            </div>
        </div>

        <div className="flex flex-col items-center gap-6 border-t border-white/5 pt-12">
            <a 
                href="mailto:cloudbiteowner@gmail.com" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3"
            >
                PARTNER WITH US
            </a>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                Direct Inquiries: <span className="text-orange-500">cloudbiteowner@gmail.com</span>
            </p>
        </div>
    </div>
</section>

            {/* 5. POPULAR KITCHENS (Minimal top padding to stay close) */}
            <section className="max-w-7xl mx-auto px-5 py-12 border-t border-gray-800/50">
                <CloudKitchen />
            </section>

            {/* 6. FOOTER */}
            <footer className={`py-12 border-t transition-colors duration-700 ${isDarkMode ? "border-gray-800 bg-[#0b0f1a]" : "border-gray-100"}`}>
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-black tracking-tighter uppercase">
                            CloudBite <span className="text-orange-500 italic">Express</span>
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Homegrown in Mumbai • 2026</p>
                    </div>
                    <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
                        <span className="hover:text-orange-500 cursor-pointer transition-colors">Instagram</span>
                        <span className="hover:text-orange-500 cursor-pointer transition-colors">Support</span>
                        <span className="hover:text-orange-500 cursor-pointer transition-colors">Privacy</span>
                    </div>
                </div>
            </footer>

            <AuthModal open={isAuthOpen} initialMode={authMode} handleClose={() => setIsAuthOpen(false)} />
        </div>
    );
};

export default Home;