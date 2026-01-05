import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getKitchenInventory, getSubInventoryBatches } from "../../services/apis";
import { Eye, Package, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function KitchenInventoryList({ kitchenId }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBatchesModal, setShowBatchesModal] = useState(false);
  const token = useSelector((store) => store.user.token);

  const { data: kitchenInventoryData, isLoading } = useQuery({
    queryKey: ["kitchen_inventory", kitchenId],
    queryFn: () => getKitchenInventory(token, kitchenId),
    enabled: !!kitchenId,
  });

  const { data: batchesData, isLoading: batchesLoading } = useQuery({
    queryKey: ["sub_inventory_batches", selectedItem?._id],
    queryFn: () => getSubInventoryBatches(token, selectedItem._id),
    enabled: !!selectedItem && showBatchesModal,
  });

  const handleViewBatches = (item) => {
    setSelectedItem(item);
    setShowBatchesModal(true);
  };

  const closeBatchesModal = () => {
    setShowBatchesModal(false);
    setSelectedItem(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "in-stock":
        return "text-green-400";
      case "low-stock":
        return "text-yellow-400";
      case "out-of-stock":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  const inventory = kitchenInventoryData?.data || [];
  const kitchen = kitchenInventoryData?.kitchen;
  const summary = kitchenInventoryData?.summary;

  return (
    <div>
      {/* Kitchen Summary */}
      {kitchen && summary && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <h3 className="text-xl font-bold text-white mb-4">
            {kitchen.name} - Inventory Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-white">{summary.totalItems}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">In Stock</p>
              <p className="text-2xl font-bold text-green-400">{summary.inStock}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-400">{summary.lowStock}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-red-400">{summary.outOfStock}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-yellow-400">
                ${summary.totalValue?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-white">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-400">
                    No inventory items found for this kitchen
                  </td>
                </tr>
              ) : (
                inventory.map((item, index) => (
                  <tr
                    key={item._id}
                    className={`transition-colors text-center ${
                      index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white capitalize">
                        {item.productName || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {item.code || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold">
                        {item.quantity?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-400">
                        {item.unit || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-blue-400">
                        ${item.averagePrice?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-yellow-400">
                        ${item.totalValue?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {item.updatedAt ? formatDate(item.updatedAt) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewBatches(item)}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1 mx-auto"
                        title="View Batches"
                      >
                        <Eye size={20} />
                        <span className="text-xs">Batches</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batches Modal */}
      {showBatchesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Batch Details - {selectedItem?.productName}
              </h3>
              <button
                onClick={closeBatchesModal}
                className="text-gray-400 hover:text-white text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {batchesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
            ) : (
              <>
                {/* Batch Summary */}
                {batchesData?.summary && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-3">Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Total Batches</p>
                        <p className="text-white font-semibold">{batchesData.summary.totalBatches}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Active Batches</p>
                        <p className="text-green-400 font-semibold">{batchesData.summary.activeBatches}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total Consumed</p>
                        <p className="text-red-400 font-semibold">
                          {batchesData.summary.totalConsumed?.toFixed(2)} {selectedItem?.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Current Value</p>
                        <p className="text-yellow-400 font-semibold">
                          ${batchesData.summary.totalValue?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Batches Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white">Transfer #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white">Supplier</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white">Original Qty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white">Remaining</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white">Consumed</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white">Unit Cost</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white">Transfer Date</th>
                      </tr>
                    </thead>
                    <tbody className="text-white text-sm">
                      {batchesData?.batches?.map((batch, index) => (
                        <tr
                          key={batch._id}
                          className={index % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}
                        >
                          <td className="px-4 py-3">
                            {batch.transferInfo?.transferNumber || "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            {batch.supplierInfo?.name || "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            {batch.quantity?.original?.toFixed(2)} {selectedItem?.unit}
                          </td>
                          <td className="px-4 py-3 text-green-400">
                            {batch.quantity?.remaining?.toFixed(2)} {selectedItem?.unit}
                          </td>
                          <td className="px-4 py-3 text-red-400">
                            {batch.quantity?.consumed?.toFixed(2)} ({batch.quantity?.consumedPercentage})
                          </td>
                          <td className="px-4 py-3 text-blue-400">
                            ${batch.pricing?.unitCost?.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                batch.status === "active"
                                  ? "bg-green-900 text-green-400"
                                  : "bg-gray-700 text-gray-400"
                              }`}
                            >
                              {batch.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {formatDate(batch.transferInfo?.transferDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
