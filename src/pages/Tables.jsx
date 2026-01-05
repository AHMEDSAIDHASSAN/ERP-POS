import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  getTables,
  imageBase,
  updateTable,
  createTable,
  getSections,
} from "../services/apis";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import placeHolder from "../assets/tables.png";
export default function Tables() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const token = useSelector((store) => store.user.token);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    image: null,
  });
  const { data: sections } = useQuery({
    queryKey: ["ge-sections"],
    queryFn: () => getSections(token),
  });

  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const {
    data: tableList,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tables"],
    queryFn: () => getTables(token),
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationKey: ["update-status-table"],
    mutationFn: (payload) => updateTable(payload.id, payload.data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tables"],
      });
    },
  });

  const { mutate: createTableMutate, isLoading: isCreating } = useMutation({
    mutationKey: ["create-table"],
    mutationFn: (payload) => createTable(payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tables"],
      });
      setShowCreateModal(false);
      setFormData({ title: "", image: null });
      setImagePreview(null);
      setFormErrors({});
    },
    onError: (error) => {
      console.error("Error creating table:", error);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error when user selects image
      if (formErrors.image) {
        setFormErrors((prev) => ({
          ...prev,
          image: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.image) {
      errors.image = "Image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("image", formData.image);
    submitData.append("section", formData.section);

    createTableMutate(submitData);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({ title: "", image: null });
    setImagePreview(null);
    setFormErrors({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">
          Error loading tables: {error.message}
        </div>
      </div>
    );
  }

  const tables = tableList?.data || [];

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center gap-3 mb-6 lg:mb-8">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider ml-4 flex items-center justify-between w-full">
          <div>Manage Tables</div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-base font-semibold bg-popular text-white rounded-md px-4 py-2 transition-colors hover:bg-popular/90"
          >
            Create Table
          </button>
        </h2>
      </div>

      {tables.length === 0 ? (
        <div className="text-center text-gray-400 text-lg mt-12">
          No tables found. Create your first table to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables?.map((table) => (
            <div
              key={table._id}
              className="bg-secondary rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={
                    table.image ? `${imageBase}/${table.image}` : placeHolder
                  }
                  alt={table.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      table.status === "Available"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {table.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {table?.title?.replace("_", " ")?.toUpperCase()}
                </h3>

                <div className="text-sm text-gray-400 mb-4">
                  Section : {table?.section?.title}
                </div>
                {/* <div className="text-sm text-gray-400 mb-4">
                  Table ID: {table._id.slice(-6)}
                </div> */}

                <div className="flex flex-col gap-2">
                  <button
                    className="flex-1 py-2 px-4 rounded-md transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => navigate(`/table-orders/${table._id}`)}
                  >
                    View Orders
                  </button>
                  {table.status !== "Available" && (
                    <button
                      className="flex-1 py-2 px-4 rounded-md transition-colors bg-popular hover:bg-popular/90 text-white"
                      onClick={() => {
                        mutate({
                          id: table._id,
                          data: { status: "Available" },
                        });
                      }}
                    >
                      {table.status === "Available" ? "Reserve" : "Free"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tables.length > 0 && (
        <div className="mt-8 text-center">
          <div className="text-gray-400">
            Total Tables: {tables.length} | Available:{" "}
            {tables.filter((t) => t.status === "Available").length} | Occupied:{" "}
            {tables.filter((t) => t.status === "Occupied").length}
          </div>
        </div>
      )}

      {/* Create Table Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Create New Table</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Table Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-popular ${
                    formErrors.title ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="Enter table title"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Section <span className="text-red-500">*</span>
                </label>
                <select
                  name="section"
                  value={formData.section || ""}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-popular appearance-none cursor-pointer ${
                    formErrors.section ? "border-red-500" : "border-gray-600"
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                    paddingRight: "2.5rem",
                  }}
                >
                  <option value="" disabled className="text-gray-400">
                    Choose a section
                  </option>
                  {sections?.data?.map((ele, index) => (
                    <option
                      key={ele._id}
                      value={ele._id}
                      className="bg-gray-700 text-white"
                    >
                      {ele?.title}
                    </option>
                  ))}
                </select>
                {formErrors.section && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.section}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Table Image <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-popular file:text-white hover:file:bg-popular/90 focus:outline-none focus:ring-2 focus:ring-popular ${
                    formErrors.image ? "border-red-500" : "border-gray-600"
                  }`}
                />
                {formErrors.image && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.image}
                  </p>
                )}

                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-popular text-white rounded-md hover:bg-popular/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Creating..." : "Create Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
