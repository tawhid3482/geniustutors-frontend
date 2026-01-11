'use client'
import { useState, useEffect } from "react";
import { DollarSign, CheckCircle } from "lucide-react";
import {
  useCreateSetPlatformFeeMutation,
  useGetAllSetPlatformFeeQuery,
} from "@/redux/features/SetPlatformFee/SetPlatformFeeApi";

const SetPlatformFee = () => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createSetPlatformFee, { isLoading }] =
    useCreateSetPlatformFeeMutation();
  const { data: feeData, isLoading: isFetching } =
    useGetAllSetPlatformFeeQuery(undefined);


  const [currentFee, setCurrentFee] = useState<{
    amount: number;
    updatedAt: string;
  } | null>(null);

  // Fetch existing platform fee
  useEffect(() => {
    if (feeData && feeData.length > 0) {
      const existingFee = feeData[0];
      setCurrentFee(existingFee);
      setAmount(existingFee.amount.toString());
    }
  }, [feeData]);
  const Fee = feeData?.data
  const amountFee = Fee?.map((e:any)=> e.amount)

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validation
    if (!amount.trim()) {
      setError("Please enter platform fee amount");
      return;
    }

    const amountValue = parseInt(amount);
    if (isNaN(amountValue) || amountValue < 0) {
      setError("Please enter a valid positive number");
      return;
    }

    try {
      const response = await createSetPlatformFee({
        amount: amountValue,
      }).unwrap();

      if (response) {
        setSuccessMessage("Platform fee updated successfully!");
        setCurrentFee(response);
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      }
    } catch (error) {
      setError("Failed to update platform fee");
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Card Container */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-red-600 p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Set Platform Fee
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Only one platform fee can exist in the system
              </p>
            </div>
          </div>
          <div className="text-white font-bold mt-5 text-xl">
            <p>Your Platform Fee Is: {amountFee}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isFetching ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <>
              {/* Current Fee Display */}
              {currentFee && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-green-700">
                      Current Platform Fee
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-green-600">
                      ${currentFee.amount}
                    </span>
                    <span className="text-gray-500">per transaction</span>
                  </div>
                  <div className="text-sm text-green-600 mt-1">
                    Last updated:{" "}
                    {new Date(currentFee.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">
                      {successMessage}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Fee Setting Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Fee Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setError("");
                          setSuccessMessage("");
                        }}
                        placeholder="Enter fee amount"
                        className="pl-8 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                        min="0"
                        step="1"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Enter the fixed amount for platform fee
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : currentFee ? (
                      "Update Platform Fee"
                    ) : (
                      "Set Platform Fee"
                    )}
                  </button>
                </div>
              </form>

              {/* Important Notes */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-green-700">
                      <strong className="font-semibold">Important:</strong> This
                      system allows only one platform fee. Submitting a new fee
                      will automatically update the existing one.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add custom styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SetPlatformFee;
