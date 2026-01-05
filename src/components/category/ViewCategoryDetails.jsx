import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { ChefHat, Coins, ArrowLeft, Tag, Layers } from "lucide-react";
import {
  getCategory,
  getsubCategoryByCategorie,
  getproductsBysubCat,
  imageBase,
} from "../../services/apis.js";

const ViewCategoryDetails = () => {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);

  useEffect(() => {
    if (!token) {
      toast.error("Authentication token is missing. Please login again.");
      navigate("/login");
    }
  }, [token, navigate]);

  // 1. Fetch Category
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => getCategory(categoryId, token),
    enabled: !!categoryId && !!token,
  });

  // 2. Fetch Subcategories
  const { data: subCategoriesData, isLoading: subCategoriesLoading } = useQuery(
    {
      queryKey: ["subcategories", categoryId],
      queryFn: () => getsubCategoryByCategorie(categoryId, token),
      enabled: !!categoryId && !!token,
    }
  );

  // --- DATA EXTRACTION ---
  const category = categoryData?.data || categoryData;
  const subCategories = subCategoriesData || [];

  // 3. Fetch Products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products", categoryId, subCategories.map((s) => s._id)],
    queryFn: async () => {
      if (subCategories.length === 0) return [];
      const productPromises = subCategories.map((sub) =>
        getproductsBysubCat(sub._id, token)
      );
      const results = await Promise.all(productPromises);
      return results.flatMap((response) => response.data || []);
    },
    enabled: !!token && subCategories.length > 0,
    initialData: [],
  });

  const handleGoBack = () => navigate(-1);
  const isLoading = categoryLoading || subCategoriesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading category details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* --- Header --- */}
        <div className="bg-secondary rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleGoBack}
              className="flex items-center text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-white text-center flex-1">
              {category?.title || "Category Details"}
            </h1>
            <div className="w-16"></div> {/* Spacer */}
          </div>

          {/* --- Category and Subcategory Info --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Category Card */}
            <div className="bg-popular/10 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Tag className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">Category</h3>
              </div>
              <div className="flex items-center space-x-4">
                {category?.image && (
                  <img
                    src={`${imageBase}${category.image}`}
                    alt={category.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="text-white font-medium">{category?.title}</p>
                  <p className="text-gray-400 text-sm">
                    {subCategories.length} Subcategories
                  </p>
                </div>
              </div>
            </div>

            {/* Subcategories List */}
            <div className="bg-popular/10 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Layers className="w-5 h-5 text-popular mr-2" />
                <h3 className="text-lg font-semibold text-white">
                  Subcategories
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {subCategories.length > 0 ? (
                  subCategories.map((sub) => (
                    <span
                      key={sub._id}
                      className="px-3 py-1 bg-primary text-white text-sm rounded-full"
                    >
                      {sub.title}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">
                    No subcategories found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- Products Grid --- */}
        <h2 className="text-2xl font-bold text-white mb-6">
          Products in this Category ({products.length})
        </h2>
        {productsLoading && (
          <div className="text-white text-center py-8">Loading products...</div>
        )}

        {!productsLoading && products.length === 0 ? (
          <div className="bg-secondary rounded-lg shadow-lg p-8 text-center">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Products Found
            </h3>
            <p className="text-gray-400">
              There are no products available in this category's subcategories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* ================================================================== */}
            {/* --- START: Product Card JSX --- */}
            {/* ================================================================== */}
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-secondary rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-700">
                  {product.image ? (
                    <img
                      src={`${imageBase}${product.image}`}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-600">
                      <ChefHat className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div
                    className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium text-white ${
                      product.available ? "bg-popular" : "bg-red-500"
                    }`}
                  >
                    {product.available ? "Available" : "Unavailable"}
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-white mb-2 truncate">
                    {product.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                    {product.description}
                  </p>

                  {/* Kitchen Info */}
                  {product.kitchen?.name && (
                    <div className="flex items-center text-gray-300 text-sm mb-3">
                      <ChefHat className="w-4 h-4 mr-2 text-popular" />
                      <span>{product.kitchen.name}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center text-popular font-semibold text-lg mb-4">
                    <Coins className="w-5 h-5 mr-2" />
                    <span>{product.price} EG</span>
                  </div>

                  {/* Ingredients */}
                  {product.ingredients && product.ingredients.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-white text-sm font-medium mb-2">
                        Ingredients:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {product.ingredients.slice(0, 3).map((ing, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-popular/10 text-popular text-xs rounded-full"
                          >
                            {ing}
                          </span>
                        ))}
                        {product.ingredients.length > 6 && (
                          <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
                            +{product.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Extras */}
                  {product.extras && product.extras.length > 0 && (
                    <div className="border-t border-gray-700 pt-3 mt-3">
                      <h4 className="text-white text-sm font-medium mb-2">
                        Extras:
                      </h4>
                      <div className="space-y-1">
                        {product.extras.slice(0, 2).map((extra) => (
                          <div
                            key={extra._id}
                            className="flex justify-between text-xs"
                          >
                            <span className="text-gray-300">{extra.name}</span>
                            <span className="text-popular">
                              +{extra.price} EG
                            </span>
                          </div>
                        ))}
                        {product.extras.length > 2 && (
                          <div className="text-xs text-gray-400 mt-1">
                            +{product.extras.length - 2} more...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* ================================================================== */}
            {/* --- END: Product Card JSX --- */}
            {/* ================================================================== */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewCategoryDetails;
