import { useMutation, useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getCategory, imageBase, updateCategory } from "../../services/apis";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Upload, X } from "lucide-react";
import Category from "./Category";

// FIXED: Updated schema for subcategory validation
const createCategorySchema = (isEdit, hasExistingImage) =>
  Yup.object({
    title: Yup.string()
      .required("Subcategory title is required")
      .min(3, "title must be at least 3 characters")
      .max(100, "title must not exceed 100 characters"),

    image: Yup.mixed().test(
      "image-required",
      "Category image is required",
      function (value) {
        // For create mode, always require image
        if (!isEdit) {
          return !!value && value instanceof File;
        }

        // For edit mode with existing image
        if (hasExistingImage) {
          // Accept existing image placeholder OR new file
          return (
            value === "EXISTING_IMAGE_PLACEHOLDER" || value instanceof File
          );
        }

        // No existing image in edit mode, require new file
        return !!value && value instanceof File;
      }
    ),
  });

export default function EditCategory() {
  const [imagePreview, setImagePreview] = useState(null);
  const [hasNewImage, setHasNewImage] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [hasExistingImage, setHasExistingImage] = useState(false);
  const [existingImagePath, setExistingImagePath] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [validationSchema, setValidationSchema] = useState(null);
  const { id } = useParams();
  const token = useSelector((store) => store.user.token);
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Check token validity on component mount
  useEffect(() => {
    if (!token || typeof token !== "string" || token.trim() === "") {
      toast.error("Authentication token is missing. Please login again.");
      navigate("/login");
      return;
    }

    // Optional: You can also validate token format here
    try {
      // If your token is JWT, you can decode and check expiration
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format - expected JWT with 3 parts");
      }

      // Try to decode the payload
      const payload = JSON.parse(atob(tokenParts[1]));

      // Check expiration
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp < currentTime) {
          throw new Error("Token has expired");
        }
      }
    } catch (error) {
      toast.error(
        `Invalid authentication token: ${error.message}. Please login again.`
      );
      navigate("/login");
    }
  }, [token, navigate]);

  // FIXED: Initialize validation schema with proper dependencies
  useEffect(() => {
    const schema = createCategorySchema(isEdit, hasExistingImage);
    setValidationSchema(schema);
  }, [isEdit, hasExistingImage]);

  // Fetch product data for editing
  const {
    data: CategoryData,
    isLoading: categoryLoading,
    error,
  } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategory(id, token),
    enabled: isEdit && !!id,

    onError: (error) => {
      console.error("Category fetching:", error);
    },
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      image: null,
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const formData = new FormData();

      formData.append("id", id);

      // Append all form fields
      Object.keys(values).forEach((key) => {
        if (key === "image") {
          // Only append image if a new one was selected and it's a valid File object
          if (hasNewImage && values[key] && values[key] instanceof File) {
            formData.append(key, values[key]);
          }
          // If keeping existing image, append the path
          else if (!hasNewImage && existingImagePath) {
            formData.append("imagePath", existingImagePath);
          }
        } else {
          formData.append(key, values[key]);
        }
      });

      for (let pair of formData.entries()) {
        if (pair[0] === "image" || pair[0] === "imagePath") {
          const file = pair[1];
        }
      }

      updateMutation.mutate({ formData });
    },
  });

  useEffect(() => {
    if (CategoryData && isEdit) {
      try {
        const categoryObj = CategoryData.data || categoryObj;

        // Handle existing image with proper error handling
        let imageExists = false;
        let imagePath = null;

        if (categoryObj.image && typeof categoryObj.image === "object") {
          // Handle case where image is an object with filename property
          if (categoryObj.image.filename) {
            imageExists = true;
            imagePath = categoryObj.image.filename;
          }
        } else if (
          typeof categoryObj.image === "string" &&
          categoryObj.image.trim() !== ""
        ) {
          imageExists = true;
          imagePath = categoryObj.image;
        }

        if (imageExists && imagePath) {
          setHasExistingImage(true);
          setExistingImagePath(imagePath);
          const fullImageUrl = `${imageBase}${imagePath}`;
          setOriginalImageUrl(fullImageUrl);
          setImagePreview(fullImageUrl);
          setHasNewImage(false);

          // Set form values with proper existing image handling
          formik.setValues({
            title: categoryObj.title || "",
            image: "EXISTING_IMAGE_PLACEHOLDER", // Use placeholder for existing images
          });
        } else {
          setHasExistingImage(false);
          setExistingImagePath(null);
          setOriginalImageUrl(null);
          setImagePreview(null);
          setHasNewImage(false);

          // Set form values without image
          formik.setValues({
            title: categoryObj.title || "",
            image: null,
          });
        }
      } catch (error) {
        toast.error("Failed to load Category data properly: " + error);
      }
    }
  }, [CategoryData, isEdit]);

  // FIXED: Update validation when image state changes
  useEffect(() => {
    // Re-validate the form when image state changes
    if (formik.values.image !== undefined) {
      formik.validateForm();
    }
  }, [hasExistingImage, hasNewImage, formik.values.image]);

  // Update subcategory mutation
  const updateMutation = useMutation({
    mutationKey: ["update-category"],
    mutationFn: ({ formData }) => updateCategory(id, formData, token),
    onSuccess: (data) => {
      toast.success("Category updated successfully");
      navigate("/managment");
    },
    onError: (error) => {
      // Handle different types of errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error?.message) {
        toast.error(`Update failed: ${error.message}`);
      } else {
        toast.error("Failed to update subcategory. Please try again.");
      }
    },
  });

  // FIXED: Handle image upload with proper validation
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file instanceof File) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        toast.error(
          "Please select a valid image file (JPEG, PNG, GIF, or WebP)"
        );
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Set the file and update states
      formik.setFieldValue("image", file);
      setHasNewImage(true);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        toast.error("Failed to read the image file");
      };
      reader.readAsDataURL(file);
    } else {
      console.error("No valid file selected");
    }
  };

  const handleRemoveImage = () => {
    if (hasNewImage) {
      // If user uploaded a new image, remove it and go back to original
      if (hasExistingImage && originalImageUrl) {
        setImagePreview(originalImageUrl);
        formik.setFieldValue("image", "EXISTING_IMAGE_PLACEHOLDER");
      } else {
        setImagePreview(null);
        formik.setFieldValue("image", null);
      }
      setHasNewImage(false);
    } else if (hasExistingImage) {
      // If removing original image, clear everything
      setImagePreview(null);
      setOriginalImageUrl(null);
      setHasExistingImage(false);
      setExistingImagePath(null);
      formik.setFieldValue("image", null);
      setHasNewImage(false);
    }

    // Reset file input safely
    const fileInput = document.getElementById("image-upload");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Handle cancel with modal
  const handleCancel = () => {
    setShowCancelModal(true);
  };

  // Cancel modal handlers
  const cancelCancel = () => {
    setShowCancelModal(false);
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    navigate("/managment");
  };

  // Loading state - also check for missing token
  if (!token) {
    return (
      <div className="min-h-screen bg-primary p-6 flex items-center justify-center">
        <div className="text-white text-lg">Checking authentication...</div>
      </div>
    );
  }

  if (isEdit && categoryLoading) {
    return (
      <div className="min-h-screen bg-primary p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading Category data...</div>
      </div>
    );
  }

  // Error state
  if (isEdit && error) {
    return (
      <div className="min-h-screen bg-primary p-6 flex items-center justify-center">
        <div className="text-red-400 text-lg">
          {error?.response?.data?.message || "Unknown error"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-secondary rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            {isEdit ? "Edit Category" : "Add New Category"}
          </h1>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Category Image{" "}
                {!isEdit && <span className="text-red-400">*</span>}
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 bg-white text-gray-800 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {imagePreview ? "Change Image" : "Choose Image"}
                  </label>
                </div>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Category Preview"
                      className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title={hasNewImage ? "Remove new image" : "Remove image"}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {hasNewImage && (
                <p className="text-green-400 text-sm mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  New image selected - will replace current image
                </p>
              )}
              {originalImageUrl && !hasNewImage && (
                <p className="text-blue-400 text-sm mt-1 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Using current Category image
                </p>
              )}
              {!originalImageUrl && !hasNewImage && isEdit && (
                <p className="text-yellow-400 text-sm mt-1 flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  No image set - please upload an image
                </p>
              )}

              {formik.touched.image && formik.errors.image && (
                <p className="text-red-400 text-sm mt-1">
                  {formik.errors.image}
                </p>
              )}
            </div>

            {/* Title Field */}
            <div>
              <label
                htmlFor="title"
                className="block text-white font-medium mb-2"
              >
                Category Name
              </label>
              <input
                id="title"
                name="title"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.title}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.title && formik.errors.title
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter category name"
              />
              {formik.touched.title && formik.errors.title && (
                <p className="text-red-400 text-sm mt-1">
                  {formik.errors.title}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white tracking-widest font-semibold py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 bg-popular hover:bg-opacity-90 text-white tracking-widest font-semibold py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-popular disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? "Updating..." : "Update Ingredient"}
              </button>
            </div>
          </form>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Confirm Cancel
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel? All unsaved changes will be
                lost.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={confirmCancel}
                  className="px-6 py-2 bg-popular hover:bg-popular text-white font-medium rounded-lg transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={cancelCancel}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
