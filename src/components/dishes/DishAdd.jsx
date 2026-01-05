import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createProduct,
  get_kitchens,
  getCategories,
  getsubCategoryByCategorie,
} from "../../services/apis";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

// Validation Schema
const validationSchema = Yup.object({
  title: Yup.string()
    .required("Dish name is required")
    .min(2, "Dish name must be at least 2 characters")
    .max(100, "Dish name must not exceed 100 characters")
    .trim(),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters")
    .trim(),
  category: Yup.string().required("Category is required"),
  subCategory: Yup.string().required("Sub category is required"),
  kitchen: Yup.string().required("Kitchen is required"),
  price: Yup.number()
    .required("Price is required")
    .positive("Price must be positive")
    .min(0.01, "Price must be at least 0.01")
    .max(9999.99, "Price cannot exceed 9999.99"),
  ingredients: Yup.array()
    .of(
      Yup.string()
        .required("Ingredient cannot be empty")
        .min(1, "Ingredient must be at least 1 character")
        .max(50, "Ingredient must not exceed 50 characters")
        .trim()
    )
    .min(1, "At least one ingredient is required")
    .max(20, "Maximum 20 ingredients allowed"),
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

export default function DishAdd() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  // Queries
  const token = useSelector((store) => store.user.token);
  const {
    data: KitchenList,
    isLoading: kitchenLoading,
    error: kitchenError,
  } = useQuery({
    queryKey: ["get-kitchens"],
    queryFn: () => get_kitchens(token),
    refetchOnWindowFocus: false,
  });

  const {
    data: categoryList,
    isLoading: categoryLoading,
    error: categoryError,
  } = useQuery({
    queryKey: ["get-categories"],
    queryFn: () => getCategories(token),
    refetchOnWindowFocus: false,
  });

  const {
    data: subCategoryList,
    isLoading: subLoading,
    error: subError,
  } = useQuery({
    queryKey: ["get-sub-categories", selectedCategory],
    queryFn: () => getsubCategoryByCategorie(selectedCategory, token),
    refetchOnWindowFocus: false,
    enabled: !!selectedCategory,
  });

  // Mutation
  const { mutate, isLoading: isSubmitting } = useMutation({
    mutationKey: ["add-product"],
    mutationFn: (payload) => createProduct(payload, token),
    onSuccess: (res) => {
      toast.success("Product added successfully!");
      navigate("/managment");
    },
    onError: (error) => {
      console.error("Error adding dish:", error);
      toast.error(error?.message || "Failed to add dish. Please try again.");
    },
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      category: "",
      subCategory: "",
      kitchen: "",
      price: "",
      ingredients: [""], // Start with one empty ingredient field
      image: null,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Create FormData for file upload
        const formData = new FormData();

        // Append all fields except ingredients
        Object.keys(values).forEach((key) => {
          if (key !== "ingredients") {
            formData.append(key, values[key]);
          }
        });

        // Handle ingredients array properly
        values.ingredients.forEach((ingredient, index) => {
          if (ingredient.trim()) {
            formData.append(`ingredients[${index}]`, ingredient.trim());
          }
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
    formik.setFieldValue("subCategory", ""); // Reset subcategory when category changes
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

  const addIngredient = () => {
    if (formik.values.ingredients.length < 20) {
      const newIngredients = [...formik.values.ingredients, ""];
      formik.setFieldValue("ingredients", newIngredients);
    }
  };

  const removeIngredient = (index) => {
    if (formik.values.ingredients.length > 1) {
      const newIngredients = formik.values.ingredients.filter(
        (_, i) => i !== index
      );
      formik.setFieldValue("ingredients", newIngredients);
    }
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...formik.values.ingredients];
    newIngredients[index] = value;
    formik.setFieldValue("ingredients", newIngredients);
  };

  const handleReset = () => {
    formik.resetForm();
    setSelectedCategory("");
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r bg-popular/90 text-white px-6 py-4">
            <h1 className="text-md sm:text-lg lg:text-2xl font-bold text-white">
              Add New Dish
            </h1>
            <p className="mt-1 text-sm sm:text-base">
              Create a new dish for your menu items
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={formik.handleSubmit}
            className="w-2/3 mx-auto py-6 space-y-6"
          >
            {/* Dish Name */}
            <div className="w-full">
              <label className="block font-semibold mb-2">Dish Name *</label>
              <input
                type="text"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter dish name"
                className={`w-full bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.title && formik.errors.title
                    ? "border-red-500"
                    : "border-popular"
                }`}
              />
              {formik.touched.title && formik.errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.title}
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
                value={formik.values.category}
                onChange={handleCategoryChange}
                onBlur={formik.handleBlur}
                className={`w-full bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.category && formik.errors.category
                    ? "border-red-500"
                    : "border-popular"
                }`}
              >
                <option value="" className="bg-secondary">
                  {categoryLoading
                    ? "Loading..."
                    : categoryError
                    ? "Error loading categories"
                    : "Select Category"}
                </option>
                {categoryList?.map((ele) => (
                  <option
                    key={ele._id}
                    className="bg-secondary"
                    value={ele._id}
                  >
                    {ele?.title}
                  </option>
                ))}
              </select>
              {formik.touched.category && formik.errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.category}
                </p>
              )}
            </div>

            {/* Sub Category */}
            <div className="w-full">
              <label className="block font-semibold mb-2">Sub Category *</label>
              <select
                name="subCategory"
                value={formik.values.subCategory}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!selectedCategory || subLoading}
                className={`w-full bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular disabled:opacity-50 disabled:cursor-not-allowed ${
                  formik.touched.subCategory && formik.errors.subCategory
                    ? "border-red-500"
                    : "border-popular"
                }`}
              >
                <option value="" className="bg-secondary">
                  {subLoading
                    ? "Loading..."
                    : !selectedCategory
                    ? "Select Category First"
                    : subError
                    ? "Error loading subcategories"
                    : "Select Sub Category"}
                </option>
                {subCategoryList?.map((ele) => (
                  <option
                    key={ele._id}
                    className="bg-secondary"
                    value={ele._id}
                  >
                    {ele?.title}
                  </option>
                ))}
              </select>
              {formik.touched.subCategory && formik.errors.subCategory && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.subCategory}
                </p>
              )}
            </div>

            {/* Kitchen */}
            <div className="w-full">
              <label className="block font-semibold mb-2">Kitchen *</label>
              <select
                name="kitchen"
                value={formik.values.kitchen}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.kitchen && formik.errors.kitchen
                    ? "border-red-500"
                    : "border-popular"
                }`}
              >
                <option value="" className="bg-secondary">
                  {kitchenLoading
                    ? "Loading..."
                    : kitchenError
                    ? "Error loading kitchens"
                    : "Select Kitchen"}
                </option>
                {KitchenList?.map((ele) => (
                  <option
                    key={ele._id}
                    className="bg-secondary"
                    value={ele._id}
                  >
                    {ele?.name}
                  </option>
                ))}
              </select>
              {formik.touched.kitchen && formik.errors.kitchen && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.kitchen}
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

            {/* Ingredients */}
            <div className="w-full">
              <label className="block font-semibold mb-2">
                Ingredients * ({formik.values.ingredients.length}/20)
              </label>
              <div className="space-y-3">
                {formik.values.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      onBlur={formik.handleBlur}
                      placeholder={`Ingredient ${index + 1}`}
                      className={`flex-1 bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular ${
                        formik.touched.ingredients?.[index] &&
                        formik.errors.ingredients?.[index]
                          ? "border-red-500"
                          : "border-popular"
                      }`}
                    />
                    {formik.values.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                        title="Remove ingredient"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                {formik.values.ingredients.length < 20 && (
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="flex items-center gap-2 text-popular hover:text-popular/80 font-medium transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add More Ingredient
                  </button>
                )}
              </div>

              {/* Display ingredient errors */}
              {formik.touched.ingredients && formik.errors.ingredients && (
                <div className="mt-2">
                  {typeof formik.errors.ingredients === "string" ? (
                    <p className="text-red-500 text-sm">
                      {formik.errors.ingredients}
                    </p>
                  ) : (
                    formik.errors.ingredients.map(
                      (error, index) =>
                        error && (
                          <p key={index} className="text-red-500 text-sm">
                            Ingredient {index + 1}: {error}
                          </p>
                        )
                    )
                  )}
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div className="w-full">
              <label className="block font-semibold mb-2">Dish Image *</label>
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
                {isSubmitting ? "Adding Dish..." : "Add Dish"}
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
            <li>• Dish name should be descriptive and concise</li>
            <li>
              • Description should explain the dish ingredients and preparation
            </li>
            <li>
              • Select appropriate category and subcategory for better
              organization
            </li>
            <li>
              • Add all ingredients one by one using the "Add More Ingredient"
              button (max 20)
            </li>
            <li>
              • Price should be accurate and include currency considerations
              (max $9999.99)
            </li>
            <li>• Image should be clear and represent the dish well</li>
            <li>• Supported formats: JPG, PNG, GIF, WebP (max 5MB)</li>
            <li>• Recommended image size: 300x300 pixels or larger</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
