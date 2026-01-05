import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteInventory, updateInventory } from "../../services/apis";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  // Check if date is valid
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function InventoryTable({ data, onUpdate }) {
  const [showPopup, setShowPopup] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    code: "",
    price: "",
    unit: "",
    quantity: "",
  });

  const navigate = useNavigate();
  const token = useSelector((store) => store.user.token);
  const queryClient = useQueryClient();
  const { mutate: deletemutation } = useMutation({
    mutationKey: ["delete-inventory"],
    mutationFn: (payload) => deleteInventory(token, payload.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_inventory"],
      });
    },
  });

  // Fixed mutation with proper error handling and success callbacks
  const { mutate, isLoading, error } = useMutation({
    mutationKey: ["update_item_inventory"],
    mutationFn: (payload) => updateInventory(token, payload, editingItem._id),
    onSuccess: (data) => {
      toast.success("item updated successfully");

      queryClient.invalidateQueries({ queryKey: ["get_inventory"] });

      if (onUpdate) {
        onUpdate(data);
      }

      // Close popup
      closePopup();
    },
    onError: (error) => {
      console.error("Update failed:", error);

      // Show error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update item";
      toast.error(`${errorMessage}`);
    },
  });

  // Initialize form when editing item changes
  useEffect(() => {
    if (editingItem) {
      setFormData({
        productName: editingItem.productName || "",
        code: editingItem.code || "",
        // price: editingItem.price?.toString() || "",
        unit: editingItem.unit || "",
        // quantity: editingItem.quantity?.toString() || "",
      });
    }
  }, [editingItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowPopup(true);
  };

  const handleSubmit = () => {
    // Validate form
    if (
      !formData.code.trim() ||
      !formData.productName.trim() ||
      // !formData.price ||
      !formData.unit.trim()
      // !formData.quantity
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate numeric fields
    // const price = parseFloat(formData.price);
    // const quantity = parseInt(formData.quantity);

    // if (isNaN(price) || price < 0) {
    //   toast.warn("please enter valid price");
    //   return;
    // }

    // if (isNaN(quantity) || quantity < 0) {
    //   toast.warn("please enter valid quantity");

    //   return;
    // }

    const updatedData = {
      code: formData.code.trim(),
      productName: formData.productName.trim(),
      // price: price,
      unit: formData.unit.trim(),
      // quantity: quantity,
    };

    // Call mutation
    mutate(updatedData);
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditingItem(null);
    setFormData({
      productName: "",
      code: "",
      // price: "",
      unit: "",
      // quantity: "",
    });
  };

  // Handle case where data might be undefined or not an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-secondary rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary">
            <tr>
              <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                Updated At
              </th>
              <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-white">
            {safeData.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                  No inventory items found
                </td>
              </tr>
            ) : (
              safeData.map((item, index) => (
                <tr
                  key={item._id || index}
                  className={`transition-colors text-center ${
                    index % 2 === 0 ? "bg-secondary" : "bg-primary"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white capitalize">
                      {item?.productName || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white capitalize">
                      {item?.code || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white capitalize">
                      {item?.status || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {item.quantity ?? "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      ${item.totalValue ?? "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {item.createdAt ? formatDate(item.createdAt) : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {item.updatedAt ? formatDate(item.updatedAt) : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    <div className="flex gap-x-3 items-center justify-center">
                      <div
                        className="text-blue-500 cursor-pointer hover:text-blue-400 transition-colors"
                        onClick={() => handleEdit(item)}
                        title="Edit item"
                      >
                        <Edit size={20} />
                      </div>
                      <div
                        className="text-popular cursor-pointer hover:text-popular/50 transition-colors"
                        onClick={() => navigate(`/inventory/${item._id}`)}
                        title="Edit item"
                      >
                        <Eye size={20} />
                      </div>
                      {/* <div
                        className="text-red-500 cursor-pointer hover:text-red-400 transition-colors"
                        onClick={() => deletemutation({ id: item._id })}
                        title="Delete item"
                      >
                        <Trash size={20} />
                      </div> */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Update Item</h3>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-white text-2xl font-bold leading-none"
                disabled={isLoading}
              >
                ×
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-200 text-sm">
                Error:{" "}
                {error?.response?.data?.message ||
                  error?.message ||
                  "Update failed"}
              </div>
            )}

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label
                  htmlFor="productName"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Product Code */}
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Product Code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter product code"
                  required
                />
              </div>

              {/* Price */}
              {/* <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50"
                  placeholder="0.00"
                  required
                />
              </div> */}

              {/* Unit */}
              <div>
                <label
                  htmlFor="unit"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Unit
                </label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50"
                  placeholder="e.g., pcs, kg, lbs"
                  required
                />
              </div>

              {/* Quantity */}
              {/* <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50"
                  placeholder="0"
                  required
                />
              </div> */}

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closePopup}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-yellow-400 rounded-md hover:bg-yellow-300 text-white transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? "Updating..." : "Update Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
