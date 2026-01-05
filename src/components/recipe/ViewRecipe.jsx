import { useQuery } from "@tanstack/react-query";
import { getRecipeById, checkRecipeAvailability } from "../../services/apis";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ChefHat,
  Loader2,
  Edit,
  Package,
  Leaf,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function ViewRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);
  const [checkQuantity, setCheckQuantity] = useState(1);

  // Fetch recipe data
  const {
    data: recipeData,
    isLoading: recipeLoading,
    error: recipeError,
  } = useQuery({
    queryKey: ["get-recipe", id],
    queryFn: () => getRecipeById(id, token),
    refetchOnWindowFocus: false,
  });

  // Fetch availability data
  const {
    data: availabilityData,
    isLoading: availabilityLoading,
    refetch: refetchAvailability,
  } = useQuery({
    queryKey: ["check-recipe-availability", id, checkQuantity],
    queryFn: () =>
      checkRecipeAvailability(
        recipeData?.data?.product?._id,
        token,
        checkQuantity
      ),
    refetchOnWindowFocus: false,
    enabled: !!recipeData?.data?.product?._id,
  });

  const handleCheckAvailability = () => {
    refetchAvailability();
  };

  if (recipeLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-popular" />
          <p className="text-gray-600 font-medium">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (recipeError) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-500 mb-2">
            Error Loading Recipe
          </h3>
          <p className="text-gray-600">
            {recipeError?.response?.data?.message || "Failed to load recipe"}
          </p>
          <button
            onClick={() => navigate("/recipe")}
            className="mt-4 bg-popular text-white px-6 py-2 rounded-lg"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  const recipe = recipeData?.data;
  const product = recipe?.product;
  const ingredients = recipe?.ingredients || [];
  const totalCost = recipe?.totalRecipeCost || 0;
  const productPrice = recipe?.productPrice || 0;
  const profitMargin = recipe?.profitMargin || 0;
  const isActive = recipe?.isActive !== false;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary/50 to-transparent p-6 rounded-2xl border border-gray-200/20 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/recipe")}
                className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl hover:bg-popular/20 transition-all border border-gray-600"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center justify-center w-12 h-12 bg-popular/20 rounded-xl">
                <ChefHat className="w-6 h-6 text-popular" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg lg:text-3xl font-bold text-white tracking-wide">
                  Recipe Details
                </h1>
                <p className="text-gray-300 mt-1">
                  {product?.title || "Unknown Product"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/edit-recipe/${id}`)}
                className="bg-popular hover:bg-popular/90 text-white py-2 px-4 flex items-center gap-2 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Recipe</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Recipe Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info Card */}
            <div className="bg-secondary/50 rounded-xl p-6 border border-gray-200/20">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-popular" />
                <h2 className="text-xl font-semibold text-white">
                  Product Information
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Product Name:</span>
                  <span className="text-white font-medium">
                    {product?.title}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Kitchen:</span>
                  <span className="text-white font-medium">
                    {product?.kitchen?.name || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ingredients Card */}
            <div className="bg-secondary/50 rounded-xl p-6 border border-gray-200/20">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-popular" />
                <h2 className="text-xl font-semibold text-white">
                  Ingredients ({ingredients.length})
                </h2>
              </div>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => {
                  const ingredientCost =
                    recipe?.ingredientsWithCost?.[index]?.totalCost || 0;
                  const isSubProduct = ingredient.ingredientType === "product";
                  const itemName = isSubProduct
                    ? ingredient.subProduct?.title
                    : ingredient.inventoryItem?.productName;
                  const itemCode = isSubProduct
                    ? `Product ID: ${ingredient.subProduct?._id?.slice(-6)}`
                    : `Code: ${ingredient.inventoryItem?.code || "N/A"}`;

                  return (
                    <div
                      key={index}
                      className={`rounded-lg p-4 border ${
                        isSubProduct
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-primary/30 border-gray-600"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-2">
                          {isSubProduct ? (
                            <Package className="w-5 h-5 text-blue-400 mt-0.5" />
                          ) : (
                            <Leaf className="w-5 h-5 text-green-400 mt-0.5" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-medium">
                                {itemName || "Unknown Item"}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  isSubProduct
                                    ? "bg-blue-500/20 text-blue-300"
                                    : "bg-green-500/20 text-green-300"
                                }`}
                              >
                                {isSubProduct ? "Sub-Product" : "Raw Material"}
                              </span>
                            </div>
                            {/* <p className="text-sm text-gray-400">{itemCode}</p> */}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">
                            {ingredient.quantity} {ingredient.unit}
                          </p>
                          {/* <p className="text-sm text-gray-400">
                            Cost: ${ingredientCost.toFixed(2)}
                          </p> */}
                        </div>
                      </div>
                      {/* {!isSubProduct && (
                        <div className="text-xs text-gray-500 mt-2">
                          Unit Price: $
                          {ingredient.inventoryItem?.averagePrice?.toFixed(2) ||
                            "0.00"}{" "}
                          per {ingredient.inventoryItem?.unit || "unit"}
                        </div>
                      )}
                      {isSubProduct && ingredient.subProduct?.price && (
                        <div className="text-xs text-gray-500 mt-2">
                          Product Price: $
                          {ingredient.subProduct.price.toFixed(2)} per piece
                        </div>
                      )} */}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes Card */}
            {recipe?.notes && (
              <div className="bg-secondary/50 rounded-xl p-6 border border-gray-200/20">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Recipe Notes
                </h2>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {recipe.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Cost Analysis & Availability */}
        </div>
      </div>
    </div>
  );
}
