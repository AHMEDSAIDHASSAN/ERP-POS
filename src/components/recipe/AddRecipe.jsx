import { useMutation, useQuery } from "@tanstack/react-query";
import { createRecipe, getproducts, getInventory } from "../../services/apis";
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { ChefHat, Plus, X, Package, Leaf } from "lucide-react";

// Validation Schema
const validationSchema = Yup.object({
  product: Yup.string().required("Product is required"),
  ingredients: Yup.array()
    .of(
      Yup.object().shape({
        ingredientType: Yup.string()
          .required("Ingredient type is required")
          .oneOf(["inventory", "product"], "Invalid ingredient type"),
        inventoryItem: Yup.string().when("ingredientType", {
          is: "inventory",
          then: (schema) => schema.required("Inventory item is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        subProduct: Yup.string().when("ingredientType", {
          is: "product",
          then: (schema) => schema.required("Sub-product is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        quantity: Yup.number()
          .required("Quantity is required")
          .positive("Quantity must be positive")
          .min(0.01, "Quantity must be at least 0.01"),
        unit: Yup.string()
          .required("Unit is required")
          .min(1, "Unit must be at least 1 character")
          .max(20, "Unit must not exceed 20 characters"),
      })
    )
    .min(1, "At least one ingredient is required")
    .max(50, "Maximum 50 ingredients allowed"),
  notes: Yup.string().max(500, "Notes must not exceed 500 characters").trim(),
});

export default function AddRecipe() {
  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);
  const [selectedProduct, setSelectedProduct] = useState("");

  // Queries
  const {
    data: productList,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["get-products"],
    queryFn: () => getproducts(token),
    refetchOnWindowFocus: false,
  });

  const {
    data,
    isLoading: inventoryLoading,
    error: inventoryError,
  } = useQuery({
    queryKey: ["get-inventory"],
    queryFn: () => getInventory(token),
    refetchOnWindowFocus: false,
  });

  let inventoryList = data?.data || [];

  // Filter out the selected product from available sub-products to prevent self-reference
  const availableSubProducts = productList?.filter(
    (p) => p._id !== selectedProduct
  ) || [];

  // Mutation
  const { mutate, isLoading: isSubmitting } = useMutation({
    mutationKey: ["add-recipe"],
    mutationFn: (payload) => createRecipe(payload, token),
    onSuccess: (res) => {
      toast.success("Recipe added successfully!");
      navigate("/recipe");
    },
    onError: (error) => {
      console.error("Error adding recipe:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add recipe. Please try again.";
      toast.error(errorMessage);
    },
  });

  const formik = useFormik({
    initialValues: {
      product: "",
      ingredients: [
        {
          ingredientType: "inventory",
          inventoryItem: "",
          subProduct: "",
          quantity: "",
          unit: "",
        },
      ],
      notes: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Prepare the payload
        const payload = {
          product: values.product,
          ingredients: values.ingredients.map((ing) => {
            const ingredient = {
              ingredientType: ing.ingredientType,
              quantity: parseFloat(ing.quantity),
              unit: ing.unit.toLowerCase(),
            };

            if (ing.ingredientType === "inventory") {
              ingredient.inventoryItem = ing.inventoryItem;
            } else {
              ingredient.subProduct = ing.subProduct;
            }

            return ingredient;
          }),
          notes: values.notes.trim(),
        };

        mutate(payload);
      } catch (error) {
        console.error("Error preparing form data:", error);
        toast.error("Error preparing data. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    formik.setFieldValue("product", productId);
  };

  const addIngredient = () => {
    if (formik.values.ingredients.length < 50) {
      const newIngredients = [
        ...formik.values.ingredients,
        {
          ingredientType: "inventory",
          inventoryItem: "",
          subProduct: "",
          quantity: "",
          unit: "",
        },
      ];
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

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formik.values.ingredients];
    newIngredients[index][field] = value;

    // Auto-fill unit when inventory item or sub-product is selected
    if (field === "inventoryItem" && value) {
      // Use == for comparison to handle type coercion (select value is string, _id may be number)
      const selectedItem = inventoryList?.find((item) => String(item._id) === String(value));
      if (selectedItem && selectedItem.unit) {
        newIngredients[index].unit = selectedItem.unit;
      }
    } else if (field === "subProduct" && value) {
      // For sub-products, use "piece" as default unit
      newIngredients[index].unit = "piece";
    } else if (field === "ingredientType") {
      // Reset fields when changing type
      newIngredients[index].inventoryItem = "";
      newIngredients[index].subProduct = "";
      newIngredients[index].unit = "";
    }

    formik.setFieldValue("ingredients", newIngredients);
  };

  const handleReset = () => {
    formik.resetForm();
    setSelectedProduct("");
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-secondary shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r bg-popular/90 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8" />
              <div>
                <h1 className="text-md sm:text-lg lg:text-2xl font-bold text-white">
                  Add New Recipe
                </h1>
                <p className="mt-1 text-sm sm:text-base">
                  Create a recipe for your products with inventory items and sub-products
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={formik.handleSubmit}
            className="w-2/3 mx-auto py-6 space-y-6"
          >
            {/* Product Selection */}
            <div className="w-full">
              <label className="block font-semibold mb-2">Product *</label>
              <select
                name="product"
                value={formik.values.product}
                onChange={handleProductChange}
                onBlur={formik.handleBlur}
                className={`w-full bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular ${
                  formik.touched.product && formik.errors.product
                    ? "border-red-500"
                    : "border-popular"
                }`}
              >
                <option value="" className="bg-secondary">
                  {productsLoading
                    ? "Loading..."
                    : productsError
                    ? "Error loading products"
                    : "Select Product"}
                </option>
                {productList?.map((product) => (
                  <option
                    key={product._id}
                    className="bg-secondary"
                    value={product._id}
                  >
                    {product.title}
                  </option>
                ))}
              </select>
              {formik.touched.product && formik.errors.product && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.product}
                </p>
              )}
            </div>

            {/* Ingredients */}
            <div className="w-full">
              <label className="block font-semibold mb-2">
                Ingredients * ({formik.values.ingredients.length}/50)
              </label>
              <div className="space-y-4">
                {formik.values.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="border border-gray-600 rounded-lg p-4 bg-primary/30"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-white flex items-center gap-2">
                        {ingredient.ingredientType === "inventory" ? (
                          <>
                            <Leaf className="w-4 h-4 text-green-400" />
                            <span>Raw Material {index + 1}</span>
                          </>
                        ) : (
                          <>
                            <Package className="w-4 h-4 text-blue-400" />
                            <span>Sub-Product {index + 1}</span>
                          </>
                        )}
                      </h4>
                      {formik.values.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredient(index)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          title="Remove ingredient"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Ingredient Type Selector */}
                      <div>
                        <label className="block text-sm mb-1">
                          Ingredient Type *
                        </label>
                        <select
                          value={ingredient.ingredientType}
                          onChange={(e) =>
                            updateIngredient(index, "ingredientType", e.target.value)
                          }
                          onBlur={formik.handleBlur}
                          className="w-full bg-transparent border border-popular rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-popular"
                        >
                          <option value="inventory" className="bg-secondary">
                            Raw Material (Inventory)
                          </option>
                          <option value="product" className="bg-secondary">
                            Sub-Product (Finished/Semi-finished)
                          </option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Inventory Item or Sub-Product */}
                        <div className="md:col-span-1">
                          <label className="block text-sm mb-1">
                            {ingredient.ingredientType === "inventory"
                              ? "Inventory Item *"
                              : "Sub-Product *"}
                          </label>
                          {ingredient.ingredientType === "inventory" ? (
                            <select
                              value={ingredient.inventoryItem}
                              onChange={(e) =>
                                updateIngredient(
                                  index,
                                  "inventoryItem",
                                  e.target.value
                                )
                              }
                              onBlur={formik.handleBlur}
                              className={`w-full bg-transparent border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-popular ${
                                formik.touched.ingredients?.[index]?.inventoryItem &&
                                formik.errors.ingredients?.[index]?.inventoryItem
                                  ? "border-red-500"
                                  : "border-popular"
                              }`}
                            >
                              <option value="" className="bg-secondary">
                                {inventoryLoading
                                  ? "Loading..."
                                  : inventoryError
                                  ? "Error"
                                  : "Select Item"}
                              </option>
                              {inventoryList?.map((item) => (
                                <option
                                  key={item._id}
                                  className="bg-secondary"
                                  value={item._id}
                                >
                                  {item.productName} ({item.unit})
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={ingredient.subProduct}
                              onChange={(e) =>
                                updateIngredient(index, "subProduct", e.target.value)
                              }
                              onBlur={formik.handleBlur}
                              className={`w-full bg-transparent border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-popular ${
                                formik.touched.ingredients?.[index]?.subProduct &&
                                formik.errors.ingredients?.[index]?.subProduct
                                  ? "border-red-500"
                                  : "border-popular"
                              }`}
                            >
                              <option value="" className="bg-secondary">
                                {productsLoading
                                  ? "Loading..."
                                  : productsError
                                  ? "Error"
                                  : "Select Product"}
                              </option>
                              {availableSubProducts?.map((product) => (
                                <option
                                  key={product._id}
                                  className="bg-secondary"
                                  value={product._id}
                                >
                                  {product.title}
                                </option>
                              ))}
                            </select>
                          )}
                          {formik.touched.ingredients?.[index]?.inventoryItem &&
                            formik.errors.ingredients?.[index]?.inventoryItem && (
                              <p className="text-red-500 text-xs mt-1">
                                {formik.errors.ingredients[index].inventoryItem}
                              </p>
                            )}
                          {formik.touched.ingredients?.[index]?.subProduct &&
                            formik.errors.ingredients?.[index]?.subProduct && (
                              <p className="text-red-500 text-xs mt-1">
                                {formik.errors.ingredients[index].subProduct}
                              </p>
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-sm mb-1">Quantity *</label>
                          <input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) =>
                              updateIngredient(index, "quantity", e.target.value)
                            }
                            onBlur={formik.handleBlur}
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            className={`w-full bg-transparent border rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-popular ${
                              formik.touched.ingredients?.[index]?.quantity &&
                              formik.errors.ingredients?.[index]?.quantity
                                ? "border-red-500"
                                : "border-popular"
                            }`}
                          />
                          {formik.touched.ingredients?.[index]?.quantity &&
                            formik.errors.ingredients?.[index]?.quantity && (
                              <p className="text-red-500 text-xs mt-1">
                                {formik.errors.ingredients[index].quantity}
                              </p>
                            )}
                        </div>

                        {/* Unit */}
                        <div>
                          <label className="block text-sm mb-1">Unit *</label>
                          <input
                            type="text"
                            value={ingredient.unit}
                            readOnly
                            disabled
                            placeholder="Auto-filled from inventory"
                            className={`w-full bg-gray-800/50 border rounded-md py-2 px-3 text-sm cursor-not-allowed opacity-75 ${
                              formik.touched.ingredients?.[index]?.unit &&
                              formik.errors.ingredients?.[index]?.unit
                                ? "border-red-500"
                                : "border-gray-600"
                            }`}
                            title="Unit is automatically set from the selected item"
                          />
                          {formik.touched.ingredients?.[index]?.unit &&
                            formik.errors.ingredients?.[index]?.unit && (
                              <p className="text-red-500 text-xs mt-1">
                                {formik.errors.ingredients[index].unit}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {formik.values.ingredients.length < 50 && (
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="flex items-center gap-2 text-popular hover:text-popular/80 font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add More Ingredient
                  </button>
                )}
              </div>

              {/* Display ingredient errors */}
              {formik.touched.ingredients &&
                typeof formik.errors.ingredients === "string" && (
                  <p className="text-red-500 text-sm mt-2">
                    {formik.errors.ingredients}
                  </p>
                )}
            </div>

            {/* Notes */}
            <div className="w-full">
              <label className="block font-semibold mb-2">
                Recipe Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter preparation notes, cooking instructions, etc."
                rows={4}
                className={`w-full bg-transparent border rounded-md py-2 px-3 border-[1px] focus:outline-none focus:ring-2 focus:ring-popular resize-vertical ${
                  formik.touched.notes && formik.errors.notes
                    ? "border-red-500"
                    : "border-popular"
                }`}
              />
              {formik.touched.notes && formik.errors.notes && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.notes}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {formik.values.notes.length}/500 characters
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-start gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !formik.isValid || !formik.dirty}
                className="bg-popular text-white px-8 py-3 rounded-md font-semibold hover:bg-popular/80 focus:outline-none focus:ring-2 focus:ring-popular focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Adding Recipe..." : "Add Recipe"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting}
                className="bg-gray-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => navigate("/recipe")}
                disabled={isSubmitting}
                className="bg-gray-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
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
            <li>• Select the product this recipe is for</li>
            <li>
              • Choose ingredient type: Raw Material (from inventory) or Sub-Product (another finished/semi-finished product)
            </li>
            <li>
              • <span className="text-green-400">Raw Materials</span> are consumed from inventory stock
            </li>
            <li>
              • <span className="text-blue-400">Sub-Products</span> must have their own recipes (creates hierarchical recipes)
            </li>
            <li>• Specify the quantity for each ingredient</li>
            <li>
              • Units are automatically set from the inventory item or "piece" for sub-products
            </li>
            <li>• Add preparation notes if needed (max 500 characters)</li>
            <li>
              • Each product can only have one recipe (you can edit it later)
            </li>
            <li>• Minimum 1 ingredient, maximum 50 ingredients allowed</li>
            <li>
              • <strong>Note:</strong> The system prevents circular dependencies (A cannot use B if B uses A)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
