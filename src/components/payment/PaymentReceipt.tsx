'use client';

import * as React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Payment } from '@/types/payment';
import { convertAmountToWords } from '@/lib/payment/payment.utils';

interface PaymentReceiptProps {
  payment: Payment;
  onDownload?: () => void;
  onPrint?: () => void;
  onEmail?: () => void;
}

export function PaymentReceipt({
  payment,
  onDownload,
  onPrint,
  onEmail,
}: PaymentReceiptProps) {
  const receiptRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate total amount
  const totalAmount = payment.totalAmount;
  const amountInWords = payment.amountInWords || convertAmountToWords(totalAmount);

  // Fee breakdown items
  const feeItems = [
    { label: 'Tuition Fee', amount: payment.feeBreakdown.tuitionFee },
    { label: 'Amalgamated Fund', amount: payment.feeBreakdown.amalgamatedFund },
    { label: 'Sports Fee (University Share)', amount: payment.feeBreakdown.sportsFeeUniversityShare },
    { label: 'Caution Money', amount: payment.feeBreakdown.cautionMoney },
    { label: 'Transfer Certificate Fee', amount: payment.feeBreakdown.transferCertificateFee },
    { label: 'Library Card Reissue Fee', amount: payment.feeBreakdown.libraryCardReissueFee },
    { label: 'Penalty Fee', amount: payment.feeBreakdown.penaltyFee },
    { label: 'Other Fees', amount: payment.feeBreakdown.otherFees },
    { label: 'Transaction Charges', amount: payment.feeBreakdown.transactionCharges },
  ].filter((item) => item.amount > 0);

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 print:hidden">
        {onEmail && (
          <Button variant="outline" size="sm" onClick={onEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        {onDownload && (
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        )}
      </div>

      {/* Receipt Card */}
      <Card ref={receiptRef} className="p-8 print:shadow-none">
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-bold">EASY ERP</h1>
          <p className="text-sm text-muted-foreground">
            Student Management System
          </p>
          <h2 className="text-lg font-semibold mt-4">PAYMENT RECEIPT</h2>
        </div>

        <Separator className="my-4" />

        {/* Receipt Details Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6 text-sm">
          <div>
            <span className="text-muted-foreground">Receipt No:</span>
            <span className="ml-2 font-medium">{payment.id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span>
            <span className="ml-2 font-medium">
              {formatDate(payment.createdDate)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Reference No:</span>
            <span className="ml-2 font-medium">{payment.referenceNumber}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Application ID:</span>
            <span className="ml-2 font-medium">{payment.studentInfo.applicationId || 'N/A'}</span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Student Details */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Student Details</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2">{payment.studentInfo.studentName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2">{payment.studentInfo.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Mobile:</span>
              <span className="ml-2">{payment.studentInfo.mobile}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Course:</span>
              <span className="ml-2">
                {payment.studentInfo.course} - {payment.studentInfo.branch}
              </span>
            </div>
            {payment.paymentType === 'semester' && (
              <>
                <div>
                  <span className="text-muted-foreground">Year:</span>
                  <span className="ml-2">{payment.academicYear}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Semester:</span>
                  <span className="ml-2">{payment.semester}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Fee Breakdown Table */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Fee Breakdown</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Particulars</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {feeItems.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.label}</td>
                  <td className="text-right">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-3">Total Amount</td>
                <td className="text-right text-lg">
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="mb-6 p-3 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">Amount in Words: </span>
          <span className="font-medium">{amountInWords}</span>
        </div>

        <Separator className="my-4" />

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
          <div>
            <span className="text-muted-foreground">Payment Method:</span>
            <span className="ml-2 font-medium uppercase">
              {payment.paymentMethod}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Payment Status:</span>
            <span className="ml-2 font-medium">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  payment.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : payment.paymentStatus === 'unpaid'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {payment.paymentStatus.toUpperCase()}
              </span>
            </span>
          </div>
          {payment.razorpayPaymentId && (
            <div>
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="ml-2 font-mono text-xs">
                {payment.razorpayPaymentId}
              </span>
            </div>
          )}
          {payment.paymentDate && (
            <div>
              <span className="text-muted-foreground">Paid On:</span>
              <span className="ml-2">{formatDate(payment.paymentDate)}</span>
            </div>
          )}
        </div>

        {/* QR Code and Footer */}
        <div className="flex justify-between items-end mt-8">
          <div className="flex flex-col items-center">
            <QRCodeSVG
              value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://erp.example.com'}/verify-receipt/${payment.id}`}
              size={100}
              level="M"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Scan to verify
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-medium mb-2">Authorized Signatory</p>
            <div className="border-t border-foreground w-40 mt-8"></div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mt-8 p-4 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground font-semibold mb-2">
            NOTIFICATIONS:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>This is a computer-generated receipt and does not require a signature.</li>
            <li>Please preserve this receipt for future reference.</li>
            <li>Fees once paid will not be refunded under any circumstances.</li>
            <li>For any queries, contact the accounts department.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground mt-6">
          Generated on {formatDate(new Date().toISOString())} | Easy ERP v1.0
        </div>
      </Card>
    </div>
  );
}
