import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { openSession, closeSession } from "../../services/apis";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function SessionManager({ registers, currentSession, onSessionChange }) {
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [actualClosing, setActualClosing] = useState("");
  const [closingNotes, setClosingNotes] = useState("");

  const token = useSelector((store) => store.user.token);
  const queryClient = useQueryClient();

  const openSessionMutation = useMutation({
    mutationFn: (data) => openSession(data, token),
    onSuccess: (data) => {
      toast.success("Session opened successfully!");
      setShowOpenModal(false);
      setSelectedRegister("");
      setOpeningBalance("");
      queryClient.invalidateQueries(["current-session"]);
      queryClient.invalidateQueries(["registers"]);
      if (onSessionChange) onSessionChange(data.data);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to open session");
    },
  });

  const closeSessionMutation = useMutation({
    mutationFn: (data) => closeSession(data, token),
    onSuccess: () => {
      toast.success("Session closed successfully!");
      setShowCloseModal(false);
      setActualClosing("");
      setClosingNotes("");
      queryClient.invalidateQueries(["current-session"]);
      queryClient.invalidateQueries(["registers"]);
      if (onSessionChange) onSessionChange(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to close session");
    },
  });

  const handleOpenSession = () => {
    if (!selectedRegister) {
      toast.error("Please select a register");
      return;
    }
    if (!openingBalance || parseFloat(openingBalance) < 0) {
      toast.error("Please enter a valid opening balance");
      return;
    }
    openSessionMutation.mutate({
      registerId: parseInt(selectedRegister),
      openingBalance: parseFloat(openingBalance),
    });
  };

  const handleCloseSession = () => {
    if (!actualClosing || parseFloat(actualClosing) < 0) {
      toast.error("Please enter the actual closing balance");
      return;
    }
    closeSessionMutation.mutate({
      sessionId: currentSession?._id,
      actualClosing: parseFloat(actualClosing),
      notes: closingNotes || undefined,
    });
  };

  const availableRegisters = registers?.filter(r => r.status === "available") || [];

  return (
    <>
      {/* Session Status Bar */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        {currentSession ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-gray-400 text-sm">Register:</span>
                <span className="ml-2 text-white font-medium">{currentSession.register?.name}</span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Session:</span>
                <span className="ml-2 text-green-400 font-medium">{currentSession.name}</span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Opened:</span>
                <span className="ml-2 text-white">
                  {new Date(currentSession.openedAt).toLocaleTimeString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Opening Balance:</span>
                <span className="ml-2 text-yellow-400 font-medium">
                  {currentSession.openingBalance?.toFixed(2)} EG
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setActualClosing(currentSession.expectedClosing?.toFixed(2) || "0");
                setShowCloseModal(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Close Session
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-gray-400">
              No active session. Open a session to start processing payments.
            </div>
            <button
              onClick={() => setShowOpenModal(true)}
              disabled={availableRegisters.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
            >
              Open Session
            </button>
          </div>
        )}
      </div>

      {/* Open Session Modal */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Open Cash Session</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Register
                </label>
                <select
                  value={selectedRegister}
                  onChange={(e) => setSelectedRegister(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Select a register --</option>
                  {availableRegisters.map((reg) => (
                    <option key={reg._id} value={reg._id}>
                      {reg.name} {reg.location?.name ? `(${reg.location.name})` : ""}
                    </option>
                  ))}
                </select>
                {availableRegisters.length === 0 && (
                  <p className="text-yellow-400 text-sm mt-1">
                    No registers available. All registers are in use.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Opening Balance (EG)
                </label>
                <input
                  type="number"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="Enter opening cash balance"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleOpenSession}
                disabled={openSessionMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {openSessionMutation.isPending ? "Opening..." : "Open Session"}
              </button>
              <button
                onClick={() => {
                  setShowOpenModal(false);
                  setSelectedRegister("");
                  setOpeningBalance("");
                }}
                disabled={openSessionMutation.isPending}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Session Modal */}
      {showCloseModal && currentSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Close Cash Session</h3>

            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Session:</span>
                  <span className="ml-2 text-white">{currentSession.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Register:</span>
                  <span className="ml-2 text-white">{currentSession.register?.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Opening:</span>
                  <span className="ml-2 text-white">{currentSession.openingBalance?.toFixed(2)} EG</span>
                </div>
                <div>
                  <span className="text-gray-400">Expected:</span>
                  <span className="ml-2 text-green-400 font-medium">
                    {currentSession.expectedClosing?.toFixed(2)} EG
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Actual Closing Balance (EG)
                </label>
                <input
                  type="number"
                  value={actualClosing}
                  onChange={(e) => setActualClosing(e.target.value)}
                  placeholder="Enter actual cash in drawer"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                />
                {actualClosing && currentSession.expectedClosing && (
                  <div className={`text-sm mt-1 ${
                    parseFloat(actualClosing) === currentSession.expectedClosing
                      ? "text-green-400"
                      : parseFloat(actualClosing) > currentSession.expectedClosing
                      ? "text-blue-400"
                      : "text-red-400"
                  }`}>
                    Variance: {(parseFloat(actualClosing) - currentSession.expectedClosing).toFixed(2)} EG
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Any notes about the session..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCloseSession}
                disabled={closeSessionMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {closeSessionMutation.isPending ? "Closing..." : "Close Session"}
              </button>
              <button
                onClick={() => {
                  setShowCloseModal(false);
                  setActualClosing("");
                  setClosingNotes("");
                }}
                disabled={closeSessionMutation.isPending}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
