/**
 * Fee Breakdown Form Component
 * Dynamic form for entering all fee categories with real-time calculation
 */

'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import type { FeeBreakdown } from '@/types/payment';
import { calculateTotalAmount } from '@/lib/payment/payment.utils';

interface FeeBreakdownFormProps {
  value: FeeBreakdown;
  onChange: (breakdown: FeeBreakdown) => void;
  disabled?: boolean;
  showTransactionCharges?: boolean;
  context?: 'admission' | 'hostel';
}

const feeCategoriesAll = [
  { key: 'tuitionFee', label: 'Tuition Fee', placeholder: '0' },
  { key: 'amalgamatedFund', label: 'Amalgamated Fund', placeholder: '2500' },
  { key: 'sportsFeeUniversityShare', label: 'Sports Fee University Share', placeholder: '250' },
  { key: 'cautionMoney', label: 'Caution Money', placeholder: '0' },
  { key: 'transferCertificateFee', label: 'Transfer Certificate Fee', placeholder: '0' },
  { key: 'libraryCardReissueFee', label: 'Library Card Reissue Fee', placeholder: '0' },
  { key: 'penaltyFee', label: 'Penalty Fee', placeholder: '0' },
  { key: 'otherFees', label: 'Other Fees', placeholder: '0' },
] as const;

const feeCategoriesHostel = [
  { key: 'roomFee', label: 'Room Fee', placeholder: '0' },
  { key: 'messFee', label: 'Mess / Food Fee', placeholder: '0' },
  { key: 'otherFees', label: 'Other Hostel Fees', placeholder: '0' },
] as const;

export function FeeBreakdownForm({
  value,
  onChange,
  disabled = false,
  showTransactionCharges = true,
  context = 'admission',
}: FeeBreakdownFormProps) {
  const handleChange = (key: keyof FeeBreakdown, inputValue: string) => {
    const numericValue = parseFloat(inputValue) || 0;
    onChange({
      ...value,
      [key]: numericValue,
    });
  };

  const totalAmount = calculateTotalAmount(value);

  // Choose which categories to show
  const feeCategories = context === 'hostel' ? feeCategoriesHostel : feeCategoriesAll;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feeCategories.map((category) => (
          <div key={category.key} className="space-y-2">
            <Label htmlFor={category.key}>
              {category.label}
              <span className="text-xs text-muted-foreground ml-2">(₹)</span>
            </Label>
            <Input
              id={category.key}
              type="number"
              min="0"
              step="0.01"
              placeholder={category.placeholder}
              value={value[category.key] || ''}
              onChange={(e) => handleChange(category.key as keyof FeeBreakdown, e.target.value)}
              disabled={disabled}
              className="text-right"
            />
          </div>
        ))}
      </div>

      {showTransactionCharges && (
        <div className="space-y-2">
          <Label htmlFor="transactionCharges">
            Transaction Charges
            <span className="text-xs text-muted-foreground ml-2">(Gateway fees)</span>
          </Label>
          <Input
            id="transactionCharges"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={value.transactionCharges || ''}
            onChange={(e) => handleChange('transactionCharges', e.target.value)}
            disabled={disabled}
            className="text-right"
          />
        </div>
      )}

      {/* Total Amount Display */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total Amount:</span>
          <span className="text-primary">
            ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 text-right">
          {totalAmount > 0 ? `Including all fees and charges` : 'Enter fee amounts above'}
        </p>
      </div>
    </div>
  );
}
