import React, { useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../Api/api";

const DeleteKitchen = ({ kitchenId, kitchenName, onDeleteSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      await api.delete(`/auth/admin/delete-kitchen/${kitchenId}`);

      onDeleteSuccess(kitchenId);
      setShowModal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      toast.success("Kitchen deleted successfully");
    } catch (error) {
      console.error("Error deleting kitchen:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data ||
          "Failed to delete kitchen. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-1 mx-auto bg-red-100 hover:bg-red-200 text-red-700 font-medium px-3 py-1 rounded-lg transition"
      >
        <FiTrash2 /> Delete
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[420px]">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-red-600">{kitchenName}</span>?
              <br />
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                No
              </button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className={`px-6 py-2 rounded-lg text-white font-medium transition ${
                  loading
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-xl shadow-lg w-[350px] text-center">
            <h3 className="text-green-600 text-xl font-semibold mb-2">
              Deleted Successfully
            </h3>
            <p className="text-gray-600">
              Kitchen <b>{kitchenName}</b> has been removed.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteKitchen;
