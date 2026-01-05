import React, { useState } from "react";
import {
  ChefHat,
  DollarSign,
  MapPin,
  Tag,
  Star,
  Clock,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";
import { imageBase, deleteIngredient } from "../../services/apis";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Add this import
import { toast } from "react-toastify";

export default function IngredientCard({ data, onDelete }) {
  const token = useSelector((store) => store.user.token);
  const navigate = useNavigate(); // Add this hook
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleEditClick = () => {
    // Navigate to edit page with product ID
    navigate(`/ingredients/${data?._id || data?.id}`);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    if (onDelete) {
      onDelete(data?.id || data?._id);
    }
    try {
      await deleteIngredient(data?._id, token);
      toast.success("Ingredient deleted successfully");
    } catch (error) {
      toast.error("Error deleting ingredient:", error);
    }
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="group bg-secondary rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-700/20 hover:border-popular/30  flex flex-col ">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
            src={`${imageBase}${data?.image}`}
            alt={data?.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/60 transition-all duration-300"></div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3 bg-popular/90 backdrop-blur-sm text-white px-3 py-1 rounded-full font-bold text-sm">
            {data?.price}
            {" EG"}
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 space-y-4 flex-1 flex flex-col">
          <div className=" h-[75px]">
            <h3 className="text-xl font-bold text-white group-hover:text-popular transition-colors duration-300 leading-tight mb-2">
              {data?.name}
            </h3>
            <p className="text-gray-300 text-sm line-clamp-2">
              {data?.description}
            </p>
          </div>

          <div className="space-y-3 h-[60px]">
            {/* Category */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-popular/20 rounded-lg group-hover:bg-popular/30 transition-colors duration-300">
                <Tag className="w-4 h-4 text-popular" />
              </div>
              <div className="flex-1">
                <span className="text-gray-300 text-sm font-medium">
                  Category
                </span>
                <p className="text-white font-semibold">{data?.category}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex space-x-2 mt-auto">
            <button
              onClick={handleEditClick}
              className="w-full py-2 bg-popular/10 hover:bg-blue-800/20 text-popular hover:text-blue-400 border border-popular/30 hover:border-blue-500/50 rounded-lg font-medium text-sm transition-all duration-300"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="w-full py-2 bg-popular/10 hover:bg-red-500/20 text-popular hover:text-red-400 border border-popular/30 hover:border-red-500/50 rounded-lg font-medium text-sm transition-all duration-300"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal - Portal to center of page */}
      {showDeleteConfirm && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
          style={{
            zIndex: 99999,
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div
            className="bg-secondary border border-gray-700 rounded-xl p-6 shadow-2xl"
            style={{
              width: "500px",
              maxWidth: "90vw",
              position: "relative",
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Delete Ingredient
                </h3>
              </div>
              <button
                onClick={handleCancelDelete}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                Are you sure you want to delete this ingredient?
              </p>
              <p className="text-white font-medium mb-2">{data?.title}</p>
              <p className="text-red-400 text-sm">
                This action cannot be undone.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 rounded-lg font-medium text-sm transition-all duration-300"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-2 px-4 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50 rounded-lg font-medium text-sm transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
