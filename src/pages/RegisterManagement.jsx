import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getRegisters,
  createRegister,
  updateRegister,
  deleteRegister,
  get_kitchens,
} from "../services/apis";

export default function RegisterManagement() {
  const [showModal, setShowModal] = useState(false);
  const [editingRegister, setEditingRegister] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    kitchen_ids: [],
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const token = useSelector((store) => store.user.token);
  const queryClient = useQueryClient();

  // Fetch all registers
  const { data: registersData, isLoading } = useQuery({
    queryKey: ["registers"],
    queryFn: () => getRegisters(token),
  });

  // Fetch all kitchens
  const { data: kitchensData } = useQuery({
    queryKey: ["kitchens"],
    queryFn: () => get_kitchens(token),
  });

  const registers = registersData?.data || [];
  const kitchens = kitchensData?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => createRegister(data, token),
    onSuccess: () => {
      toast.success("Register created successfully!");
      closeModal();
      queryClient.invalidateQueries(["registers"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create register");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateRegister(id, data, token),
    onSuccess: () => {
      toast.success("Register updated successfully!");
      closeModal();
      queryClient.invalidateQueries(["registers"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update register");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteRegister(id, token),
    onSuccess: () => {
      toast.success("Register deleted successfully!");
      setShowDeleteConfirm(null);
      queryClient.invalidateQueries(["registers"]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete register");
    },
  });

  const openCreateModal = () => {
    setEditingRegister(null);
    setFormData({ name: "", code: "", kitchen_ids: [] });
    setShowModal(true);
  };

  const openEditModal = (register) => {
    setEditingRegister(register);
    setFormData({
      name: register.name || "",
      code: register.code || "",
      kitchen_ids: register.kitchens?.map((k) => k._id) || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRegister(null);
    setFormData({ name: "", code: "", kitchen_ids: [] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Register name is required");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim() || undefined,
      kitchen_ids: formData.kitchen_ids,
    };

    if (editingRegister) {
      updateMutation.mutate({ id: editingRegister._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleKitchen = (kitchenId) => {
    setFormData((prev) => ({
      ...prev,
      kitchen_ids: prev.kitchen_ids.includes(kitchenId)
        ? prev.kitchen_ids.filter((id) => id !== kitchenId)
        : [...prev.kitchen_ids, kitchenId],
    }));
  };

  const handleDelete = (register) => {
    if (register.status === "in_use") {
      toast.error("Cannot delete a register that is currently in use");
      return;
    }
    setShowDeleteConfirm(register);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate(showDeleteConfirm._id);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
            Available
          </span>
        );
      case "in_use":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-400">
            In Use
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 p-6 pb-0">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 hidden md:block bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 hidden md:block bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 hidden md:block bg-green-500 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider ml-4">
            Cash Registers
          </h2>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Register
        </button>
      </div>

      <div className="px-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Total Registers</div>
            <div className="text-2xl font-bold text-white">{registers.length}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Available</div>
            <div className="text-2xl font-bold text-green-400">
              {registers.filter((r) => r.status === "available").length}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">In Use</div>
            <div className="text-2xl font-bold text-yellow-400">
              {registers.filter((r) => r.status === "in_use").length}
            </div>
          </div>
        </div>

        {/* Registers Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              Loading registers...
            </div>
          ) : registers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-4">No registers found</div>
              <button
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create your first register
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Code</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Kitchens</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Current Session</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {registers.map((register) => (
                  <tr key={register._id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{register.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {register.code || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(register.status)}
                    </td>
                    <td className="px-6 py-4">
                      {register.kitchens?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {register.kitchens.map((k) => (
                            <span
                              key={k._id}
                              className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500/20 text-purple-400"
                            >
                              {k.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">All kitchens</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {register.currentSession ? (
                        <div>
                          <div className="text-white text-sm">{register.currentSession.cashier}</div>
                          <div className="text-xs text-gray-500">
                            Since {new Date(register.currentSession.openedAt).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(register)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(register)}
                          disabled={register.status === "in_use"}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={register.status === "in_use" ? "Cannot delete while in use" : "Delete"}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingRegister ? "Edit Register" : "Add New Register"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Register Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Main Counter, Bar, Takeaway"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Register Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., REG-001"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assigned Kitchens
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Select kitchens whose orders will appear at this register. Leave empty for all kitchens.
                </p>
                <div className="flex flex-wrap gap-2">
                  {kitchens.map((kitchen) => (
                    <button
                      key={kitchen._id}
                      type="button"
                      onClick={() => toggleKitchen(kitchen._id)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        formData.kitchen_ids.includes(kitchen._id)
                          ? "bg-purple-500/30 text-purple-300 border border-purple-500"
                          : "bg-gray-700 text-gray-400 border border-gray-600 hover:bg-gray-600"
                      }`}
                    >
                      {kitchen.name}
                    </button>
                  ))}
                  {kitchens.length === 0 && (
                    <span className="text-gray-500 text-sm">No kitchens available</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingRegister
                    ? "Update Register"
                    : "Create Register"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Register</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-medium text-white">"{showDeleteConfirm.name}"</span>?
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleteMutation.isPending}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
