import { useMutation, useQuery } from "@tanstack/react-query";
import { createIngredinet } from "../../services/apis";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

// Validation Schema
const validationSchema = Yup.object({
  name: Yup.string()
    .required("Ingredient name is required")
    .min(2, "Ingredient name must be at least 2 characters")
    .max(100, "Ingredient name must not exceed 100 characters")
    .trim(),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters")
    .trim(),
  category: Yup.string().required("Category is required"),
  price: Yup.number()
    .required("Price is required")
    .positive("Price must be positive")
    .min(0.01, "Price must be at least 0.01")
    .max(9999.99, "Price cannot exceed 9999.99"),
  image: Yup.mixed()
    .required("Image is required")
    .test("fileSize", "File size is too large (max 5MB)", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB
    })
    .test("fileType", "Unsupported file format", (value) => {
      if (!value) return true;
      return [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ].includes(value.type);
    }),
});

export default function IngredientAdd() {
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  // Queries
  const token = useSelector((store) => store.user.token);

  // Mutation
  const { mutate, isLoading: isSubmitting } = useMutation({
    mutationKey: ["add-ingredient"],
    mutationFn: (payload) => createIngredinet(payload, token),
    onSuccess: (res) => {
      toast.success("Ingredient added successfully!");
      navigate("/managment");
    },
    onError: (error) => {
      console.error("Error adding Ingredient:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to add Ingredient. Please try again."
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      image: null,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Create FormData for file upload
        const formData = new FormData();

        // Append all fields except ingredients
        Object.keys(values).forEach((key) => {
          formData.append(key, values[key]);
        });

        mutate(formData);
      } catch (error) {
        console.error("Error preparing form data:", error);
        toast.error("Error preparing data. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    formik.setFieldValue("category", categoryId);
  };

  const handleReset = () => {
    formik.resetForm();
    setImagePreview(null);
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("image", file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r bg-popular/90 text-white px-6 py-4">
            <h1 className="text-md sm:text-lg lg:text-2xl font-bold text-white">
              Add New Ingredient
            </h1>
            <p className="mt-1 text-sm sm:text-base">Create a new ingrediet</p>
          </div>

          {/* Form */}
          <form
            onSubmit={formik.handleSubmit}
            className="w-2/3 mx-auto py-6 space-y-6"
          >
            {/* Dish Name */}
            <div className="w-full">
              <label className="block font-semibold mb-2">
                Ingredient Name *
              </label>
              <input
                type="text"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter dish name"
                className={`w-full bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.name && formik.errors.name
                    ? "border-red-500"
                    : "border-popular"
                }`}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="w-full">
              <label className="block font-semibold mb-2">Description *</label>
              <textarea
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter dish description"
                rows={4}
                className={`w-full bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular resize-vertical ${
                  formik.touched.description && formik.errors.description
                    ? "border-red-500"
                    : "border-popular"
                }`}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.description}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="w-full">
              <label className="block font-semibold mb-2">Category *</label>
              <select
                name="category"
                value={formik.values.category || "sauce"}
                onChange={handleCategoryChange}
                onBlur={formik.handleBlur}
                className={`w-full bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.category && formik.errors.category
                    ? "border-red-500"
                    : "border-popular"
                }`}
              >
                <option className="bg-secondary" value={"sauce"} key={"sauce"}>
                  sauce
                </option>
                <option
                  className="bg-secondary"
                  value={"vegetable"}
                  key={"vegetable"}
                >
                  vegetable
                </option>
                <option
                  className="bg-secondary"
                  value={"protein"}
                  key={"protein"}
                >
                  protein
                </option>
                <option
                  className="bg-secondary"
                  value={"cheese"}
                  key={"cheese"}
                >
                  cheese
                </option>
                <option className="bg-secondary" value={"bread"} key={"bread"}>
                  bread
                </option>
                <option className="bg-secondary" value={"other"} key={"other"}>
                  other
                </option>
              </select>
              {formik.touched.category && formik.errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.category}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="w-full">
              <label className="block font-semibold mb-2">Price *</label>
              <input
                type="text"
                name="price"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="0.00"
                step="0.01"
                min="0"
                max="9999.99"
                className={`w-full bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.price && formik.errors.price
                    ? "border-red-500"
                    : "border-popular"
                }`}
              />
              {formik.touched.price && formik.errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.price}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="w-full">
              <label className="block font-semibold mb-2">
                Ingredient Image *
              </label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                onBlur={formik.handleBlur}
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className={`w-full bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-popular file:text-white hover:file:bg-popular/80 ${
                  formik.touched.image && formik.errors.image
                    ? "border-red-500"
                    : "border-popular"
                }`}
              />
              {formik.touched.image && formik.errors.image && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.image}
                </p>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-md border border-popular"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        formik.setFieldValue("image", null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-start gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !formik.isValid || !formik.dirty}
                className="bg-popular text-white px-8 py-3 rounded-md font-semibold hover:bg-popular/80 focus:outline-none focus:ring-2 focus:ring-popular focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Adding Ingreding..." : "Add Ingredient"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="bg-gray-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-secondary rounded-lg p-4">
          <h3 className="text-sm font-medium text-popular mb-2">
            Instructions:
          </h3>
          <ul className="text-sm text-white space-y-1">
            <li>• Ingredient name should be descriptive and concise</li>
            <li>• Description should explain ingredient</li>

            <li>
              • Add all ingredients one by one using the "Add More Ingredient"
              button (max 20)
            </li>
            <li>
              • Price should be accurate and include currency considerations
              (max $9999.99)
            </li>
            <li>• Image should be clear and represent the ingredient well</li>
            <li>• Supported formats: JPG, PNG, GIF, WebP (max 5MB)</li>
            <li>• Recommended image size: 300x300 pixels or larger</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
