/**
 * Payment Method Selector Component
 * Allows selection between Razorpay, Cash, Bank Transfer, Cheque
 */

'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Wallet, Building2, FileText } from 'lucide-react';
import type { PaymentMethod } from '@/types/payment';

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
  showOnlineOnly?: boolean;
}

const paymentMethods = [
  {
    value: 'razorpay' as PaymentMethod,
    label: 'Online Payment (Razorpay)',
    description: 'UPI, Cards, Net Banking',
    icon: CreditCard,
    color: 'text-blue-600',
  },
  {
    value: 'cash' as PaymentMethod,
    label: 'Cash',
    description: 'Direct cash payment',
    icon: Wallet,
    color: 'text-green-600',
  },
  {
    value: 'bank_transfer' as PaymentMethod,
    label: 'Bank Transfer',
    description: 'NEFT, RTGS, IMPS',
    icon: Building2,
    color: 'text-purple-600',
  },
  {
    value: 'cheque' as PaymentMethod,
    label: 'Cheque',
    description: 'Bank cheque payment',
    icon: FileText,
    color: 'text-orange-600',
  },
];

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
  showOnlineOnly = false,
}: PaymentMethodSelectorProps) {
  const availableMethods = showOnlineOnly
    ? paymentMethods.filter((m) => m.value === 'razorpay')
    : paymentMethods;

  return (
    <div className="space-y-3">
      <Label>Payment Method</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as PaymentMethod)}
        disabled={disabled}
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {availableMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = value === method.value;

          return (
            <Label
              key={method.value}
              htmlFor={method.value}
              className={`
                flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <RadioGroupItem value={method.value} id={method.value} className="mt-0" />
              <div className="flex items-start space-x-3 flex-1">
                <Icon className={`w-5 h-5 mt-0.5 ${method.color}`} />
                <div className="flex-1">
                  <p className="font-medium text-sm">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
              </div>
            </Label>
          );
        })}
      </RadioGroup>

      {value === 'razorpay' && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3 mt-3">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Note:</strong> A payment link will be generated. Transaction charges may apply (~2% + GST).
          </p>
        </div>
      )}

      {(value === 'cash' || value === 'bank_transfer' || value === 'cheque') && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3 mt-3">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Note:</strong> You'll need to enter transaction details after payment is received.
          </p>
        </div>
      )}
    </div>
  );
}
