import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { batches } from "../../services/apis";
import { useSelector } from "react-redux";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Batches() {
  const token = useSelector((store) => store.user.token);
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["get-batches", id],
    queryFn: () => batches(token, id),
  });

  // Handle case where data might be undefined or batches array doesn't exist
  const safeData = Array.isArray(data?.batches) ? data.batches : [];
  const summary = data?.summary;
  const inventoryItem = data?.inventoryItem;

  if (isLoading) {
    return (
      <div className="bg-secondary rounded-lg shadow-sm p-8 text-center">
        <div className="text-white">Loading batches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-secondary rounded-lg shadow-sm p-8 text-center">
        <div className="text-red-400">
          Error loading batches: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Inventory Item Info */}
      {inventoryItem && (
        <div className="bg-secondary rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Product Information
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Product Name</p>
              <p className="text-white font-medium capitalize">
                {inventoryItem.productName}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Code</p>
              <p className="text-white font-medium">{inventoryItem.code}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Unit</p>
              <p className="text-white font-medium">{inventoryItem.unit}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Current Quantity</p>
              <p className="text-white font-medium">
                {inventoryItem.currentQuantity}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Status</p>
              <p className="text-white font-medium capitalize">
                {inventoryItem.status}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Info */}
      {summary && (
        <div className="bg-secondary rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-white mb-4">Batch Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Total Batches</p>
              <p className="text-white font-medium text-lg">
                {summary.totalBatches}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-green-400 font-medium text-lg">
                {summary.activeBatches}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Depleted</p>
              <p className="text-red-400 font-medium text-lg">
                {summary.depletedBatches}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Remaining Qty</p>
              <p className="text-white font-medium text-lg">
                {summary.totalRemainingQuantity}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Original Qty</p>
              <p className="text-white font-medium text-lg">
                {summary.totalOriginalQuantity}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Consumed</p>
              <p className="text-white font-medium text-lg">
                {summary.totalConsumed}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Price</p>
              <p className="text-white font-medium text-lg">
                ${summary?.currentAveragePrice?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-white font-medium text-lg">
                ${summary.totalValue}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Batches Table */}
      <div className="bg-secondary rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Batch History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary">
              <tr>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Purchase Title
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Original Qty
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Remaining Qty
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Consumed
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Current Value
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-white tracking-wider">
                  Purchase Date
                </th>
              </tr>
            </thead>
            <tbody className="text-white">
              {safeData.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No batches found
                  </td>
                </tr>
              ) : (
                safeData.map((batch, index) => (
                  <tr
                    key={batch._id || index}
                    className={`transition-colors text-center ${
                      index % 2 === 0 ? "bg-secondary" : "bg-primary"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {batch?.purchaseInfo?.invoiceNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {batch?.purchaseInfo?.title || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        <div className="font-medium">
                          {batch?.supplierInfo?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {batch?.supplierInfo?.code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-sm font-semibold">
                        {batch?.quantity?.original ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-sm font-semibold">
                        {batch?.quantity?.remaining ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div>{batch?.quantity?.consumed ?? 0}</div>
                        <div className="text-xs text-gray-400">
                          {batch?.quantity?.consumedPercentage}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-sm font-semibold">
                        ${batch?.pricing?.unitCost ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-sm font-semibold">
                        ${batch?.pricing?.currentTotalValue ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                          batch?.status === "active"
                            ? "bg-green-900 text-green-200"
                            : "bg-red-900 text-red-200"
                        }`}
                      >
                        {batch?.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {batch.purchaseDate
                        ? formatDate(batch.purchaseDate)
                        : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
