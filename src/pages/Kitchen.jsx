import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { add_kitchen, get_kitchens, imageBase } from "../services/apis";
import { useNavigate } from "react-router-dom";
import { X, Upload, Plus, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

export default function Kitchen() {
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);
  const user = useSelector((store) => store.user.user);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const { data, isLoading, error } = useQuery({
    queryKey: ["kitchen__list"],
    queryFn: () => get_kitchens(token),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "File size must be less than 10MB",
        }));
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select a valid image file (PNG, JPG, GIF)",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.image) {
        setErrors((prev) => ({
          ...prev,
          image: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Kitchen name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Kitchen name must be at least 2 characters";
    } else if (formData.name.trim().length > 50) {
      newErrors.name = "Kitchen name must be less than 50 characters";
    }

    if (!formData.image) {
      newErrors.image = "Kitchen image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["add-kitchen"],
    mutationFn: (payload) => add_kitchen(payload, token),
    onSuccess: (response) => {
      // Reset form
      setFormData({ name: "", image: null });
      setImagePreview(null);
      setIsModalOpen(false);
      setErrors({});

      // Invalidate and refetch kitchens list
      queryClient.invalidateQueries({ queryKey: ["kitchen__list"] });

      // Show success message
      toast.success(response?.message || "Kitchen added successfully!");
    },
    onError: (err) => {
      console.error("Error adding kitchen:", err);

      // Handle different error scenarios
      if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else if (err?.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = err.response.data.errors;
        setErrors(backendErrors);
        toast.error("Please fix the errors and try again");
      } else if (err?.message) {
        toast.error(err.message);
      } else {
        toast.error("Failed to add kitchen. Please try again.");
      }
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    try {
      // Create FormData for file upload

      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("image", formData.image);

      // Call the mutation
      mutate(data);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", image: null });
    setImagePreview(null);
    setErrors({});
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: null }));
    if (errors.image) {
      setErrors((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-popular"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">Error loading kitchens</p>
          <p className="text-gray-600 mt-2">Please try again later</p>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["kitchen__list"] })
            }
            className="mt-4 bg-popular text-white px-4 py-2 rounded-lg hover:bg-popular/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row font-semibold justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl text-white">
            Kitchens
          </h1>
          {user.role != "staff" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-popular  hover:bg-popular/90 transition-colors duration-200 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-200 w-full sm:w-auto flex items-center gap-2"
            >
              <Plus size={20} />
              Add Kitchen
            </button>
          )}
        </div>

        {/* Kitchen Grid */}
        {data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map((kitchen, index) => (
              <div
                key={kitchen?.id || kitchen?._id || index}
                className="bg-secondary hover:border-[1px] border-popular rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 transition-transform duration-300"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <img
                    className="w-full h-48 sm:h-52 md:h-56 object-cover transition-transform duration-300 hover:scale-110"
                    src={imageBase + kitchen?.image}
                    alt={kitchen?.name || "Kitchen image"}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/placeholder-kitchen.jpg"; // Fallback image
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                    {kitchen?.name}
                  </h3>

                  {/* Additional info if available */}
                  {kitchen?.description && (
                    <p className="text-gray-300 text-sm line-clamp-3 mb-3">
                      {kitchen.description}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => navigate(`/kitchen/${kitchen._id}`)}
                      className="flex-1 bg-popular hover:bg-popular/90 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              No kitchens found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Get started by adding your first kitchen
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-popular hover:bg-popular/90 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Add Your First Kitchen
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-xl shadow-xl w-full max-w-md transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-600">
              <h2 className="text-xl font-semibold text-white">
                Add New Kitchen
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-1 hover:bg-gray-600 rounded-full"
                disabled={isPending}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Kitchen Name Input */}
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Kitchen Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isPending}
                  className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-popular transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.name
                      ? "border-red-500"
                      : "border-gray-600 focus:border-popular"
                  }`}
                  placeholder="Enter kitchen name"
                  maxLength={50}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Kitchen Image <span className="text-red-500">*</span>
                </label>

                {/* Image Preview or Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                    errors.image
                      ? "border-red-500"
                      : "border-gray-600 hover:border-popular"
                  } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={isPending}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-500 text-sm">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isPending}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>

                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isPending || !formData.name.trim() || !formData.image
                  }
                  className="flex-1 px-4 py-3 bg-popular hover:bg-popular/90 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Kitchen
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
