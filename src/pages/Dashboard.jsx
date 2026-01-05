import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingBag,
  Star,
  Clock,
  ChefHat,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { dashboaordmain, ordersMonthly, ordersWeekly } from "../services/apis";

export default function Dashboard() {
  const token = useSelector((store) => store.user.token);

  const { data, isLoading } = useQuery({
    queryKey: ["dash_1"],
    queryFn: () => dashboaordmain(token),
    enabled: !!token,
  });
  const { data: weeklyData, isLoading: weeklyLoading } = useQuery({
    queryKey: ["dash_2"],
    queryFn: () => ordersWeekly(token),
    enabled: !!token,
  });
  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ["dash_3"],
    queryFn: () => ordersMonthly(token),
    enabled: !!token,
  });

  const colors = ["#ffbc0f", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

  const StatCard = ({ icon: Icon, title, value, change, color = "purple" }) => {
    const colorClasses = {
      purple: "bg-purple-500 text-white",
      cyan: "bg-cyan-500 text-white",
      emerald: "bg-emerald-500 text-white",
      amber: "bg-amber-500 text-white",
    };

    // Format the value properly - remove "EG" and handle numbers correctly
    const formatValue = (val) => {
      if (typeof val === "string") {
        // Remove "EG" and any other non-numeric characters except decimal points
        const cleanValue = val.replace(/[^\d.-]/g, "");
        const numValue = parseFloat(cleanValue);
        return isNaN(numValue) ? val : numValue.toLocaleString();
      }
      if (typeof val === "number") {
        return val.toLocaleString();
      }
      return val || 0;
    };

    return (
      <div className="bg-[#111315] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-popular hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">
              {formatValue(value)}
            </p>
            {change && (
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm font-medium">
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Restaurant Dashboard
          </h1>
          <p className="text-gray-400">
            Welcome back! Here's what's happening at your restaurant today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={DollarSign}
            title="Total Revenue"
            value={parseFloat(data?.revenue || 0).toFixed(2)}
            change="+12.5%"
            color="amber"
          />
          <StatCard
            icon={ShoppingBag}
            title="Orders Today"
            value={data?.todayOrderCount || 0}
            change="+8.2%"
            color="amber"
          />
          <StatCard
            icon={Users}
            title="Active Customers"
            value={data?.countOfCustomer || 0}
            change="+15.3%"
            color="amber"
          />
          <StatCard
            icon={Star}
            title="All Orders"
            value={data?.allRodersCount || 0}
            change="+23.1%"
            color="amber"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-[#111315] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-popular transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Revenue Overview
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-popular rounded-full"></div>
                <span className="text-sm text-white">Revenue</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#ffbc0f",
                  }}
                />
                <Bar dataKey="revenue" fill="#ffbc0f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Orders Chart */}
          <div className="bg-[#111315] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-popular transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Weekly Orders
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-popular rounded-full"></div>
                <span className="text-sm text-white">Orders</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#ffbc0f",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#ffbc0f"
                  strokeWidth={3}
                  dot={{ fill: "#ffbc0f", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Popular Dishes */}
          <div className="lg:col-span-2 bg-[#111315] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-popular transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-6">
              Popular Dishes
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data?.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.data?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {data?.data?.map((dish, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  <span className="text-sm text-white">{dish.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#111315] rounded-xl shadow-lg p-6 border border-gray-800 hover:border-popular transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-6">
              Quick Stats
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-900 rounded-lg">
                    <Clock className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Operators</p>
                    <p className="text-2xl font-bold text-white">
                      {data?.countOperators || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-900 rounded-lg">
                    <ChefHat className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Chefs</p>
                    <p className="text-2xl font-bold text-white">
                      {data?.countStaff || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-900 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Waiters</p>
                    <p className="text-2xl font-bold text-white">
                      {data?.countWaiter || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
