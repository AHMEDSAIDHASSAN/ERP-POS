import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "../../services/apis";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Validation schema using Yup
const categorySchema = Yup.object().shape({
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

export default function CategoryAdd() {
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    title: "",
    image: null,
  };

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

  const handleSubmit = async (values, { resetForm, setStatus }) => {
    setIsSubmitting(true);
    setStatus(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("image", values.image);
      mutate(formData);

      // Simulate API call - replace with your actual API endpoint

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success
      setStatus({ type: "success", message: "Category added successfully!" });
      resetForm();
      setImagePreview(null);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to add category. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const qureryClient = useQueryClient();
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);
  const { mutate } = useMutation({
    mutationKey: ["create-category"],
    mutationFn: (payload) => createCategory(payload, token),
    onSuccess: () => {
      qureryClient.invalidateQueries({
        queryKey: ["get-Categotys"],
      });
      toast.success("category created successfully");
      navigate("/managment");
    },
  });
  return (
    <div className="min-h-screen  py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r bg-popular/90 text-white px-6 py-4">
            <h1 className=" text-md sm:text-lg lg:text-2xl font-bold text-white">
              Add New Category
            </h1>
            <p className=" mt-1 text-sm sm:text-base">
              Create a new category for your menu items
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            <Formik
              initialValues={initialValues}
              validationSchema={categorySchema}
              onSubmit={handleSubmit}
            >
              {({ setFieldValue, status, values }) => (
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

                  {/* Title Field */}
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      Category Title *
                    </label>
                    <Field
                      type="text"
                      id="title"
                      name="title"
                      placeholder="Enter category title (e.g., Appetizers, Main Courses)"
                      className="w-full px-4 py-3 border-popular/60 border-[1px]  bg-secondary rounded-lg focus:outline-none transition-colors"
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
                      Category Image *
                    </label>
                    <label
                      htmlFor="image"
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2  border-popular/60 border-dashed rounded-lg  transition-colors"
                    >
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="mb-4">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="mx-auto h-32 w-32 object-cover rounded-lg shadow-md"
                            />
                            <p className="text-sm text-gray-500 mt-2">
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
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
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
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </label>
                    <ErrorMessage
                      name="image"
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center gap-x-4  gap-y-3 flex-wrap">
                    <button
                      className="bg-popular py-2 px-3 rounded-md font-semibold w-full sm:w-fit "
                      type="submit"
                      disabled={isSubmitting}
                    >
                      Add Category
                    </button>
                    <button
                      className="bg-gray-500 py-2 px-3 rounded-md font-semibold w-full sm:w-fit  "
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        // Reset form if using Formik's resetForm
                      }}
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
        <div className="mt-6 bg-secondary  rounded-lg p-4">
          <h3 className="text-sm font-medium text-popular mb-2">
            Instructions:
          </h3>
          <ul className="text-sm text-white space-y-1">
            <li>• Category title should be descriptive and concise</li>
            <li>• Image should be clear and represent the category well</li>
            <li>• Supported formats: JPG, PNG, GIF (max 5MB)</li>
            <li>• Recommended image size: 300x300 pixels or larger</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
