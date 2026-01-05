import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllRecipes } from "../services/apis";
import { Plus, ChefHat, Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RecipeCard from "../components/recipe/RecipeCard";
import { useSelector } from "react-redux";

export default function Recipe() {
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["get-recipes", page, search],
    queryFn: () => getAllRecipes(token, page, limit, search),
    refetchOnWindowFocus: false,
  });

  const [recipeList, setRecipeList] = useState([]);

  // Sync fetched data to local state
  useEffect(() => {
    if (data?.data) {
      setRecipeList(data.data);
    }
  }, [data]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Function to remove a recipe immediately
  const handleRemoveRecipe = (id) => {
    setRecipeList((prevList) => prevList.filter((recipe) => recipe._id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-popular" />
          <p className="text-gray-600 font-medium">Loading recipes...</p>
        </div>
      </div>
    );
  }

  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-8 mt-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary/50 to-transparent p-6 rounded-2xl border border-gray-200/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-popular/20 rounded-xl">
              <ChefHat className="w-6 h-6 text-popular" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg lg:text-3xl font-bold text-white tracking-wide">
                Recipes
              </h1>
              <p className="text-gray-300 mt-1">
                Manage your product recipes ({data?.total || 0} total)
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/add-recipe")}
            className="bg-popular hover:bg-popular/90 text-white py-3 px-6 flex items-center gap-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <Plus
              size={20}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            <span>Add Recipe</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-secondary/50 p-4 rounded-xl border border-gray-200/20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 bg-primary border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-popular"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-popular hover:bg-popular/90 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300"
          >
            Search
          </button>
        </div>
      </div>

      {/* Recipe List */}
      <div className="space-y-4">
        {recipeList.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-popular rounded-full"></div>
                <h2 className="text-lg font-semibold text-white">
                  All Recipes
                </h2>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {recipeList.length} items
              </div>
            </div>

            <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-6">
              {recipeList.map((recipe) => (
                <div
                  key={recipe._id}
                  className="transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <RecipeCard
                    data={recipe}
                    onDelete={handleRemoveRecipe}
                    refetch={refetch}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-secondary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-popular transition-all"
                >
                  Previous
                </button>
                <span className="text-white px-4">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-secondary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-popular transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <ChefHat className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Recipes Found
                </h3>
                <p className="text-gray-500 mb-6">
                  {search
                    ? "Try adjusting your search criteria"
                    : "Get started by creating your first recipe"}
                </p>
                {!search && (
                  <button
                    onClick={() => navigate("/add-recipe")}
                    className="bg-popular hover:bg-popular/90 text-white py-3 px-6 flex items-center gap-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mx-auto"
                  >
                    <Plus size={20} />
                    <span>Create Recipe</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
