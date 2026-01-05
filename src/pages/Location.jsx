import React from "react";
import { getLocations, updateLocation } from "../services/apis";
import { useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const Location = () => {
  const token = useSelector((store) => store.user.token);
  const [name, setName] = useState("");
  const [deliveryPrice, setDeliveryPrice] = useState("");
  const [isActive, setIsActive] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: locations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocations(token),
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationKey: ["update-location"],
    mutationFn: (payload) =>
      updateLocation(selectedLocation._id, payload, token),
    onSuccess: () => {
      setName("");
      setDeliveryPrice("");
      setIsActive("");
      setSelectedLocation(null);
      setIsModalOpen(false);
      toast.success("location updated successfully");
      queryClient.invalidateQueries(["locations"]);
    },
    onError: (error) => {
      console.error("Error updating location:", error);
      toast.error(error.response.data.message);
      setIsModalOpen(false);
    },
  });

  const handleUpdateLocation = () => {
    if (
      name.trim() ||
      deliveryPrice.trim() ||
      isActive.trim() ||
      selectedLocation
    ) {
      updateMutate({
        name: name.trim(),
        deliveryPrice: deliveryPrice,
        isActive: isActive,
      });
    }
  };

  const handleEditClick = (e, location) => {
    e.stopPropagation();
    setSelectedLocation(location);
    setName(location.name);
    setDeliveryPrice(location.deliveryPrice);
    setIsActive(location.isActive);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setName("");
    setDeliveryPrice("");
    setIsActive("");
    setSelectedLocation(null);
  };

  const handleSubmit = () => {
    handleUpdateLocation();
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-popular"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading locations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-xl sm:text-2xl tracking-wider font-semibold">
          Location Management
        </h3>
      </div>

      <div className="text-white rounded-lg shadow-sm">
        {locations?.data && locations.data.length > 0 ? (
          <>
            <div className="px-4 sm:px-6 py-4">
              <h4 className="text-base sm:text-lg font-medium">
                All Locations ({locations.data.length})
              </h4>
            </div>
            <div className="divide-y">
              {locations.data.map((location, index) => (
                <div
                  key={location._id || index}
                  className={`px-4 sm:px-6 py-4 cursor-pointer ${
                    index % 2 == 0 ? "bg-secondary" : "bg-transparent"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-popular bg-opacity-10 rounded-full flex items-center justify-center">
                          <span className="text-popular font-medium text-sm">
                            {location.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:w-96 sm:justify-between gap-2">
                        <div className="flex flex-col">
                          <h5 className="text-sm sm:text-base font-medium">
                            {location.name}
                          </h5>
                          <p className="text-xs sm:text-sm text-gray-500">
                            location #{index + 1}
                          </p>
                        </div>
                        <h5 className="text-sm sm:text-base">
                          {location.deliveryPrice} {" EG"}
                        </h5>
                      </div>
                    </div>

                    <div className="flex flex-row items-center justify-end gap-3 sm:gap-6 min-w-0 flex-shrink-0">
                      <h5
                        className={`py-1 sm:py-2 rounded-lg font-medium w-24 sm:w-28 text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-1 flex-shrink-0 ${
                          location?.isActive
                            ? "bg-green-500/20 hover:bg-green-500/30 text-green-400 hover:text-green-300 border border-green-500/30 hover:border-green-500/50"
                            : "bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/50"
                        }`}
                      >
                        {location.isActive ? "Active" : "InActive"}
                      </h5>
                      <button
                        onClick={(e) => handleEditClick(e, location)}
                        className="text-gray-400 hover:text-popular transition-colors relative z-10 flex-shrink-0 p-1"
                        title="Edit location"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium mb-2">
              No locations found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">
              Get started by creating your first section
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Edit Location
            </h2>

            <div className="mb-4">
              <div className="mb-5">
                <label
                  htmlFor="locationName"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  Location Name
                </label>
                <input
                  id="locationName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter location name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-popular focus:border-transparent text-black"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && name.trim()) {
                      handleSubmit();
                    }
                  }}
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="locationDelivery"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  Location Delivery Price
                </label>
                <input
                  id="locationDelivery"
                  type="text"
                  value={deliveryPrice}
                  onChange={(e) => setDeliveryPrice(e.target.value)}
                  placeholder="Enter delivery price..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-popular focus:border-transparent text-black"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && deliveryPrice.trim()) {
                      handleSubmit();
                    }
                  }}
                />
              </div>
              <div className="mb-5">
                <label
                  htmlFor="locationActivation"
                  className="block text-xs sm:text-sm font-medium text-gray-700 mb-2"
                >
                  Location Activation
                </label>
                <select
                  id="locationActivation"
                  value={isActive}
                  onChange={(e) => setIsActive(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-popular focus:border-transparent text-black"
                >
                  <option value="true">Active</option>
                  <option value="false">InActive</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || isUpdating}
                className="px-4 py-2 bg-popular text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Update Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Location;
