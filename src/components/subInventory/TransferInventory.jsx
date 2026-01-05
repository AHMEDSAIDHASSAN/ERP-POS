import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  transferToKitchen,
  getInventory,
  get_kitchens,
} from "../../services/apis";
import { toast } from "react-toastify";
import { ArrowRight, Package, Warehouse } from "lucide-react";

export default function TransferInventory() {
  const [formData, setFormData] = useState({
    mainInventoryId: "",
    kitchenId: "",
    quantity: "",
    notes: "",
  });

  const token = useSelector((store) => store.user.token);
  const queryClient = useQueryClient();

  const { data: inventoryList } = useQuery({
    queryKey: ["get_inventory"],
    queryFn: () => getInventory(token),
  });

  const { data: kitchensList } = useQuery({
    queryKey: ["get_kitchens"],
    queryFn: () => get_kitchens(token),
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["transfer_to_kitchen"],
    mutationFn: (payload) => transferToKitchen(token, payload),
    onSuccess: (data) => {
      toast.success(data.message || "Inventory transferred successfully!");
      queryClient.invalidateQueries({ queryKey: ["all_kitchens_inventory"] });
      queryClient.invalidateQueries({ queryKey: ["get_inventory"] });
      queryClient.invalidateQueries({ queryKey: ["transfer_history"] });
      resetForm();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to transfer inventory"
      );
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.mainInventoryId ||
      !formData.kitchenId ||
      !formData.quantity
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    mutate({
      mainInventoryId: formData.mainInventoryId,
      kitchenId: formData.kitchenId,
      quantity: quantity,
      notes: formData.notes.trim(),
    });
  };

  const resetForm = () => {
    setFormData({
      mainInventoryId: "",
      kitchenId: "",
      quantity: "",
      notes: "",
    });
  };

  const selectedInventory = inventoryList?.data?.find(
    (item) => item._id === formData.mainInventoryId
  );

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <ArrowRight className="text-yellow-400" size={24} />
        <h3 className="text-xl font-bold text-white">
          Transfer Inventory to Kitchen
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Inventory Selection */}
        <div>
          <label
            htmlFor="mainInventoryId"
            className="block text-sm font-medium text-white mb-2"
          >
            <div className="flex items-center gap-2">
              <Warehouse size={16} />
              Select Inventory Item *
            </div>
          </label>
          <select
            id="mainInventoryId"
            name="mainInventoryId"
            value={formData.mainInventoryId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            required
          >
            <option value="">-- Select Inventory Item --</option>
            {inventoryList?.data?.map((item) => (
              <option key={item._id} value={item._id}>
                {item.productName} - {item.code} (Available: {item.quantity}{" "}
                {item.unit})
              </option>
            ))}
          </select>
          {selectedInventory && (
            <div className="mt-2 p-3 bg-gray-900 rounded-md text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400">Available:</span>
                  <span className="text-white font-semibold ml-2">
                    {selectedInventory.quantity} {selectedInventory.unit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span
                    className={`ml-2 font-semibold ${
                      selectedInventory.status === "in-stock"
                        ? "text-green-400"
                        : selectedInventory.status === "low-stock"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {selectedInventory.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Kitchen Selection */}
        <div>
          <label
            htmlFor="kitchenId"
            className="block text-sm font-medium text-white mb-2"
          >
            <div className="flex items-center gap-2">
              <Package size={16} />
              Select Kitchen *
            </div>
          </label>
          <select
            id="kitchenId"
            name="kitchenId"
            value={formData.kitchenId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            required
          >
            <option value="">-- Select Kitchen --</option>
            {kitchensList?.map((kitchen) => (
              <option key={kitchen._id} value={kitchen._id}>
                {kitchen.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-white mb-2"
          >
            Quantity to Transfer *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            step="0.01"
            min="0.01"
            max={selectedInventory?.quantity || undefined}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            placeholder="Enter quantity"
            required
          />
          {selectedInventory && formData.quantity && (
            <p className="mt-1 text-sm text-gray-400">
              Unit: {selectedInventory.unit}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-white mb-2"
          >
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
            maxLength="500"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
            placeholder="Add any notes about this transfer..."
          />
          <p className="mt-1 text-sm text-gray-400">
            {formData.notes.length}/500 characters
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={resetForm}
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-yellow-400 rounded-md hover:bg-yellow-300 text-white transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Transferring...
              </>
            ) : (
              <>
                <ArrowRight size={20} />
                Transfer to Kitchen
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
