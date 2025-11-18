"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CreditCard, AlertCircle } from "lucide-react";

interface PaymentPendingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  paymentAmount: number | string | undefined;
  paymentMethod?: string;
  transactionId?: string;
}

export function PaymentPendingDialog({
  isOpen,
  onClose,
  courseTitle,
  paymentAmount,
  paymentMethod,
  transactionId
}: PaymentPendingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <Clock className="h-6 w-6 text-yellow-600" />
            Payment Pending
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Alert Message */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Payment Verification Required</h3>
              <p className="text-sm text-yellow-700">
                Your payment is currently being verified by our team. You'll be able to access the course content once the payment is confirmed.
              </p>
            </div>
          </div>

          {/* Course Summary */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-4">
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 mb-2">{courseTitle}</h3>
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                  <span className="text-lg font-bold text-gray-700">
                    ৳{Number(paymentAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          {(paymentMethod || transactionId) && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Payment Details</h4>
              <div className="space-y-2 text-sm">
                {paymentMethod && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{paymentMethod}</span>
                  </div>
                )}
                {transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium font-mono text-xs">{transactionId}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Information */}
          <div className="text-center text-sm text-gray-600">
            <p>
              We typically verify payments within 24 hours. You'll receive an email notification once your payment is confirmed.
            </p>
          </div>

          {/* Action Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700"
          >
            Understood
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
