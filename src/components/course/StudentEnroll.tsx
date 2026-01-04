import { useCreateEnrollmentMutation } from "@/redux/features/area/enrollments/enrollmentsApi";
import { useGetAllPaymentAccountQuery } from "@/redux/features/PaymentAccount/PaymentAccountApi";
import { useCreateTransactionMutation } from "@/redux/features/transaction/transactionApi";
import React, { useState } from "react";
import { X, Upload, CheckCircle, Copy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.next";

interface StudentEnrollProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  onClose: () => void;
}

// Define transactionMethod enum based on your Prisma schema
enum TransactionMethod {
  Bkash = "Bkash",
  Nogod = "Nogod",
  Rocket = "Rocket",
  Bank = "Bank",
}

const StudentEnroll: React.FC<StudentEnrollProps> = ({
  courseId,
  courseTitle,
  coursePrice,
  onClose,
}) => {
  const { user } = useAuth();
  const { data: paymentAccountResponse } =
    useGetAllPaymentAccountQuery(undefined);
  const [createTransaction, { isLoading: isCreatingTransaction }] =
    useCreateTransactionMutation();
  const [createEnrollment, { isLoading: isCreatingEnrollment }] =
    useCreateEnrollmentMutation();

  const [selectedAccount, setSelectedAccount] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const paymentAccounts = paymentAccountResponse?.data || [];

  // Map account names to transactionMethod enum
  const getTransactionMethod = (
    accountName: string
  ): TransactionMethod | undefined => {
    const normalizedAccountName = accountName.toLowerCase();

    if (normalizedAccountName.includes("bkash")) return TransactionMethod.Bkash;
    if (normalizedAccountName.includes("nogod")) return TransactionMethod.Nogod;
    if (normalizedAccountName.includes("rocket"))
      return TransactionMethod.Rocket;
    if (normalizedAccountName.includes("bank")) return TransactionMethod.Bank;

    return undefined;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("image", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-image`,
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to upload file: ${errorText}`);
      }

      const result = await res.json();
      return result.url;
    } catch (err: any) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);

      // Create preview URL
      const url = URL.createObjectURL(e.target.files[0]);
      setPaymentProofUrl(url);
    }
  };

  const handleCopyAccountNumber = (
    accountNumber: string,
    accountName: string
  ) => {
    navigator.clipboard
      .writeText(accountNumber)
      .then(() => {
        setCopiedAccount(accountName);
        setTimeout(() => setCopiedAccount(null), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("Please login to enroll");
      return;
    }

    // Validate selected account
    const transactionMethod = getTransactionMethod(selectedAccount);
    if (!transactionMethod) {
      alert("Please select a valid payment method");
      return;
    }

    if (!transactionId.trim()) {
      alert("Please enter transaction ID");
      return;
    }

    if (!paymentProof) {
      alert("Please upload payment proof");
      return;
    }

    try {
      // 1. Upload payment proof
      const proofUrl = await uploadImage(paymentProof);

      // 2. Create transaction with user-provided transactionId
      const transactionData = {
        transactionId: transactionId.trim(), // Use user input
        Amount: coursePrice,
        type: "payment" as const,
        Status: "pending",
        method: transactionMethod, // Use enum value
        paymentMethod: selectedAccount, // Keep original string for reference
        student: user.id,
        tutor: undefined, // Will be set later if needed
        PaymentNumber: paymentNumber,
        paymentProof: proofUrl,
        note: note || `Enrollment for course: ${courseTitle}`,
        userId: user.id,
        is_Active: true,
      };


      const transactionResult = await createTransaction(
        transactionData
      ).unwrap();

      if (transactionResult.success) {
        const enrollmentData = {
          courseId,
          userId: user.id,
          status: "active", // Will be updated when payment is verified
        };

        console.log("Creating enrollment:", enrollmentData);

        const enrollmentResult = await createEnrollment(
          enrollmentData
        ).unwrap();

        if (enrollmentResult.success) {
          setIsSuccess(true);
          setStep(3);
        }
      }
    } catch (error: any) {
      console.error("Enrollment error:", error);
      if (
        error?.data?.message?.includes("unique") ||
        error?.data?.message?.includes("already exists")
      ) {
        alert(
          "This transaction ID has already been used. Please use a different transaction ID."
        );
      } else {
        alert("Failed to process enrollment. Please try again.");
      }
    }
  };

  // Render payment method options with validation
  const renderPaymentOptions = () => {
    const validAccounts = paymentAccounts.filter(
      (account: any) => getTransactionMethod(account.accountName) !== undefined
    );

    if (validAccounts.length === 0) {
      return (
        <option value="" disabled>
          No valid payment methods available
        </option>
      );
    }

    return (
      <>
        <option value="">Choose a payment method</option>
        {validAccounts.map((account: any) => (
          <option key={account.id} value={account.accountName}>
            {account.accountName} - {account.accountNumber}
          </option>
        ))}
      </>
    );
  };

  // Get selected account details
  const getSelectedAccountDetails = () => {
    if (!selectedAccount) return null;
    return paymentAccounts.find(
      (acc: any) => acc.accountName === selectedAccount
    );
  };

  const selectedAccountDetails = getSelectedAccountDetails();

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Enrollment Request Submitted!
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 font-semibold mb-2">
                Payment Details:
              </p>
              <div className="text-left space-y-1 text-sm">
                <p>
                  <span className="font-medium">Transaction ID:</span>{" "}
                  {transactionId}
                </p>
                <p>
                  <span className="font-medium">Amount:</span> ৳{coursePrice}
                </p>
                <p>
                  <span className="font-medium">Method:</span> {selectedAccount}
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Your enrollment request has been submitted successfully. Please
              wait for payment verification. You will be notified once your
              enrollment is approved.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> Your enrollment status is currently
                "inactive". It will be activated once the admin verifies your
                payment.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Enroll in Course
            </h3>
            <p className="text-gray-600">{courseTitle}</p>
            <p className="text-lg font-semibold text-green-600 mt-1">
              Amount: ৳{coursePrice}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <span className="text-sm mt-1">Payment Info</span>
            </div>
            <div className="h-1 flex-1 mx-4 bg-gray-200">
              <div className={`h-full ${step >= 2 ? "bg-blue-600" : ""}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <span className="text-sm mt-1">Payment Proof</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
              
               

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Payment Method *
                    </label>
                    <select
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {renderPaymentOptions()}
                    </select>
                  </div>

                  {selectedAccountDetails && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-semibold">
                        Send payment to: {selectedAccountDetails.accountNumber}
                      </p>
                      <p className="text-green-700 text-sm mt-1">
                        Amount: ৳{coursePrice}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Payment Number *
                    </label>
                    <input
                      type="text"
                      value={paymentNumber}
                      onChange={(e) => setPaymentNumber(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter the phone number or account number you used for payment"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter the transaction ID from your payment"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      This is the unique ID you received after making the
                      payment (e.g., TRX123456789)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note (Optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Any additional information about your payment..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  disabled={
                    !selectedAccount || !paymentNumber || !transactionId
                  }
                >
                  Continue to Payment Proof
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold mb-4">
                  Upload Payment Proof
                </h4>

                {/* Payment Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h5 className="font-semibold text-gray-900 mb-3">
                    Payment Summary
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <p className="font-semibold">৳{coursePrice}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Method:</span>
                      <p className="font-semibold">{selectedAccount}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Your Number:</span>
                      <p className="font-semibold">{paymentNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Transaction ID:</span>
                      <p className="font-semibold font-mono">{transactionId}</p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-6">
                  Please upload a clear screenshot of your payment transaction
                  for verification.
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
                  {paymentProofUrl ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={paymentProofUrl}
                          alt="Payment proof preview"
                          className="mx-auto max-h-64 rounded-lg"
                        />
                      </div>
                      <div className="flex justify-center gap-4">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                          <span className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                            Change Image
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentProof(null);
                            setPaymentProofUrl("");
                          }}
                          className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <label className="cursor-pointer inline-block">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                        />
                        <span className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                          Choose File
                        </span>
                      </label>
                      <p className="text-gray-500 mt-4 text-sm">
                        Supported formats: JPG, PNG, WebP (Max 5MB)
                      </p>
                    </>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">
                    Important: Screenshot must show:
                  </h5>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>
                      ✓ Transaction ID:{" "}
                      <span className="font-mono">{transactionId}</span>
                    </li>
                    <li>✓ Amount: ৳{coursePrice}</li>
                    <li>
                      ✓ Recipient number:{" "}
                      {selectedAccountDetails?.accountNumber}
                    </li>
                    <li>✓ Your number: {paymentNumber}</li>
                    <li>✓ Date and time of transaction</li>
                    <li>✓ Success confirmation message</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={
                    isCreatingTransaction ||
                    isCreatingEnrollment ||
                    !paymentProof
                  }
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingTransaction || isCreatingEnrollment ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    "Submit Enrollment"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer Note */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <p className="text-gray-500 text-sm text-center">
            <strong>Important:</strong> Please make sure the transaction ID is
            correct. Your enrollment will be activated within 24 hours after
            payment verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentEnroll;
