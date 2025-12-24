"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  CreditCard,
  BadgeCheck,
  FileText,
  Phone,
  Receipt,
  Copy,
  Loader2,
  Calendar,
  Crown,
  Wallet,
  User2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.next";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetAllUpgradePackagesQuery } from "@/redux/features/upgradePackages/upgradePackagesApi";
import { useCreatePaymentMutation } from "@/redux/features/payment/paymentApi";
import { Textarea } from "@/components/ui/textarea";
import { useGetAllPaymentAccountQuery } from "@/redux/features/PaymentAccount/PaymentAccountApi";

// Types based on your Prisma schema
interface Package {
  id: string;
  name: string;
  packageType: "genius" | "premium" | "verified";
  description: string;
  price: number;
  duration: number;
  features: string[];
  is_active: boolean;
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

interface PaymentData {
  payment_method: string;
  transaction_id: string;
  amount: number;
  phone_number: string;
  package_id: string;
  notes?: string;
}

// Enum to match Prisma schema EXACTLY
enum TransactionMethod {
  Bkash = "Bkash",
  Nogod = "Nogod",
  Rocket = "Rocket",
  Bank = "Bank"
}

enum TransactionType {
  payment = "payment",
  refunded = "refunded",
  due = "due"
}

interface PaymentPayload {
  Amount: number;
  type: TransactionType.payment;
  method: TransactionMethod;
  paymentMethod: string;
  PaymentNumber: string;
  transactionId: string;
  userId: string | undefined;
  student: null;
  tutor: null;
  note?: string;
  paymentProof: string;
  package_id: string;
  is_Active?: boolean;
  Status?: string;
}

const EnhancedUpgradeSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  // State
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    payment_method: "",
    transaction_id: "",
    amount: 0,
    phone_number: "",
    package_id: "",
  });
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

  // API Calls
  const { data: packagesData, isLoading: packagesLoading } =
    useGetAllUpgradePackagesQuery(undefined);
  const { data: accountData, isLoading: accountLoading } =
    useGetAllPaymentAccountQuery(undefined);
  const [createPayment, { isLoading: creatingPayment }] =
    useCreatePaymentMutation();

  const packages: Package[] = packagesData?.data || [];
  const paymentAccounts: PaymentAccount[] = accountData?.data || [];

  const userInfo = {
    name: user?.fullName || "Tutor User",
    profileImage: user?.avatar || "",
  };

  // Helper function to normalize payment method to match enum
  const normalizePaymentMethod = (method: string): TransactionMethod => {
    const normalizedMethod = method.trim();
    
    // Handle different cases that might come from UI
    if (normalizedMethod.toLowerCase() === "bkash") {
      return TransactionMethod.Bkash;
    } else if (normalizedMethod.toLowerCase() === "nogod") {
      return TransactionMethod.Nogod;
    } else if (normalizedMethod.toLowerCase() === "rocket") {
      return TransactionMethod.Rocket;
    } else if (normalizedMethod.toLowerCase() === "bank") {
      return TransactionMethod.Bank;
    }
    
    // Default fallback
    return TransactionMethod.Bkash;
  };

  const parseFeatures = (features: string[] | string): string[] => {
    if (Array.isArray(features)) {
      return features;
    }
    return features.split(",").map((f) => f.trim());
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
      toast({
        title: "Error",
        description: err.message || "Failed to upload file",
        variant: "destructive",
      });
      throw err;
    }
  };

  const copyPaymentNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    });
  };

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setPaymentData({
      ...paymentData,
      amount: pkg.price,
      package_id: pkg.id,
    });
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPackage || !userId) {
      toast({
        title: "Error",
        description: "Please select a package and ensure you're logged in",
        variant: "destructive",
      });
      return;
    }

    if (
      !paymentData.payment_method ||
      !paymentData.transaction_id ||
      !paymentData.phone_number
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      let paymentProofUrl = "";

      if (paymentProofFile) {
        paymentProofUrl = await uploadImage(paymentProofFile);
      }

      // Normalize the payment method to match Prisma enum
      const normalizedMethod = normalizePaymentMethod(paymentData.payment_method);

      const paymentPayload: PaymentPayload = {
        Amount: selectedPackage.price,
        type: TransactionType.payment,
        method: normalizedMethod,
        paymentMethod: paymentData.payment_method, // Keep original for display
        PaymentNumber: paymentData.phone_number,
        transactionId: paymentData.transaction_id,
        userId: userId,
        student: null,
        tutor: null,
        note: paymentData.notes,
        paymentProof: paymentProofUrl,
        package_id: selectedPackage.id,
        Status: "pending", // Add status field
        is_Active: true, // Add is_Active field
      };

      const result = await createPayment(paymentPayload).unwrap();

      if (result.success) {
        toast({
          title: "Payment Submitted Successfully",
          description: "Your payment has been submitted for review",
        });

        setShowPaymentDialog(false);
        setPaymentData({
          payment_method: "",
          transaction_id: "",
          amount: 0,
          phone_number: "",
          package_id: "",
        });
        setPaymentProofFile(null);
      } else {
        throw new Error(result.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProofFile(file);
    }
  };

  const getPaymentMethodIcon = (accountName: string) => {
    switch (accountName.toLowerCase()) {
      case "bkash":
        return <Wallet className="h-4 w-4" />;
      case "nogod":
        return <Wallet className="h-4 w-4" />;
      case "rocket":
        return <CreditCard className="h-4 w-4" />;
      case "bank":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  // Format account name to match enum format
  const formatAccountNameForEnum = (accountName: string): string => {
    switch (accountName.toLowerCase()) {
      case "bkash":
        return "Bkash"; // Capital B, lowercase kash
      case "nogod":
        return "Nogod";
      case "rocket":
        return "Rocket";
      case "bank":
        return "Bank";
      default:
        return accountName;
    }
  };

  // User Profile Component
  const UserProfileHeader = () => (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
          <Avatar className="h-16 w-16">
            <AvatarImage src={userInfo.profileImage} alt={userInfo.name} />
            <AvatarFallback>
              <User2 className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{userInfo.name}</h2>
            <p className="text-gray-600">Tutor Account</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                Upgrade Available
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Payment Dialog
  const renderPaymentDialog = () => {
    const selectedAccount = paymentAccounts.find(
      (acc) => formatAccountNameForEnum(acc.accountName) === paymentData.payment_method
    );

    return (
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Complete Your Payment
            </DialogTitle>
            <DialogDescription>
              Select payment method and submit your payment details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Package Summary */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {selectedPackage?.packageType === "genius" ? (
                      <Crown className="h-6 w-6 text-yellow-500" />
                    ) : selectedPackage?.packageType === "premium" ? (
                      <BadgeCheck className="h-6 w-6 text-purple-500" />
                    ) : (
                      <Shield className="h-6 w-6 text-blue-500" />
                    )}
                    <h3 className="font-bold text-green-800 text-lg">
                      {selectedPackage?.name}
                    </h3>
                  </div>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-green-700">
                      ৳{selectedPackage?.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm text-green-600 mt-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedPackage?.duration} days</span>
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
                  value={paymentData.payment_method}
                  onValueChange={(value) => {
                    setPaymentData((prev) => ({
                      ...prev,
                      payment_method: value,
                    }));
                  }}
                >
                  <SelectTrigger className="border-green-200">
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentAccounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={formatAccountNameForEnum(account.accountName)}
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
                        onClick={() => copyPaymentNumber(selectedAccount.accountNumber)}
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
                  value={paymentData.phone_number}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                  className="border-green-200"
                  required
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Transaction ID *
                </Label>
                <Input
                  type="text"
                  placeholder="Enter transaction ID from your payment"
                  value={paymentData.transaction_id}
                  onChange={(e) =>
                    setPaymentData((prev) => ({
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
                  value={paymentData.notes || ""}
                  onChange={(e) =>
                    setPaymentData((prev) => ({ ...prev, notes: e.target.value }))
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
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPaymentDialog(false)}
                className="flex-1 border-green-300"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={submitting || creatingPayment}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
              >
                {submitting || creatingPayment ? (
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Package Card Component
  const PackageCard = ({ pkg }: { pkg: Package }) => {
    const features = parseFeatures(pkg.features);

    return (
      <Card className="border-2 hover:border-green-300 transition-all duration-300 hover:shadow-lg flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                {pkg.packageType === "genius" ? (
                  <Crown className="h-5 w-5 text-yellow-500" />
                ) : pkg.packageType === "premium" ? (
                  <BadgeCheck className="h-5 w-5 text-purple-500" />
                ) : (
                  <Shield className="h-5 w-5 text-blue-500" />
                )}
                {pkg.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {pkg.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-700">
                  ৳{pkg.price.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{pkg.duration} days</span>
                </div>
                <Badge
                  variant="outline"
                  className={
                    pkg.packageType === "genius"
                      ? "text-yellow-700 border-yellow-300"
                      : pkg.packageType === "premium"
                      ? "text-purple-700 border-purple-300"
                      : "text-blue-700 border-blue-300"
                  }
                >
                  {pkg.packageType.charAt(0).toUpperCase() +
                    pkg.packageType.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-700">
                Features:
              </div>
              <div className="space-y-2">
                {features.slice(0, 4).map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {features.length > 4 && (
                  <div className="text-sm text-gray-500">
                    + {features.length - 4} more features
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            onClick={() => handlePackageSelect(pkg)}
          >
            {pkg.packageType === "genius"
              ? "Upgrade to Genius"
              : pkg.packageType === "premium"
              ? "Get Premium"
              : "Get Verified"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Loading State
  if (packagesLoading || accountLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Profile */}
      <UserProfileHeader />

      {/* Available Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Upgrade Your Account
          </CardTitle>
          <CardDescription>
            Choose a package to enhance your tutoring experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Available Payment Methods
          </CardTitle>
          <CardDescription>
            Choose any of these methods to make your payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {paymentAccounts.map((account) => (
              <Card
                key={account.id}
                className="border hover:border-green-300 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(account.accountName)}
                      <span className="font-medium">{account.accountName}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPaymentNumber(account.accountNumber)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm font-mono text-gray-600">
                    {account.accountNumber}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      {renderPaymentDialog()}
    </div>
  );
};

export default EnhancedUpgradeSection;