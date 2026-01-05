import { Clock, MapPin, Users, ShoppingBag } from "lucide-react";

export default function OrderQueue({ orders, selectedOrder, onSelectOrder, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 h-full">
        <h3 className="text-lg font-semibold text-white mb-4">Orders Ready for Checkout</h3>
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case "delivery":
        return <MapPin className="w-4 h-4" />;
      case "dine-in":
        return <Users className="w-4 h-4" />;
      case "pickup":
      default:
        return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const getOrderTypeColor = (type) => {
    switch (type) {
      case "delivery":
        return "text-blue-400 bg-blue-400/10";
      case "dine-in":
        return "text-green-400 bg-green-400/10";
      case "pickup":
      default:
        return "text-orange-400 bg-orange-400/10";
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Orders Ready for Checkout</h3>
        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-sm">
          {orders?.length || 0} orders
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {orders?.length > 0 ? (
          orders.map((order) => (
            <div
              key={order._id}
              onClick={() => onSelectOrder(order)}
              className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedOrder?._id === order._id
                  ? "bg-yellow-500/20 border-2 border-yellow-500"
                  : "bg-gray-700 hover:bg-gray-600 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-white">#{order.orderNumber}</span>
                <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getOrderTypeColor(order.orderType)}`}>
                  {getOrderTypeIcon(order.orderType)}
                  {order.orderType}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                {order.table?.name && (
                  <div className="text-gray-400">
                    Table: <span className="text-white">{order.table.name}</span>
                  </div>
                )}
                {order.customerName && (
                  <div className="text-gray-400">
                    Customer: <span className="text-white">{order.customerName}</span>
                  </div>
                )}
                <div className="text-gray-400">
                  Items: <span className="text-white">{order.itemCount || order.items?.length || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
                <div className="flex items-center text-gray-400 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(order.createdAt).toLocaleTimeString()}
                </div>
                <span className="text-yellow-400 font-bold">
                  {order.totalAmount?.toFixed(2) || "0.00"} EG
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <ShoppingBag className="w-12 h-12 mb-2 opacity-50" />
            <p>No orders ready for checkout</p>
          </div>
        )}
      </div>
    </div>
  );
}
