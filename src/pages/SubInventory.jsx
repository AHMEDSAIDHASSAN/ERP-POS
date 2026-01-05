import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getAllKitchensInventory } from "../services/apis";
import TransferInventory from "../components/subInventory/TransferInventory";
import KitchenInventoryList from "../components/subInventory/KitchenInventoryList";
import TransferHistory from "../components/subInventory/TransferHistory";
import { Package, ArrowRightLeft, History } from "lucide-react";

export default function SubInventory() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedKitchen, setSelectedKitchen] = useState(null);
  const token = useSelector((store) => store.user.token);

  const { data: allKitchensData, isLoading } = useQuery({
    queryKey: ["all_kitchens_inventory"],
    queryFn: () => getAllKitchensInventory(token),
  });

  const kitchensInventory = allKitchensData?.data || [];

  return (
    <div className="min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 lg:mb-8 p-6">
        <div className="w-3 h-3 hidden md:block bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 hidden md:block bg-green-500 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider ml-4">
          Kitchen Inventory Management
        </h2>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "overview"
                ? "bg-yellow-400 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Package size={20} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("transfer")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "transfer"
                ? "bg-yellow-400 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <ArrowRightLeft size={20} />
            Transfer to Kitchen
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "history"
                ? "bg-yellow-400 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <History size={20} />
            Transfer History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        {activeTab === "overview" && (
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {kitchensInventory.map((kitchen) => (
                  <div
                    key={kitchen.kitchenId}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-yellow-400 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedKitchen(kitchen.kitchenId);
                      setActiveTab("kitchenDetail");
                    }}
                  >
                    <h3 className="text-xl font-bold text-white mb-4">
                      {kitchen.kitchenName}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Items:</span>
                        <span className="text-white font-semibold">
                          {kitchen.inventory.totalItems}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">In Stock:</span>
                        <span className="text-green-400 font-semibold">
                          {kitchen.inventory.inStock}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Low Stock:</span>
                        <span className="text-yellow-400 font-semibold">
                          {kitchen.inventory.lowStock}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Out of Stock:</span>
                        <span className="text-red-400 font-semibold">
                          {kitchen.inventory.outOfStock}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-700">
                        <span className="text-gray-400">Total Value:</span>
                        <span className="text-yellow-400 font-bold">
                          ${kitchen.inventory.totalValue?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {kitchensInventory.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    No kitchen inventory data available
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "transfer" && <TransferInventory />}

        {activeTab === "history" && <TransferHistory />}

        {activeTab === "kitchenDetail" && selectedKitchen && (
          <div>
            <button
              onClick={() => setActiveTab("overview")}
              className="mb-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back to Overview
            </button>
            <KitchenInventoryList kitchenId={selectedKitchen} />
          </div>
        )}
      </div>
    </div>
  );
}
