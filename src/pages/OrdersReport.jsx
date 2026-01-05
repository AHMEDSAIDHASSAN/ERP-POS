import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  User,
  Package,
  DollarSign,
  TrendingUp,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { getOrdersReport, getStaff } from "../services/apis";
import * as XLSX from "xlsx";

export default function OrdersReport() {
  const token = useSelector((store) => store.user.token);

  // Filters state
  const [filters, setFilters] = useState({
    createdBy: "",
    startDate: "",
    endDate: "",
    status: "all",
    orderType: "all",
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  // Fetch staff/users for the "Created By" filter
  const { data: staffResponse } = useQuery({
    queryKey: ["staff"],
    queryFn: () => getStaff(token),
  });

  const staffList = staffResponse || [];

  // Fetch orders report
  const {
    data: reportResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders-report", pagination, filters],
    queryFn: () =>
      getOrdersReport(token, {
        ...pagination,
        ...filters,
      }),
  });

  const orders = reportResponse?.data || [];
  const paginationData = reportResponse?.pagination || {};
  const summary = reportResponse?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    statusBreakdown: {},
  };

  // Update pagination when response changes
  useEffect(() => {
    if (reportResponse?.pagination) {
      setPagination((prev) => ({
        ...prev,
        ...reportResponse.pagination,
      }));
    }
  }, [reportResponse]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      preparing: "bg-blue-100 text-blue-800 border-blue-300",
      ready: "bg-purple-100 text-purple-800 border-purple-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      checkout: "bg-teal-100 text-teal-800 border-teal-300",
    };
    return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getOrderTypeColor = (type) => {
    const colors = {
      "dine-in": "bg-indigo-100 text-indigo-800",
      takeaway: "bg-orange-100 text-orange-800",
      delivery: "bg-cyan-100 text-cyan-800",
    };
    return colors[type?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
    }).format(amount || 0);
  };

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = orders.map((order) => ({
      "Order Number": order.OrderNumber,
      Date: formatDate(order.createdAt),
      "Customer/Waiter": order.customer?.name || "N/A",
      Phone: order.customer?.phone || "N/A",
      "Order Type": order.orderType,
      Status: order.status,
      "Items Count": order.items?.length || 0,
      Table: order.table?.title || "N/A",
      "Total Price (EGP)": order.totalPrice,
    }));

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Order Number
      { wch: 20 }, // Date
      { wch: 20 }, // Customer/Waiter
      { wch: 15 }, // Phone
      { wch: 12 }, // Order Type
      { wch: 12 }, // Status
      { wch: 12 }, // Items Count
      { wch: 15 }, // Table
      { wch: 15 }, // Total Price
    ];
    worksheet["!cols"] = columnWidths;

    // Add summary sheet
    const summaryData = [
      { Metric: "Total Orders", Value: summary.totalOrders },
      { Metric: "Total Revenue (EGP)", Value: summary.totalRevenue },
      { Metric: "Average Order Value (EGP)", Value: summary.averageOrderValue },
      { Metric: "", Value: "" },
      { Metric: "Status Breakdown", Value: "" },
      { Metric: "Pending", Value: summary.statusBreakdown?.pending || 0 },
      { Metric: "Preparing", Value: summary.statusBreakdown?.preparing || 0 },
      { Metric: "Ready", Value: summary.statusBreakdown?.ready || 0 },
      { Metric: "Completed", Value: summary.statusBreakdown?.completed || 0 },
      { Metric: "Cancelled", Value: summary.statusBreakdown?.cancelled || 0 },
      { Metric: "Checkout", Value: summary.statusBreakdown?.checkout || 0 },
    ];
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 25 }, { wch: 20 }];

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // Generate filename with current date
    const filename = `orders-report-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    // Save the file
    XLSX.writeFile(workbook, filename);
  };

  const exportToCSV = () => {
    const headers = [
      "Order Number",
      "Date",
      "Customer/Waiter",
      "Phone",
      "Order Type",
      "Status",
      "Items Count",
      "Table",
      "Total Price (EGP)",
    ];

    const csvData = orders.map((order) => [
      order.OrderNumber,
      formatDate(order.createdAt),
      order.customer?.name || "N/A",
      order.customer?.phone || "N/A",
      order.orderType,
      order.status,
      order.items?.length || 0,
      order.table?.title || "N/A",
      order.totalPrice,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-light flex items-center gap-2">
              <FileText className="w-8 h-8 text-popular" />
              Orders Report
            </h1>
            <div className="flex gap-3">
              <button
                onClick={exportToExcel}
                disabled={orders.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>
          <p className="text-gray-400">
            Comprehensive report of all orders with advanced filtering
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-secondary rounded-lg shadow-lg p-6 border-l-4 border-popular">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-light">
                  {summary.totalOrders}
                </p>
              </div>
              <Package className="w-12 h-12 text-popular opacity-30" />
            </div>
          </div>

          <div className="bg-secondary rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-light">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-500 opacity-30" />
            </div>
          </div>

          <div className="bg-secondary rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Average Order</p>
                <p className="text-2xl font-bold text-light">
                  {formatCurrency(summary.averageOrderValue)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500 opacity-30" />
            </div>
          </div>

          <div className="bg-secondary rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Completed</p>
                <p className="text-2xl font-bold text-light">
                  {summary.statusBreakdown?.completed || 0}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">
                  Pending: {summary.statusBreakdown?.pending || 0}
                </p>
                <p className="text-xs text-gray-400">
                  Cancelled: {summary.statusBreakdown?.cancelled || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-secondary rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-popular" />
            <h2 className="text-lg font-semibold text-light">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Created By Filter */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4" />
                Created By
              </label>
              <select
                value={filters.createdBy}
                onChange={(e) =>
                  handleFilterChange("createdBy", e.target.value)
                }
                className="w-full px-3 py-2 bg-primary border border-gray-600 text-light rounded-lg focus:ring-2 focus:ring-popular focus:border-transparent"
              >
                <option value="">All Users</option>
                {staffList
                  .filter((staff) =>
                    ["admin", "operation", "waiter", "customer"].includes(
                      staff.role
                    )
                  )
                  .map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name} ({staff.role})
                    </option>
                  ))}
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="w-full px-3 py-2 bg-primary border border-gray-600 text-light rounded-lg focus:ring-2 focus:ring-popular focus:border-transparent"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4" />
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="w-full px-3 py-2 bg-primary border border-gray-600 text-light rounded-lg focus:ring-2 focus:ring-popular focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 bg-primary border border-gray-600 text-light rounded-lg focus:ring-2 focus:ring-popular focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="checkout">Checkout</option>
              </select>
            </div>

            {/* Order Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Order Type
              </label>
              <select
                value={filters.orderType}
                onChange={(e) =>
                  handleFilterChange("orderType", e.target.value)
                }
                className="w-full px-3 py-2 bg-primary border border-gray-600 text-light rounded-lg focus:ring-2 focus:ring-popular focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="dine-in">Dine-In</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-4">
            <button
              onClick={() =>
                setFilters({
                  createdBy: "",
                  startDate: "",
                  endDate: "",
                  status: "all",
                  orderType: "all",
                })
              }
              className="px-4 py-2 text-sm text-popular hover:text-yellow-500 hover:bg-primary rounded-lg transition-colors font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-secondary rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-popular"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p>Error loading orders: {error.message}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No orders found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-secondary divide-y divide-gray-700">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-primary transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-light">
                          #{order.OrderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-light">
                              {order.customer?.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {order.customer?.phone || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getOrderTypeColor(
                            order.orderType
                          )}`}
                        >
                          {order.orderType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {order.items?.length || 0} items
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-300">
                          {order.table?.title || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-popular">
                          {formatCurrency(order.totalPrice)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {orders.length > 0 && (
            <div className="bg-primary px-6 py-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  Showing{" "}
                  <span className="font-medium text-popular">
                    {(paginationData.currentPage - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-popular">
                    {Math.min(
                      paginationData.currentPage * pagination.limit,
                      paginationData.totalOrders
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-popular">
                    {paginationData.totalOrders}
                  </span>{" "}
                  orders
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!paginationData.hasPrevPage}
                    className="px-3 py-2 border border-gray-600 text-light rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="text-sm text-gray-300">
                    Page{" "}
                    <span className="text-popular font-medium">
                      {paginationData.currentPage}
                    </span>{" "}
                    of {paginationData.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!paginationData.hasNextPage}
                    className="px-3 py-2 border border-gray-600 text-light rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
