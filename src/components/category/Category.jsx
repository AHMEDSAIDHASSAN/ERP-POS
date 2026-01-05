import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../services/apis";
import CategoryCard from "./CategoryCard";
import { Plus, Grid3X3, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";

export default function Category() {
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);
  const [categoryList, setCategoryList] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ["get-Categotys"],
    queryFn: () => getCategories(token),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      setCategoryList(data);
    }
  }, [data]);

  const handleUpdateList = (updatedCategory) => {
    setCategoryList((prevList) =>
      prevList.map((Category) =>
        Category._id === updatedCategory._id ? updatedCategory : Category
      )
    );
  };

  const handleRemoveCategory = (id) => {
    setCategoryList((prevList) =>
      prevList.filter((Category) => Category._id !== id)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-popular" />
          <p className="text-gray-600 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-10">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-secondary/50 to-transparent p-6 rounded-2xl border border-gray-200/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-popular/20 rounded-xl">
              <Grid3X3 className="w-6 h-6 text-popular" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg lg:text-3xl font-bold text-white tracking-wide">
                Categories
              </h1>
              <p className="text-gray-300 mt-1">
                Manage your product categories ({categoryList?.length || 0}{" "}
                total)
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/add-category")}
            className="bg-popular hover:bg-popular/90 text-white py-3 px-6 flex items-center gap-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <Plus
              size={20}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        {categoryList && categoryList.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-popular rounded-full"></div>
                <h2 className="text-lg font-semibold text-white">
                  All Categories
                </h2>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {categoryList.length} items
              </div>
            </div>

            <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
              {categoryList.map((category, index) => (
                <div
                  key={category._id || index}
                  className="transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <CategoryCard
                    data={category}
                    onDelete={handleRemoveCategory}
                    onUpdate={handleUpdateList}
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
                  No Categories Found
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by creating your first category
                </p>
                <button className="bg-popular hover:bg-popular/90 text-white py-3 px-6 flex items-center gap-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mx-auto">
                  <Plus size={20} />
                  <span>Create Category</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {categoryList && categoryList.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-popular">
                {categoryList.length}
              </p>
              <p className="text-sm text-gray-600">Total Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {categoryList.reduce(
                  (acc, cat) => acc + (cat.products || 0),
                  0
                )}
              </p>
              <p className="text-sm text-gray-600">Total Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {categoryList.reduce(
                  (acc, cat) => acc + (cat.numsubCategory || 0),
                  0
                )}
              </p>
              <p className="text-sm text-gray-600">Sub Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(
                  categoryList.reduce(
                    (acc, cat) => acc + (cat.products || 0),
                    0
                  ) / categoryList.length
                ) || 0}
              </p>
              <p className="text-sm text-gray-600">Avg Products</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
