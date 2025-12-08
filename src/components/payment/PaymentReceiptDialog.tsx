'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentReceipt } from './PaymentReceipt';
import { toast } from 'sonner';
import type { Payment } from '@/types/payment';

interface PaymentReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
}

export function PaymentReceiptDialog({
  open,
  onOpenChange,
  payment,
}: PaymentReceiptDialogProps) {
  const handleDownload = async () => {
    try {
      // TODO: Implement PDF generation using react-pdf or jsPDF
      toast.info('PDF download will be implemented soon');
    } catch (error) {
      toast.error('Failed to download receipt');
    }
  };

  const handleEmail = async () => {
    try {
      // TODO: Implement email sending
      toast.info('Email sending will be implemented soon');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Receipt</DialogTitle>
        </DialogHeader>
        <PaymentReceipt
          payment={payment}
          onDownload={handleDownload}
          onEmail={handleEmail}
        />
      </DialogContent>
    </Dialog>
  );
}
