import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSubCategory, getCategories } from "../../services/apis";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Validation schema using Yup
const categorySchema = Yup.object().shape({
  category: Yup.string().required("Category is required"),
  title: Yup.string()
    .min(2, "Title must be at least 2 characters")
    .max(50, "Title must be less than 50 characters")
    .required("Title is required"),
  image: Yup.mixed()
    .required("Image is required")
    .test("fileSize", "File size is too large (max 5MB)", (value) => {
      return value && value.size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Unsupported file format", (value) => {
      return (
        value &&
        ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(
          value.type
        )
      );
    }),
});

export default function SubCategoryAdd() {
  const [imagePreview, setImagePreview] = useState(null);
  const token = useSelector((store) => store.user.token);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Initial form values
  const initialValues = {
    category: "",
    title: "",
    image: null,
  };

  // Mutation for creating subcategory
  const { mutate, isLoading: isSubmitting } = useMutation({
    mutationKey: ["create-subcategory"],
    mutationFn: (payload) => createSubCategory(payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get-categories"],
      });
      toast.success("Sub category created successfully");
      navigate("/managment");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create sub category");
    },
  });

  // Query for getting categories
  const { data: categoryList, isLoading: categoriesLoading } = useQuery({
    queryKey: ["get-categories"],
    queryFn: () => getCategories(token),
  });

  // Handle image file selection
  const handleImageChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      setFieldValue("image", file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (values, { resetForm, setStatus }) => {
    setStatus(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("category", values.category);
      formData.append("title", values.title);
      formData.append("image", values.image);

      // Call mutation
      mutate(formData, {
        onSuccess: () => {
          resetForm();
          setImagePreview(null);
          setStatus({
            type: "success",
            message: "Sub category added successfully!",
          });
        },
        onError: (error) => {
          setStatus({
            type: "error",
            message:
              error?.message || "Failed to add sub category. Please try again.",
          });
        },
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Handle form reset
  const handleReset = (resetForm) => {
    resetForm();
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r bg-popular/90 text-white px-6 py-4">
            <h1 className="text-md sm:text-lg lg:text-2xl font-bold text-white">
              Add New Sub Category
            </h1>
            <p className="mt-1 text-sm sm:text-base">
              Create a new sub category for your menu items
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            <Formik
              initialValues={initialValues}
              validationSchema={categorySchema}
              onSubmit={handleSubmit}
            >
              {({ setFieldValue, status, values, resetForm }) => (
                <Form className="space-y-6">
                  {/* Status Messages */}
                  {status && (
                    <div
                      className={`p-4 rounded-md ${
                        status.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {status.message}
                    </div>
                  )}

                  {/* Category Selection Field */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      Parent Category *
                    </label>
                    <Field
                      as="select"
                      id="category"
                      name="category"
                      className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white"
                      disabled={categoriesLoading}
                    >
                      <option value="">
                        {categoriesLoading
                          ? "Loading categories..."
                          : "Select a parent category"}
                      </option>
                      {categoryList?.map((category, index) => (
                        <option
                          key={category._id || index}
                          value={category._id}
                        >
                          {category.title}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="category"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  {/* Sub Category Title Field */}
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      Sub Category Title *
                    </label>
                    <Field
                      type="text"
                      id="title"
                      name="title"
                      placeholder="Enter sub category title (e.g., Appetizers, Main Courses)"
                      className="w-full px-4 py-3 border-popular/60 border-[1px] bg-secondary rounded-lg focus:outline-none transition-colors text-white placeholder-gray-400"
                    />
                    <ErrorMessage
                      name="title"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  {/* Image Upload Field */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Sub Category Image *
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-popular/60 border-dashed rounded-lg hover:border-popular/80 transition-colors cursor-pointer">
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="mb-4">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="mx-auto h-32 w-32 object-cover rounded-lg shadow-md"
                            />
                            <p className="text-sm text-gray-400 mt-2">
                              {values.image?.name}
                            </p>
                          </div>
                        ) : (
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="image"
                            className="relative cursor-pointer bg-popular/20 rounded-md font-medium text-popular hover:text-popular/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-popular px-2 py-1"
                          >
                            <span>Upload a file</span>
                            <input
                              id="image"
                              name="image"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(event) =>
                                handleImageChange(event, setFieldValue)
                              }
                            />
                          </label>
                          <p className="pl-1 text-gray-400">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                    <ErrorMessage
                      name="image"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center gap-x-4 gap-y-3 flex-wrap">
                    <button
                      className="bg-popular hover:bg-popular/90 py-2 px-4 rounded-md font-semibold w-full sm:w-fit text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Add Sub Category"}
                    </button>
                    <button
                      className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded-md font-semibold w-full sm:w-fit text-white transition-colors"
                      type="button"
                      onClick={() => handleReset(resetForm)}
                      disabled={isSubmitting}
                    >
                      Reset
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-secondary rounded-lg p-4">
          <h3 className="text-sm font-medium text-popular mb-2">
            Instructions:
          </h3>
          <ul className="text-sm text-white space-y-1">
            <li>• Select a parent category from the dropdown</li>
            <li>• Sub category title should be descriptive and concise</li>
            <li>• Image should be clear and represent the sub category well</li>
            <li>• Supported formats: JPG, PNG, GIF (max 5MB)</li>
            <li>• Recommended image size: 300x300 pixels or larger</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
