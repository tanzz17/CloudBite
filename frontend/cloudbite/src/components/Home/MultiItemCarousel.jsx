import React, { useContext } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { TopMeal } from "./TopMeal";
import CarouselItem from "./CarouselItem";
import { SampleNextArrow, SamplePrevArrow } from "./Arrow";
import { ThemeContext } from "../../context/ThemeContext";

export default function MultiItemCarousel({ onDishSelect }) { 
  // eslint-disable-next-line no-unused-vars
  const { isDarkMode } = useContext(ThemeContext);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="py-4 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <Slider {...settings}>
          {TopMeal.map((item, index) => (
            <div key={index} className="px-3">
              <div 
                onClick={() => onDishSelect(item.name)} 
                className="cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <CarouselItem image={item.image} name={item.name} />
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}