"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard } from "lucide-react";
import { PaymentMethod } from "@/types/student";

interface StudentBookingsProps {
  bookings: any[];
  payDialog: { open: boolean; bookingId: string | null };
  setPayDialog: (dialog: { open: boolean; bookingId: string | null }) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  payForBooking: (bookingId: string) => void;
  downloadInvoice: (booking: any) => void;
  paymentMethods: any[];
}

export function StudentBookings({
  bookings,
  payDialog,
  setPayDialog,
  paymentMethod,
  setPaymentMethod,
  payForBooking,
  downloadInvoice,
  paymentMethods
}: StudentBookingsProps) {
  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Tutor</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.tutorName}</TableCell>
                  <TableCell>{b.subject}</TableCell>
                  <TableCell>{b.type}</TableCell>
                  <TableCell>{b.schedule}</TableCell>
                  <TableCell>
                    <Badge className={b.status === "Paid" ? "bg-green-600" : ""}>{b.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => downloadInvoice(b)}>Invoice</Button>
                    {b.status !== "Paid" && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setPayDialog({ open: true, bookingId: b.id })}>Pay</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={payDialog.open} onOpenChange={(o) => !o && setPayDialog({ open: false, bookingId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 border rounded-md">
                No saved payment methods. Add one in Profile → Payment Methods.
              </div>
            ) : (
              paymentMethods.map((m) => (
                <Button
                  key={m.id}
                  variant={paymentMethod === (m.type as PaymentMethod) ? "default" : "outline"}
                  className={paymentMethod === (m.type as PaymentMethod) ? "bg-green-600 hover:bg-green-700 justify-start" : "justify-start"}
                  onClick={() => setPaymentMethod(m.type as PaymentMethod)}
                >
                  <CreditCard className="h-4 w-4 mr-2" /> {m.type} •••• {m.account_number.slice(-4)} {m.is_default ? <Badge className="ml-2 bg-green-600">Default</Badge> : null}
                </Button>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialog({ open: false, bookingId: null })}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => payForBooking(payDialog.bookingId as string)} disabled={!paymentMethod}>Pay Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
