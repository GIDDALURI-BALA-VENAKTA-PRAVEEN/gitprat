import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Subcategory {
  id: number;
  name: string;
  [key: string]: any;
}

interface CategoryType {
  id: number;
  name: string;
  url?: string;
  description?: string | null;
  subcategories?: Subcategory[];
}

const Categorycards: React.FC = () => {
  const [categoryList, setCategoryList] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/woohoo/category")
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          setCategoryList(data);
        } else if (typeof data === "object" && data !== null) {
          setCategoryList([data]);
        } else {
          setError("Unexpected response format");
        }
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load categories");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
        Categories
      </h1>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {categoryList.map((category, idx) => (
          <div
            key={category.id}
            onClick={() => navigate(`/products/${category.id}`)}
            style={{
              userSelect: "none",
              animation: "fadeScaleIn 0.5s",
              animationDelay: `${idx * 0.07}s`,
              animationFillMode: "backwards",
            }}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 flex flex-col justify-between min-h-[200px] cursor-pointer transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden"
          >
            {/* Animation keyframes */}
            {idx === 0 && (
              <style>
                {`
                  @keyframes fadeScaleIn {
                    from { opacity: 0; transform: scale(0.96) translateY(20px);}
                    to { opacity: 1; transform: scale(1) translateY(0);}
                  }
                `}
              </style>
            )}

            <div className="flex-grow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                  ID: {category.id}
                </span>
                <span className="text-xs text-gray-500">
                  {category.subcategories?.length || 0} subcategories
                </span>
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-800 group-hover:text-amber-600 transition-colors">
                {category.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {category.description || "No description available"}
              </p>
              
              {category.url && (
                <p className="text-xs text-gray-500 mb-3 truncate">
                  <span className="font-medium">URL:</span> {category.url}
                </p>
              )}
              
              {category.subcategories && category.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <span key={sub.id} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full">
                      {sub.name}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full">
                      +{category.subcategories.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
              
            <button
              tabIndex={-1}
              className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 transform group-hover:scale-105 pointer-events-none"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categorycards;
