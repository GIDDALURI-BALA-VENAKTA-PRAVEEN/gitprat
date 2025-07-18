import React from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../NavBar/Nav';

const EntryCard: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = (path: string) => {
    navigate(path);
  };
  // Define the cards with their properties

  const cards = [
    {
      title: "Gift Cards",
      description: "Give the gift of choice. Let them pick their perfect moment.",
      gradient: "from-[#ff6726] to-[#FFB74D]",
      shadowColor: "shadow-[#ff6726]/50",
      stats: [
        { value: "Instant", label: "Delivery", color: "blue" },
        { value: "Flexible", label: "Amount", color: "green" },
        { value: "24/7", label: "Support", color: "purple" }
      ],
      path: "/home",
      buttonText: "Start Shopping →",
      cardStyle: "bg-gradient-to-br from-gray-50/90 to-gray-100/90 backdrop-blur-md",
      icon: "🎁",
      animation: "animate-bounce-slow"
    },
    {
      title: "Flyers",
      description: "Explore unique and innovative products from Fleyrs",
      gradient: "from-[#6366f1] via-[#a855f7] to-[#ec4899]",
      shadowColor: "shadow-[#6366f1]/50",
      stats: [
        { value: "500+", label: "Products", color: "indigo" },
        { value: "Premium", label: "Quality", color: "pink" },
        { value: "Global", label: "Shipping", color: "violet" }
      ],
      path: "/flyers",
      buttonText: "Explore Fleyrs →",
      cardStyle: "bg-gradient-to-br from-gray-50/90 to-gray-100/90 backdrop-blur-md",
      icon: "✨",
      animation: "animate-float-slow"
    },
    {
      title: "Insurance & Business",
      description: "Comprehensive insurance solutions and business services",
      gradient: "from-[#10b981] via-[#059669] to-[#0d9488]",
      shadowColor: "shadow-[#10b981]/50",
      stats: [
        { value: "Secure", label: "Coverage", color: "emerald" },
        { value: "Expert", label: "Support", color: "teal" },
        { value: "24/7", label: "Service", color: "cyan" }
      ],
      path: "/insurance",
      buttonText: "Learn More →",
      cardStyle: "bg-gradient-to-br from-gray-50/90 to-gray-100/90 backdrop-blur-md",
      icon: "🛡️",
      animation: "animate-pulse-slow"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Nav />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full">
          {cards.map((card, index) => (
            <div 
              key={index}
              className={`p-8 ${card.cardStyle} backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105 animate-scale-in relative overflow-hidden group hover:rotate-1`}
              onClick={() => handleClick(card.path)}
            >
              {/* Shimmer effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none"></div>
              
              {/* Decorative elements */}
              {card.icon && (
                <div className={`absolute top-4 right-4 text-4xl ${card.animation} transform hover:scale-110 transition-transform duration-300 hover:rotate-12`}>
                  {card.icon}
                </div>
              )}
              
              <div className="text-center space-y-6 relative z-10">
                <div className="animate-float">
                  <h1 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300`}>
                    {card.title}
                  </h1>
                </div>
                
                <div className={`w-24 h-1 bg-gradient-to-r ${card.gradient} mx-auto rounded-full animate-pulse group-hover:w-32 transition-all duration-300`}></div>
                
                <p className="text-gray-600 text-lg mb-8 animate-fade-in-up group-hover:text-gray-800 transition-colors duration-300">
                  {card.description}
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  {card.stats.map((stat, idx) => (
                    <div 
                      key={idx}
                      className={`p-4 bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-xl transform hover:scale-105 transition-all duration-300 animate-slide-in [animation-delay:${idx * 200}ms] hover:shadow-lg border border-${stat.color}-100/50 hover:border-${stat.color}-200/50 group-hover:translate-y-[-5px]`}
                    >
                      <span className={`text-${stat.color}-600 font-bold text-xl block mb-1 group-hover:text-${stat.color}-700 transition-colors duration-300`}>{stat.value}</span>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button 
                    className={`bg-gradient-to-r ${card.gradient} text-white font-semibold py-3 px-8 rounded-full transform hover:scale-105 transition-all duration-300 hover:shadow-lg relative overflow-hidden ${card.shadowColor} hover:shadow-xl group-hover:translate-y-[-2px]`}
                  >
                    <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">{card.buttonText}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntryCard;
