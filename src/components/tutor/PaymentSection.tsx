"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext.next";
import {
  CreditCard,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Wallet,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Shield,
  Percent,
  Info,
  CheckSquare,
  AlertTriangle,
  Receipt,
  ArrowRight,
  Copy,
  Loader2,
  Phone,
  User,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  useCreatePaymentMutation,
  useGetAllPaymentByRoleQuery,
} from "@/redux/features/payment/paymentApi";
import { useGetAllRefundPolicyQuery } from "@/redux/features/RefundPolicy/RefundPolicyApi";
import {
  useGetAllAssignPlatformFeeQuery,
  useUpdateAssignTutorPlatformFeeMutation,
} from "@/redux/features/AssignTutor/AssignTutorApi";
import { useGetAllPaymentAccountQuery } from "@/redux/features/PaymentAccount/PaymentAccountApi";
import { Alert, AlertDescription } from "../ui/alert";
import { useGetAllSetPlatformFeeQuery } from "@/redux/features/SetPlatformFee/SetPlatformFeeApi";
// import { useGetAllSetPlatformFeeQuery } from "@/redux/features/SetPlatformFee/SetPlatformFeeApi";

// Type definitions
interface Transaction {
  id: string;
  transactionId: string;
  Amount: number;
  type: "payment" | "refunded" | "payout" | "due";
  Status: "success" | "pending" | "failed" | "cancelled";
  method: string;
  paymentMethod: string;
  student: string;
  tutor: string;
  PaymentNumber: string;
  userId: string;
  is_Active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormattedTransaction {
  id: string;
  type: "payment" | "refunded" | "payout" | "due";
  amount: number;
  description: string;
  payment_method: string;
  status: "success" | "pending" | "failed" | "cancelled";
  created_at: string;
  reference_id: string;
  student?: string;
  tutor?: string;
  payment_number?: string;
}

interface PaymentStats {
  totalPayableAmount: number;
  totalPlatformFee: number;
  paidAmount: number;
  dueAmount: number;
  refundedAmount: number;
  pendingAmount: number;
  thisMonthPayments: number;
}

interface RefundPolicy {
  id: string;
  title: string;
  description: string;
  conditions: string[];
  processing_time: string;
  createdAt: string;
  updatedAt: string;
}

interface PlatformFeeData {
  id: string;
  tutorId: string;
  payableAmount: number;
  paidAmount: number;
  dueAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface PaymentAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Transaction[];
}

interface RefundPolicyApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: RefundPolicy[];
}

interface PlatformFeeApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PlatformFeeData;
}

interface PaymentAccountApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PaymentAccount[];
}

type TransactionType = "payment" | "refunded" | "payout" | "due";
type TransactionStatus = "success" | "pending" | "failed" | "cancelled";

interface PaymentFormData {
  payment_method: string;
  transaction_id: string;
  phone_number: string;
  amount: number;
  note?: string;
}

export function PaymentSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user.id;
  const { data: feeData, isLoading: isFetching } =
    useGetAllSetPlatformFeeQuery(undefined);
  // API Calls
  const { data: paymentData, refetch } = useGetAllPaymentByRoleQuery(
    userId
  ) as {
    data: PaymentApiResponse;
    refetch: () => void;
  };

  const { data: refundPolicyData, isLoading: isLoadingRefundPolicies } =
    useGetAllRefundPolicyQuery(undefined) as {
      data: RefundPolicyApiResponse;
      isLoading: boolean;
    };

  const Fee = feeData?.data;
  const amountFee = Fee?.map((e: any) => e?.amount);

  const { data: PlatformFeeData } = useGetAllAssignPlatformFeeQuery(
    user.tutor_id
  ) as {
    data: PlatformFeeApiResponse;
  };

  const { data: paymentAccount } = useGetAllPaymentAccountQuery(undefined) as {
    data: PaymentAccountApiResponse;
  };

  const [createPayment] = useCreatePaymentMutation();
  const [updatePlatformFee] = useUpdateAssignTutorPlatformFeeMutation();

  // State for filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [transactions, setTransactions] = useState<FormattedTransaction[]>([]);
  const [refundPolicies, setRefundPolicies] = useState<RefundPolicy[]>([]);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    payment_method: "",
    transaction_id: "",
    phone_number: "",
    amount: PlatformFeeData?.data?.dueAmount || 0,
    note: "",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calculate statistics from transaction data
  const calculateStats = (): PaymentStats => {
    if (!transactions.length) {
      return {
        totalPayableAmount: PlatformFeeData?.data?.payableAmount || 0,
        totalPlatformFee: PlatformFeeData?.data?.payableAmount
          ? PlatformFeeData.data.payableAmount * 0.55
          : 0,
        paidAmount: PlatformFeeData?.data?.paidAmount || 0,
        dueAmount: PlatformFeeData?.data?.dueAmount || 0,
        refundedAmount: 0,
        pendingAmount: 0,
        thisMonthPayments: 0,
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats = transactions.reduce(
      (acc: PaymentStats, transaction: FormattedTransaction) => {
        const transDate = new Date(transaction.created_at);
        const isCurrentMonth =
          transDate.getMonth() === currentMonth &&
          transDate.getFullYear() === currentYear;

        // Calculate platform fee (55% of successful payments)
        if (
          transaction.type === "payment" &&
          transaction.status === "success"
        ) {
          const platformFee = transaction.amount * 0.55;
          acc.totalPlatformFee += platformFee;
          acc.totalPayableAmount += transaction.amount;
        }

        // Calculate this month's payments (successful payments only)
        if (
          transaction.type === "payment" &&
          transaction.status === "success" &&
          isCurrentMonth
        ) {
          acc.thisMonthPayments += transaction.amount;
        }

        switch (transaction.type) {
          case "payment":
            if (transaction.status === "success") {
              acc.paidAmount += transaction.amount;
            } else if (transaction.status === "pending") {
              acc.pendingAmount += transaction.amount;
            }
            break;

          case "due":
            if (transaction.status === "success") {
              acc.dueAmount += transaction.amount;
            }
            break;

          case "refunded":
            if (transaction.status === "success") {
              acc.refundedAmount += transaction.amount;
            }
            break;
        }

        return acc;
      },
      {
        totalPayableAmount: PlatformFeeData?.data?.payableAmount || 0,
        totalPlatformFee: PlatformFeeData?.data?.payableAmount
          ? PlatformFeeData.data.payableAmount * 0.55
          : 0,
        paidAmount: PlatformFeeData?.data?.paidAmount || 0,
        dueAmount: PlatformFeeData?.data?.dueAmount || 0,
        refundedAmount: 0,
        pendingAmount: 0,
        thisMonthPayments: 0,
      }
    );

    return stats;
  };

  const stats: PaymentStats = calculateStats();

  // Separate transactions by type for different tabs
  const paymentTransactions = transactions.filter((t) => t.type === "payment");
  const refundedTransactions = transactions.filter(
    (t) => t.type === "refunded"
  );
  const dueTransactions = transactions.filter((t) => t.type === "due");

  // Filtered transactions for main table
  const filteredTransactions: FormattedTransaction[] = transactions.filter(
    (transaction) => {
      const matchesSearch =
        searchQuery === "" ||
        transaction.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.reference_id
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.student
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.tutor?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;
      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    }
  );

  // Pagination calculations
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const fetchPaymentData = () => {
    refetch();
    setCurrentPage(1); // Reset to first page when refreshing
    toast({
      title: "Refreshing data",
      description: "Fetching latest payment information...",
    });
  };

  const formatCurrency = (amount: number): string => {
    return `৳${amount?.toLocaleString() || "0"}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case "refunded":
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case "payout":
        return <Wallet className="h-4 w-4 text-purple-600" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-red-600" />;
      case "due":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeText = (type: TransactionType): string => {
    switch (type) {
      case "payment":
        return "Payment";
      case "refunded":
        return "Refund";
      case "payout":
        return "Payout";
      case "due":
        return "Due";
      default:
        return type;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    const methodLower = method?.toLowerCase();
    switch (methodLower) {
      case "bank":
        return <CreditCard className="h-4 w-4" />;
      case "bkash":
      case "nogod":
      case "rocket":
      case "mobile banking":
        return <Wallet className="h-4 w-4" />;
      case "cash":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Success
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Failed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  // Upload image function
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
      toast({
        title: "Error",
        description: err.message || "Failed to upload file",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (
      !paymentFormData.payment_method ||
      !paymentFormData.transaction_id ||
      !paymentFormData.phone_number
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let paymentProofUrl = "";

      if (paymentProofFile) {
        paymentProofUrl = await uploadImage(paymentProofFile);
      }

      const paymentPayload = {
        Amount: paymentFormData.amount,
        type: "payment",
        method: paymentFormData.payment_method,
        paymentMethod: paymentFormData.payment_method,
        PaymentNumber: paymentFormData.phone_number,
        transactionId: paymentFormData.transaction_id,
        userId: userId,
        student: null,
        tutor: null,
        note: paymentFormData.note,
        paymentProof: paymentProofUrl,
        package_id: null,
        Status: "pending",
        is_Active: true,
      };

      const result = await createPayment(paymentPayload).unwrap();

      if (result.success) {
        // Update platform fee data
        if (PlatformFeeData?.data?.id) {
          const updateData = {
            id: user.tutor_id,
            data: {
              paidAmount: paymentFormData.amount,
            },
          };
          await updatePlatformFee(updateData).unwrap();
        }

        toast({
          title: "Payment Submitted Successfully",
          description: "Your payment has been submitted for review",
        });

        // Reset form and close modal
        setPaymentFormData({
          payment_method: "",
          transaction_id: "",
          phone_number: "",
          amount: PlatformFeeData?.data?.dueAmount || 0,
          note: "",
        });
        setPaymentProofFile(null);
        setShowPaymentModal(false);

        // Refresh data
        fetchPaymentData();
      } else {
        throw new Error(result.message || "Payment failed");
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy payment number to clipboard
  const copyPaymentNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProofFile(file);
    }
  };

  const handlePayNow = () => {
    setPaymentFormData({
      ...paymentFormData,
      amount: PlatformFeeData?.data?.dueAmount || 0,
    });
    setShowPaymentModal(true);
  };

  const jobValue = 10000;
  const platformFeeAmount = (jobValue * amountFee) / 100;
  const tutorReceives = jobValue - platformFeeAmount;

  // Get selected account details
  const selectedAccount = paymentAccount?.data?.find(
    (acc) => acc.accountName === paymentFormData.payment_method
  );

  // Get platform charge policy
  const platformChargePolicy = {
    title: "Platform Charge Policy",
    description: `Once a tuition job is confirmed successfully, tutors must pay a one-time platform fee for each job. The charge is ${amountFee}% for both Home Tutoring and Online Tutoring.`,
    keyPoints: [
      "One-time fee per confirmed tuition job",
      `${amountFee}% fee applies to both Home and Online Tutoring`,
      "Fee is calculated based on the total job value",
      "Fee is charged only once per job confirmation",
      "No additional platform fees for extended job durations",
    ],
  };

  useEffect(() => {
    // Load transaction data
    if (paymentData?.data) {
      const formattedTransactions: FormattedTransaction[] =
        paymentData.data.map((item: Transaction) => ({
          id: item.id,
          type: item.type,
          amount: item.Amount,
          description: `${getTypeText(item.type)} - ${item.transactionId}`,
          payment_method: item.method || item.paymentMethod,
          status: item.Status,
          created_at: item.createdAt,
          reference_id: item.transactionId,
          student: item.student,
          tutor: item.tutor,
          payment_number: item.PaymentNumber,
        }));
      setTransactions(formattedTransactions);
    }
  }, [paymentData]);

  useEffect(() => {
    // Load refund policy data from API
    if (refundPolicyData?.data) {
      setRefundPolicies(refundPolicyData.data);
    }
  }, [refundPolicyData]);

  // Render refund policy section
  const renderRefundPolicy = () => {
    if (isLoadingRefundPolicies) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading refund policies...</p>
        </div>
      );
    }

    if (refundPolicies.length === 0) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">
            No Refund Policies Available
          </h3>
          <p className="text-gray-600">
            Refund policies are currently being updated.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {refundPolicies.map((policy, index) => (
          <Card key={policy.id} className={index > 0 ? "mt-6" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {policy.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Policy Description */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-gray-600" />
                  <h4 className="font-bold text-gray-900">
                    Policy Description
                  </h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {policy.description}
                </p>
              </div>

              {/* Conditions */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-medium mb-3 text-blue-900">Conditions:</h4>
                <ul className="space-y-2">
                  {policy.conditions.map((condition, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-800">{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Processing Time */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium text-green-900">
                    Processing Time
                  </h4>
                </div>
                <p className="text-green-800 text-sm">
                  {policy.processing_time}
                </p>
                <p className="text-green-800 text-xs mt-2">
                  Last updated:{" "}
                  {new Date(policy.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render platform charge policy section
  const renderPlatformChargePolicy = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            {platformChargePolicy.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Charge Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 mb-3">
              <Percent className="h-5 w-5 text-blue-600" />
              <h4 className="font-bold text-blue-900">Platform Charge</h4>
            </div>
            <p className="text-blue-800 text-sm leading-relaxed">
              {platformChargePolicy.description}
            </p>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h4 className="font-medium mb-3 text-gray-800">Key Points:</h4>
            <ul className="space-y-3">
              {platformChargePolicy.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Example Calculation */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">
                Platform Charge Example
              </span>
            </div>
            <p className="text-green-800 text-sm">
              For a tuition job valued at {jobValue.toLocaleString()} BDT:
              <br />
              <strong>Platform Fee {amountFee}%:</strong>{" "}
              {platformFeeAmount.toLocaleString()} BDT
              <br />
              <strong>
                Tutor Receives:
              </strong> {tutorReceives.toLocaleString()} BDT
            </p>

            <p className="text-green-800 text-sm mt-2">
              Note: This is a one-time fee charged when the job is confirmed. No
              additional platform fees for the duration of the job.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers();

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Showing</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>entries per page</span>
        </div>

        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
          {totalItems} entries
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((pageNumber, index) => (
            <div key={index}>
              {pageNumber === "..." ? (
                <span className="px-3 py-2">...</span>
              ) : (
                <Button
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber as number)}
                  className={
                    currentPage === pageNumber
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                >
                  {pageNumber}
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Pay Now Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            <h2 className="text-3xl font-bold tracking-tight">
              Payment Section
            </h2>
          </div>
          <p className="text-muted-foreground text-lg mt-2">
            Once a tuition job is confirmed successfully, tutors must pay a
            one-time platform fee for each job. <br /> The charge is 55% for
            both Home Tutoring and Online Tutoring.
          </p>
        </div>

        {/* Pay Now Button */}
        {PlatformFeeData?.data?.dueAmount > 0 && (
          <Button
            onClick={handlePayNow}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg px-6 py-6 h-auto"
            size="lg"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Pay Now
            <span className="ml-2 bg-white/20 px-2 py-1 rounded text-sm">
              {formatCurrency(PlatformFeeData.data.dueAmount)}
            </span>
          </Button>
        )}
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Platform Fee Percentage */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Platform Fee Rate
                </p>
                <p className="text-2xl font-bold text-blue-600">{amountFee}</p>
              </div>
              <Percent className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Total Payable Amount */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Payable Amount
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {PlatformFeeData?.data
                    ? formatCurrency(PlatformFeeData.data.payableAmount)
                    : "৳0"}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Paid Amount */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Paid Amount
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {PlatformFeeData?.data
                    ? formatCurrency(PlatformFeeData.data.paidAmount)
                    : "৳0"}
                </p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Due Amount */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Due Amount
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {PlatformFeeData?.data
                    ? formatCurrency(PlatformFeeData.data.dueAmount)
                    : "৳0"}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* Refunded Amount */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Refunded Amount
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.refundedAmount)}
                </p>
              </div>
              <Download className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Amount */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Amount
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats.pendingAmount)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={fetchPaymentData}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full md:grid-cols-4">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            All Transactions
          </TabsTrigger>
          <TabsTrigger value="due-history" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Due History
          </TabsTrigger>
          <TabsTrigger
            value="refund-policy"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Refund Policy
          </TabsTrigger>
          <TabsTrigger
            value="platform-charge"
            className="flex items-center gap-2"
          >
            <Percent className="h-4 w-4" />
            Platform Charge
          </TabsTrigger>
        </TabsList>

        {/* All Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search transactions, student, tutor..."
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchQuery(e.target.value)
                      }
                      className="pl-10 border-2 border-green-500"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="payment">Payments</SelectItem>
                    <SelectItem value="refunded">Refunds</SelectItem>
                    <SelectItem value="due">Due</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Transactions History</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50">
                    Total: {transactions.length}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPaymentData}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentTransactions.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Transaction ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(transaction.type)}
                                <span className="font-medium">
                                  {getTypeText(transaction.type)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <span
                                className={
                                  transaction.type === "refunded"
                                    ? "text-blue-600"
                                    : transaction.type === "due"
                                    ? "text-orange-600"
                                    : "text-red-600"
                                }
                              >
                                {formatCurrency(transaction.amount)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{transaction.description}</p>
                                {transaction.tutor && (
                                  <p className="text-xs text-muted-foreground">
                                    Tutor: {transaction.tutor}
                                  </p>
                                )}
                                {transaction.student && (
                                  <p className="text-xs text-muted-foreground">
                                    Student: {transaction.student}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getPaymentMethodIcon(
                                  transaction.payment_method
                                )}
                                <div>
                                  <p>{transaction.payment_method}</p>
                                  {transaction.payment_number && (
                                    <p className="text-xs text-muted-foreground">
                                      {transaction.payment_number}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(transaction.status)}
                            </TableCell>
                            <TableCell>
                              {formatDate(transaction.created_at)}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {transaction.reference_id}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {renderPagination()}
                </>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No transactions found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery ||
                    statusFilter !== "all" ||
                    typeFilter !== "all"
                      ? "Try adjusting your filters to see more results"
                      : "You haven't made any transactions yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Due History Tab */}
        <TabsContent value="due-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Due Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dueTransactions.length > 0 ? (
                <div className="space-y-4">
                  {/* Due Summary Card */}
                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-orange-800">
                            Total Due Amount
                          </p>
                          <p className="text-2xl font-bold text-orange-700">
                            {formatCurrency(stats.dueAmount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-orange-700">
                            Total Due Records: {dueTransactions.length}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            Last updated: {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Due Transactions Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Tutor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Payment Method</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dueTransactions.map((transaction) => (
                          <TableRow
                            key={transaction.id}
                            className="hover:bg-orange-50"
                          >
                            <TableCell className="font-mono font-medium">
                              {transaction.reference_id}
                            </TableCell>
                            <TableCell className="font-bold text-orange-600">
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              {transaction.student || "N/A"}
                            </TableCell>
                            <TableCell>{transaction.tutor || "N/A"}</TableCell>
                            <TableCell>
                              {getStatusBadge(transaction.status)}
                            </TableCell>
                            <TableCell>
                              {formatDate(transaction.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getPaymentMethodIcon(
                                  transaction.payment_method
                                )}
                                <span>{transaction.payment_method}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Due Payments</h3>
                  <p className="text-muted-foreground">
                    You have no outstanding due payments. All your payments are
                    up to date.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refund Policy Tab */}
        <TabsContent value="refund-policy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Refund Policies
              </CardTitle>
            </CardHeader>
            <CardContent>{renderRefundPolicy()}</CardContent>
          </Card>
        </TabsContent>

        {/* Platform Charge Tab */}
        <TabsContent value="platform-charge" className="space-y-4">
          {renderPlatformChargePolicy()}
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Submit Platform Fee Payment
            </DialogTitle>
            <DialogDescription>
              Pay your platform fee using available payment methods
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Payment Summary */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Receipt className="h-6 w-6 text-green-600" />
                    <h3 className="font-bold text-green-800 text-lg">
                      Platform Fee Payment
                    </h3>
                  </div>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-green-700">
                      {formatCurrency(paymentFormData.amount)}
                    </span>
                  </div>
                  <div className="text-sm text-green-600 mt-3">
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Tutor ID: {PlatformFeeData?.data?.tutorId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <div className="space-y-4">
              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Select Payment Method *
                </Label>
                <Select
                  value={paymentFormData.payment_method}
                  onValueChange={(value) =>
                    setPaymentFormData((prev) => ({
                      ...prev,
                      payment_method: value,
                    }))
                  }
                >
                  <SelectTrigger className="border-green-200">
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentAccount?.data?.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={account.accountName}
                        className="flex items-center gap-2"
                      >
                        {getPaymentMethodIcon(account.accountName)}
                        <span>{account.accountName}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Account Details */}
              {selectedAccount && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    Send Payment To
                  </Label>
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {selectedAccount.accountName}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyPaymentNumber(selectedAccount.accountNumber)
                        }
                        className="h-6 px-2"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600 font-mono">
                      {selectedAccount.accountNumber}
                    </div>
                  </div>
                </div>
              )}

              {/* Your Phone Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Your Account Number *
                </Label>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={paymentFormData.phone_number}
                  onChange={(e) =>
                    setPaymentFormData((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                  className="border-green-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Enter Your Amount *
                </Label>
                <Input
                  type="number"
                  placeholder="Enter Your Amount"
                  value={
                    paymentFormData.amount === 0 ? "" : paymentFormData.amount
                  }
                  onChange={(e) =>
                    setPaymentFormData((prev) => ({
                      ...prev,
                      amount:
                        e.target.value === "" ? 0 : Number(e.target.value),
                    }))
                  }
                  onWheel={(e) => e.currentTarget.blur()}
                  className="border-green-200"
                  required
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Transaction ID *
                </Label>
                <Input
                  type="text"
                  placeholder="Enter transaction ID from your payment"
                  value={paymentFormData.transaction_id}
                  onChange={(e) =>
                    setPaymentFormData((prev) => ({
                      ...prev,
                      transaction_id: e.target.value,
                    }))
                  }
                  className="border-green-200"
                  required
                />
              </div>

              {/* Payment Proof */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Payment Proof (Screenshot)
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border-green-200"
                />
                {paymentProofFile && (
                  <p className="text-sm text-green-600">
                    Selected: {paymentProofFile.name}
                  </p>
                )}
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  placeholder="Any additional information about your payment..."
                  className="border-green-200 min-h-[80px]"
                  value={paymentFormData.note || ""}
                  onChange={(e) =>
                    setPaymentFormData((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Information Alert */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 text-sm">
                Please keep your transaction ID safe. It will be used to verify
                your payment within 24 hours.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="border-green-300"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Payment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
