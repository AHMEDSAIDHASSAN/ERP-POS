import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addinventory, getInventory } from "../services/apis.js";
import { useSelector } from "react-redux";
import InventoryTable from "../components/inventory/InventoryTable.jsx";
import { toast } from "react-toastify";
export default function Inventory() {
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
   
    unit: "",
   
  });

  const token = useSelector((store) => store.user.token);
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationKey: ["add_item_inventroy"],
    mutationFn: (payload) => addinventory(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get_inventory"],
      });
      closePopup();
    },
    onError: (e) => {
      toast.error(e.response.data.message);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Validate form
    if (
      !formData.productName.trim() ||
    
      !formData.unit.trim() 
    ) {
      alert("Please fill in all fields");
      return;
    }

    const data = {
      productName: formData.productName.trim(),
     
      unit: formData.unit.trim(),
      
    };
    // Process the form data here
    mutate({ ...data });
    // Reset form and close popup

    // setShowPopup(false);
  };

  const closePopup = () => {
    setShowPopup(false);
    setFormData({
      productName: "",
    
      unit: "",
     
    });
  };

  const { data: inventoryList } = useQuery({
    queryKey: ["get_inventory"],
    queryFn: () => getInventory(token),
  });

  
  return (
    <div className="min-h-screen  text-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 mb-6 lg:mb-8 p-6">
          <div className="w-3 h-3 hidden md:block bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 hidden md:block bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 hidden md:block bg-green-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider ml-4 flex items-center justify-between w-full">
            <div>Inventory</div>
          </h2>
        </div>

        <button
          onClick={() => setShowPopup(true)}
          className="bg-yellow-400 text-white px-6 py-2 font-semibold rounded-md mb-6 lg:mb-8 mr-6 hover:bg-yellow-300 transition-colors"
        >
          Add Item
        </button>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Add New Item</h3>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-white text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

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
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Price */}
             

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
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="e.g., pcs, kg, lbs"
                  required
                />
              </div>

              {/* Quantity */}
             

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={closePopup}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-yellow-400  rounded-md hover:bg-yellow-300 text-white transition-colors font-medium"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <InventoryTable data={inventoryList?.data || []} />
    </div>
  );
}
