import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllIngredinet } from "../../services/apis";
import { Plus, Grid3X3, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IngredientCard from "./IngredientCard";
import { useSelector } from "react-redux";

export default function Ingredient() {
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);

  const { data, isLoading } = useQuery({
    queryKey: ["get-Ingredient"],
    queryFn: () => getAllIngredinet(token),
    refetchOnWindowFocus: false,
  });

  const [ingList, setIngList] = useState([]);

  // Sync fetched data to local state
  useEffect(() => {
    if (data?.data) {
      setIngList(data.data);
    }
  }, [data]);

  // Function to update dish list immediately
  const handleUpdateList = (updatedDish) => {
    setIngList((prevList) =>
      prevList.map((dish) =>
        dish._id === updatedDish._id ? updatedDish : dish
      )
    );
  };

  // Function to remove a dish immediately
  const handleRemoveDish = (id) => {
    setIngList((prevList) => prevList.filter((dish) => dish._id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-popular" />
          <p className="text-gray-600 font-medium">Loading ingredients...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8 mt-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary/50 to-transparent p-6 rounded-2xl border border-gray-200/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-popular/20 rounded-xl">
              <Grid3X3 className="w-6 h-6 text-popular" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg lg:text-3xl font-bold text-white tracking-wide">
                Ingredients
              </h1>
              <p className="text-gray-300 mt-1">
                Manage your Ingredients ({ingList.length || 0} total)
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/add-ingredient")}
            className="bg-popular hover:bg-popular/90 text-white py-3 px-6 flex items-center gap-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <Plus
              size={20}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            <span>Add Ingredient</span>
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="space-y-4">
        {ingList.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-popular rounded-full"></div>
                <h2 className="text-lg font-semibold text-white">
                  All Ingredient
                </h2>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {ingList.length} items
              </div>
            </div>

            <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
              {ingList.map((category) => (
                <div
                  key={category._id}
                  className="transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <IngredientCard
                    data={category}
                    onUpdate={handleUpdateList}
                    onDelete={handleRemoveDish}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <Grid3X3 className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Ingredients Found
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by creating your first Ingredient
                </p>
                <button
                  onClick={() => navigate("/add-ingredient")}
                  className="bg-popular hover:bg-popular/90 text-white py-3 px-6 flex items-center gap-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mx-auto"
                >
                  <Plus size={20} />
                  <span>Create Ingredient</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
