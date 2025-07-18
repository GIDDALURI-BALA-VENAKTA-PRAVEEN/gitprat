import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import BANKING from "./assets/imgs/Bank.png";
import BEAUTY_GROOMING from "./assets/imgs/Beauty.png";
import BIGGEST_SALES from "./assets/imgs/Top.png";
import DEPARTMENTAL from "./assets/imgs/Fashion.png";
import EDUCATION from "./assets/imgs/Education.png";
import ELECTRONICS from "./assets/imgs/Electronics.png";
import FASHION from "./assets/imgs/Fashion.png";
import FOOD_GROCERY from "./assets/imgs/Hotel.png";
import HEALTH_WELLNESS from "./assets/imgs/Health.png";
import HOME_KITCHEN from "./assets/imgs/Home.png";
import HOSTING from "./assets/imgs/Hosting.png";
import HOTELS_FLIGHTS from "./assets/imgs/Hotel.png";
import MOBILES from "./assets/imgs/Mobile.png";
import PHARMACY from "./assets/imgs/Pharmacy.png";
import { useRef } from "react";

// Replace these imports with actual image files in your project.

interface Category {
  name: string;
  icon: string;
}

const categories: Category[] = [
  { name: "BIGGEST SALES", icon: BIGGEST_SALES },
  { name: "BANKING", icon: BANKING },
  { name: "HOTELS & FLIGHTS", icon: HOTELS_FLIGHTS },
  { name: "ELECTRONICS", icon: ELECTRONICS },
  { name: "MOBILES", icon: MOBILES },
  { name: "FASHION", icon: FASHION },
  { name: "BEAUTY & GROOMING", icon: BEAUTY_GROOMING },
  { name: "HEALTH & WELLNESS", icon: HEALTH_WELLNESS },
  { name: "PHARMACY", icon: PHARMACY },
  { name: "HOME & KITCHEN", icon: HOME_KITCHEN },
  { name: "EDUCATION", icon: EDUCATION },
  { name: "FOOD & GROCERY", icon: FOOD_GROCERY },
  { name: "HOSTING", icon: HOSTING },
  { name: "DEPARTMENTAL", icon: DEPARTMENTAL },
];

interface CategoryProps {
  setSelectedCategory: (category: string) => void;
}

const Category: React.FC<CategoryProps> = ({ setSelectedCategory }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="relative overflow-hidden rounded-sm p-2 sm:p-4 md:p-6">
      <div className="w-full py-4 px-2 sm:py-6 sm:px-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          TOP CATEGORIES
        </h2>
        <div className="relative w-full">
          {/* Left Button - always show, but smaller on mobile */}
          <button
            className="flex absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 sm:p-2 p-1"
            onClick={scrollLeft}
            aria-label="Scroll Left"
            style={{ display: categories.length > 2 ? "flex" : "none" }}
          >
            <FaChevronLeft size={20} className="hidden sm:block" />
            <FaChevronLeft size={16} className="block sm:hidden" />
          </button>

          {/* Category Slider */}
          <div
            ref={sliderRef}
            className="flex overflow-x-auto gap-3 sm:gap-4 p-2 scroll-smooth scrollbar-hide"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center min-w-[110px] sm:min-w-[180px] md:min-w-[200px] cursor-pointer"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center transform hover:scale-105 transition-transform duration-200">
                  <img
                    src={category.icon}
                    alt={category.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-700 text-center mt-2">
                  {category.name}
                </p>
              </div>
            ))}
          </div>

          {/* Right Button - always show, but smaller on mobile */}
          <button
            className="flex absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 sm:p-2 p-1"
            onClick={scrollRight}
            aria-label="Scroll Right"
            style={{ display: categories.length > 2 ? "flex" : "none" }}
          >
            <FaChevronRight size={20} className="hidden sm:block" />
            <FaChevronRight size={16} className="block sm:hidden" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Category;
