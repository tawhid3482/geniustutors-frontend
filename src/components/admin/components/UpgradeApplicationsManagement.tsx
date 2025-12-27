"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Mail,
  Phone,
  CreditCard,
  DollarSign,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  useGetAllTransactionQuery,
  useUpdateTransactionMutation,
} from "@/redux/features/transaction/transactionApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Transaction {
  id: string;
  transactionId: string;
  Amount: number;
  type: string;
  Status: "pending" | "success" | "rejected";
  method: string;
  paymentMethod: string;
  student: any;
  tutor: any;
  PaymentNumber: string;
  paymentProof: string;
  note: string;
  userId: string;
  is_Active: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    fullName: string;
    email: string;
    phone: string;
    avatar: string;
    tutor_id?: string;
  };
}

const TransactionManagement = () => {
  const { toast } = useToast();

  // RTK Query hooks
  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = useGetAllTransactionQuery(undefined, {
    pollingInterval: 30000,
  });

  const [updateTransactionStatus] = useUpdateTransactionMutation();

  // State management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Status change
  const [newStatus, setNewStatus] = useState<
    "pending" | "success" | "rejected"
  >("success");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  // Process transactions data
  useEffect(() => {
    if (transactionsData?.data) {
      const transactionsArray = transactionsData.data;
      setTransactions(transactionsArray);
    }
  }, [transactionsData]);

  // Filter transactions
  useEffect(() => {
    let result = transactions;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (transaction) =>
          transaction.transactionId.toLowerCase().includes(term) ||
          transaction.user?.fullName?.toLowerCase().includes(term) ||
          transaction.user?.email?.toLowerCase().includes(term) ||
          transaction.PaymentNumber.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(
        (transaction) => transaction.Status === statusFilter
      );
    }

    // Filter by method
    if (methodFilter !== "all") {
      result = result.filter(
        (transaction) => transaction.method === methodFilter
      );
    }

    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    setFilteredTransactions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [transactions, searchTerm, statusFilter, methodFilter, typeFilter]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedTransaction) return;

    try {
      setSubmitting(true);

      const updateData = {
        Status: newStatus,
        ...(adminNote && { note: adminNote }),
      };

      await updateTransactionStatus({
        id: selectedTransaction.id,
        data: updateData,
      }).unwrap();

      // Update local state
      const updatedTransactions = transactions.map((transaction) =>
        transaction.id === selectedTransaction.id
          ? { ...transaction, Status: newStatus }
          : transaction
      );

      setTransactions(updatedTransactions);

      // Update selected transaction
      if (selectedTransaction) {
        setSelectedTransaction({ ...selectedTransaction, Status: newStatus });
      }

      toast({
        title: "Success",
        description: `Transaction status updated to ${newStatus}.`,
      });

      setShowStatusModal(false);
      setAdminNote("");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.data?.message || "Failed to update transaction status.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Success
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get method badge
  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      Bkash: "bg-purple-100 text-purple-800",
      Nogod: "bg-blue-100 text-blue-800",
      Rocket: "bg-green-100 text-green-800",
    };

    return (
      <Badge
        className={`${
          colors[method] || "bg-gray-100 text-gray-800"
        } hover:bg-opacity-90`}
      >
        {method}
      </Badge>
    );
  };

  // Calculate statistics
  const totalAmount = transactions.reduce((sum, t) => sum + t.Amount, 0);
  const pendingCount = transactions.filter(
    (t) => t.Status === "pending"
  ).length;
  const successCount = transactions.filter(
    (t) => t.Status === "success"
  ).length;
  const rejectedCount = transactions.filter(
    (t) => t.Status === "rejected"
  ).length;

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Render page numbers
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className="w-10 h-10"
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load transactions. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Transaction Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and review all payment transactions on the platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold">
                  ৳{totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success</p>
                <p className="text-2xl font-bold">{successCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="Bkash">Bkash</SelectItem>
                <SelectItem value="Nogod">Nogod</SelectItem>
                <SelectItem value="Rocket">Rocket</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setMethodFilter("all");
                setTypeFilter("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">
            Transactions ({filteredTransactions.length})
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Items per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading transactions...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          <div className="text-sm">
                            {transaction.transactionId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.PaymentNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-semibold">
                              {transaction.user?.avatar ? (
                                <img
                                  src={transaction.user.avatar}
                                  alt={transaction.user.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                transaction.user?.fullName?.charAt(0) || "U"
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {transaction.user?.fullName}
                              </div>
                              {transaction.user?.tutor_id && (
                                <div className="text-xs text-gray-500">
                                  ID: {transaction.user.tutor_id}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold">
                            ৳{transaction.Amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getMethodBadge(transaction.method)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.Status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(transaction.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowDetailsModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {transaction && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setNewStatus("success");
                                  setShowStatusModal(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Empty State */}
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No transactions found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? "No transactions match your search."
                      : "No transactions available."}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredTransactions.length)} of{" "}
                    {filteredTransactions.length} transactions
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="hidden sm:flex"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center space-x-1">
                      {renderPageNumbers()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="hidden sm:flex"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about the transaction
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">
                      ৳{selectedTransaction.Amount.toLocaleString()}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(selectedTransaction.Status)}
                      {getMethodBadge(selectedTransaction.method)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Transaction ID</div>
                    <div className="font-mono text-sm">
                      {selectedTransaction.transactionId}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h3 className="font-semibold mb-3">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {selectedTransaction.user?.avatar ? (
                        <img
                          src={selectedTransaction.user.avatar}
                          alt={selectedTransaction.user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-green-400 to-green-600 text-white font-bold">
                          {selectedTransaction.user?.fullName?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedTransaction.user?.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedTransaction.user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">
                        {selectedTransaction.user?.phone}
                      </p>
                    </div>
                    {selectedTransaction.user?.tutor_id && (
                      <div>
                        <p className="text-sm text-gray-600">Tutor ID</p>
                        <p className="font-medium">
                          {selectedTransaction.user.tutor_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold mb-3">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{selectedTransaction.method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Number</p>
                    <p className="font-medium">
                      {selectedTransaction.PaymentNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction Type</p>
                    <p className="font-medium capitalize">
                      {selectedTransaction.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created Date</p>
                    <p className="font-medium">
                      {formatDate(selectedTransaction.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Proof */}
              {selectedTransaction.paymentProof && (
                <div>
                  <h3 className="font-semibold mb-3">Payment Proof</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">Screenshot/Proof</span>
                    </div>
                    <div className="relative">
                      <img
                        src={selectedTransaction.paymentProof}
                        alt="Payment proof"
                        className="w-full h-auto rounded-lg border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://via.placeholder.com/400x200?text=Image+Not+Found";
                        }}
                      />
                      <a
                        href={selectedTransaction.paymentProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-lg text-sm hover:bg-opacity-70"
                      >
                        View Full
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedTransaction.note && (
                <div>
                  <h3 className="font-semibold mb-3">Notes</h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-5 w-5 text-gray-500 mt-0.5" />
                      <p className="text-gray-700">
                        {selectedTransaction.note}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedTransaction?.Status === "pending" && (
              <Button
                onClick={() => {
                  setNewStatus("success");
                  setShowStatusModal(true);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Payment
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Transaction Status</DialogTitle>
            <DialogDescription>
              {newStatus === "success"
                ? "Approve this transaction and mark as successful."
                : "Reject this transaction with a reason."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value: "pending" | "success" | "rejected") =>
                  setNewStatus(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedTransaction && (
              <Alert>
                <AlertDescription>
                  <div className="font-medium mb-1">Transaction Summary:</div>
                  <div>
                    Amount: ৳{selectedTransaction.Amount.toLocaleString()}
                  </div>
                  <div>Method: {selectedTransaction.method}</div>
                  <div>User: {selectedTransaction.user?.fullName}</div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={submitting}>
              {submitting ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionManagement;
