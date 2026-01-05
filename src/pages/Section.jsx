import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addSection,
  deletedSection,
  getSections,
  updateSection,
} from "../services/apis";
import { useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Section() {
  const token = useSelector((store) => store.user.token);
  const [name, setTitle] = useState("");
  const [selectedSection, setSelectedSection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: sections,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sections"],
    queryFn: () => getSections(token),
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["create-section"],
    mutationFn: (payload) => addSection(payload.name, token),
    onSuccess: () => {
      setTitle("");
      setIsModalOpen(false);
      toast.success("Section created successfully");
      queryClient.invalidateQueries(["sections"]);
    },
    onError: (error) => {
      console.error("Error creating section:", error);
      toast.error("Failed to create section");
    },
  });
  const { mutate: deletedMutation } = useMutation({
    mutationKey: ["create-section"],
    mutationFn: (payload) => deletedSection(payload.id, token),
    onSuccess: () => {
      setTitle("");
      setIsModalOpen(false);
      toast.success("Section deleted successfully");
      queryClient.invalidateQueries(["sections"]);
    },
    onError: (error) => {
      console.error("Error creating section:", error);
      toast.error("Failed to delete section");
    },
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationKey: ["update-section"],
    mutationFn: (payload) =>
      updateSection(selectedSection._id, payload.name, token),
    onSuccess: () => {
      setTitle("");
      setSelectedSection(null);
      setIsModalOpen(false);
      setIsEditMode(false);
      toast.success("Section updated successfully");
      queryClient.invalidateQueries(["sections"]);
    },
    onError: (error) => {
      console.error("Error updating section:", error);
      toast.error("Failed to update section");
    },
  });

  const handleCreateSection = () => {
    if (name.trim()) {
      mutate({ name: name?.trim() });
    }
  };

  const handleUpdateSection = () => {
    if (name.trim() && selectedSection) {
      updateMutate({ name: name?.trim() });
    }
  };

  const handleEditClick = (e, section) => {
    e.stopPropagation();
    setSelectedSection(section);
    setTitle(section.name);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e, sectionId) => {
    e.stopPropagation();
    deletedMutation({ id: sectionId });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setSelectedSection(null);
    setIsEditMode(false);
  };

  const handleSubmit = () => {
    if (isEditMode) {
      handleUpdateSection();
    } else {
      handleCreateSection();
    }
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
        <p className="text-red-500">Error loading sections</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl tracking-wider font-semibold">
          Section Management
        </h3>

        <button
          onClick={() => {
            setIsEditMode(false);
            setIsModalOpen(true);
          }}
          className="font-semibold py-3 px-5 focus:outline-none bg-popular text-white rounded-xl hover:bg-opacity-90 transition-colors"
        >
          Add Section
        </button>
      </div>

      {/* Sections Display */}
      <div className=" text-white rounded-lg shadow-sm ">
        {sections?.data && sections.data.length > 0 ? (
          <>
            <div className="px-6 py-4  ">
              <h4 className="text-lg font-medium ">
                All Sections ({sections.data.length})
              </h4>
            </div>
            <div className="divide-y ">
              {sections.data.map((section, index) => (
                <div
                  onClick={() => navigate(`/section-tables/${section._id}`)}
                  key={section._id || index}
                  className={`px-6 py-4  cursor-pointer   ${
                    index % 2 == 0 ? "bg-secondary" : "bg-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-popular bg-opacity-10 rounded-full flex items-center justify-center">
                          <span className="text-popular font-medium text-sm">
                            {section.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h5 className="text-base font-medium ">
                          {section.name}
                        </h5>
                        <p className="text-sm text-gray-500">
                          Section #{index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleEditClick(e, section)}
                        className="text-gray-400 hover:text-popular transition-colors relative z-10"
                        name="Edit section"
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
                      <button
                        onClick={(e) => handleDeleteClick(e, section._id)}
                        className="text-gray-400 hover:text-red-600 transition-colors relative z-10"
                        name="Delete section"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
          <div className="text-center py-12">
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
            <h3 className="text-lg font-medium  mb-2">No sections found</h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first section
            </p>
            <button
              onClick={() => {
                setIsEditMode(false);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-popular text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              Add Section
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">
              {isEditMode ? "Edit Section" : "Add New Section"}
            </h2>

            <div className="mb-4">
              <label
                htmlFor="sectionTitle"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Section name
              </label>
              <input
                id="sectionTitle"
                type="text"
                value={name}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter section name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-popular focus:border-transparent text-black"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === "Enter" && name.trim()) {
                    handleSubmit();
                  }
                }}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isPending || isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || isPending || isUpdating}
                className="px-4 py-2 bg-popular text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isUpdating
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update Section"
                  : "Create Section"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}