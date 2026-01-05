import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRecipe } from "../../services/apis";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Trash, Eye, Edit, Package, Leaf } from "lucide-react";

export default function RecipeCard({ data, onDelete, refetch }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const token = useSelector((store) => store.user.token);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: deleteMutation, isLoading: isDeleting } = useMutation({
    mutationKey: ["delete-recipe"],
    mutationFn: () => deleteRecipe(data._id, token),
    onSuccess: () => {
      toast.success("Recipe deleted successfully");
      setShowDeleteModal(false);
      if (onDelete) {
        onDelete(data._id);
      }
      if (refetch) {
        refetch();
      }
      queryClient.invalidateQueries({ queryKey: ["get-recipes"] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to delete recipe";
      toast.error(errorMessage);
    },
  });

  const handleDelete = () => {
    deleteMutation();
  };

  const productName = data?.product?.title || "Unknown Product";
  const ingredientCount = data?.ingredients?.length || 0;
  const isActive = data?.isActive !== false;

  // Count ingredient types
  const rawMaterialCount = data?.ingredients?.filter(
    (ing) => ing.ingredientType === "inventory" || !ing.ingredientType
  ).length || 0;
  const subProductCount = data?.ingredients?.filter(
    (ing) => ing.ingredientType === "product"
  ).length || 0;

  return (
    <>
      <div className="bg-secondary/50 rounded-xl p-5 border border-gray-200/20 hover:border-popular/50 transition-all duration-300">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-popular" />
                <h3 className="text-lg font-semibold text-white truncate">
                  {productName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isActive
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Ingredients Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-300">
              <Leaf className="w-4 h-4 text-popular" />
              <span className="text-sm">
                {ingredientCount} ingredient{ingredientCount !== 1 ? "s" : ""}
              </span>
            </div>
            {(rawMaterialCount > 0 || subProductCount > 0) && (
              <div className="flex items-center gap-2 text-xs">
                {rawMaterialCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-400 rounded">
                    <Leaf className="w-3 h-3" />
                    {rawMaterialCount} Raw
                  </span>
                )}
                {subProductCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                    <Package className="w-3 h-3" />
                    {subProductCount} Sub-Product{subProductCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Notes Preview */}
          {data?.notes && (
            <div className="text-sm text-gray-400 border-t border-gray-600 pt-3">
              <p className="line-clamp-2">{data.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-600">
            <button
              onClick={() => navigate(`/recipe/${data._id}`)}
              className="flex-1 bg-primary hover:bg-popular/20 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 border border-gray-600 hover:border-popular"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">View</span>
            </button>
            <button
              onClick={() => navigate(`/edit-recipe/${data._id}`)}
              className="flex-1 bg-primary hover:bg-blue-500/20 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 border border-gray-600 hover:border-blue-500"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">Edit</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-primary hover:bg-red-500/20 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 border border-gray-600 hover:border-red-500"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary rounded-xl p-6 max-w-md w-full mx-4 border border-gray-600">
            <h3 className="text-xl font-bold text-white mb-4">
              Delete Recipe
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the recipe for{" "}
              <span className="font-semibold text-popular">{productName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
