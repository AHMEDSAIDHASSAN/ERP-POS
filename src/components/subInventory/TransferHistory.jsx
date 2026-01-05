import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  getTransferHistory,
  get_kitchens,
  getInventory,
} from "../../services/apis";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TransferHistory() {
  const [filters, setFilters] = useState({
    kitchenId: "",
    mainInventoryId: "",
    page: 1,
    limit: 20,
  });

  const token = useSelector((store) => store.user.token);

  const { data: transferData, isLoading } = useQuery({
    queryKey: ["transfer_history", filters],
    queryFn: () => getTransferHistory(token, filters),
  });

  const { data: kitchensList } = useQuery({
    queryKey: ["get_kitchens"],
    queryFn: () => get_kitchens(token),
  });

  const { data: inventoryList } = useQuery({
    queryKey: ["get_inventory"],
    queryFn: () => getInventory(token),
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const resetFilters = () => {
    setFilters({
      kitchenId: "",
      mainInventoryId: "",
      page: 1,
      limit: 20,
    });
  };

  const transfers = transferData?.data || [];
  const pagination = transferData?.pagination || {};

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Filter className="text-yellow-400" size={24} />
        <h3 className="text-xl font-bold text-white">Transfer History</h3>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-white mb-3">Filters</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kitchen Filter */}
          <div>
            <label
              htmlFor="kitchenId"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Kitchen
            </label>
            <select
              id="kitchenId"
              name="kitchenId"
              value={filters.kitchenId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">All Kitchens</option>
              {kitchensList?.map((kitchen) => (
                <option key={kitchen._id} value={kitchen._id}>
                  {kitchen.name}
                </option>
              ))}
            </select>
          </div>

          {/* Inventory Item Filter */}
          <div>
            <label
              htmlFor="mainInventoryId"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Inventory Item
            </label>
            <select
              id="mainInventoryId"
              name="mainInventoryId"
              value={filters.mainInventoryId}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">All Items</option>
              {inventoryList?.data?.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.productName} - {item.code}
                </option>
              ))}
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label
              htmlFor="limit"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Items per page
            </label>
            <select
              id="limit"
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        <>
          {/* Transfers Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                    Transfer #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                    Kitchen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                    Batches Used
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                    Transferred By
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="text-white">
                {transfers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="px-6 py-8 text-center text-gray-400"
                    >
                      No transfer history found
                    </td>
                  </tr>
                ) : (
                  transfers.map((transfer, index) => (
                    <tr
                      key={transfer._id}
                      className={`text-sm ${
                        index % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-yellow-400">
                        {transfer.transferNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-400">
                        {formatDate(transfer.transferDate)}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold">
                            {transfer.mainInventoryId?.productName || "N/A"}
                          </div>
                          <div className="text-xs text-gray-400">
                            {transfer.mainInventoryId?.code || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {transfer.kitchenId?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold">
                          {transfer.quantity?.toFixed(2)}{" "}
                          {transfer.mainInventoryId?.unit || ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-yellow-400 font-semibold">
                        ${transfer.totalCost?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-900 text-blue-400 font-semibold">
                          {transfer.batchesTransferred?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            transfer.status === "completed"
                              ? "bg-green-900 text-green-400"
                              : transfer.status === "pending"
                              ? "bg-yellow-900 text-yellow-400"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {transfer.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {transfer.transferredBy?.name || "N/A"}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div
                          className="truncate text-gray-400 text-xs"
                          title={transfer.notes}
                        >
                          {transfer.notes || "-"}
                        </div>
                      </td>

                    </tr>
                  ))
                )}
                
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing page {pagination.page} of {pagination.totalPages} (
                {pagination.total} total transfers)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
