import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getOrdersByKitchen } from "../services/apis";
import KitchenCard from "../components/kicthen/KitchenCard";
import { useSelector } from "react-redux";

export default function EachKitchen() {
  const { id } = useParams();

  const token = useSelector((store) => store.user.token);
  const { data, isLoading, error } = useQuery({
    queryKey: ["each_kitchen", id],
    queryFn: () => getOrdersByKitchen(id, token),
    enabled: !!id, // Only run query if id exists
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <p className="text-red-500">
          Error loading kitchen orders: {error.message}
        </p>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <p className="text-gray-500">No orders found for this kitchen.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden my-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.data
          .slice() // Create a copy to avoid mutating original array
          .reverse()
          .map((order, index) => (
            <KitchenCard
              data={order}
              key={order._id || `order-${index}`} // Use unique ID if available
            />
          ))}
      </div>
    </div>
  );
}
