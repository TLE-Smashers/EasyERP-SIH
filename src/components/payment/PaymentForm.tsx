/**
 * Payment Form Component
 * Main form for creating payments - used by admission staff
 * Supports both admission and semester fee payments
 */

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, CreditCard, Save, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FeeBreakdownForm } from './FeeBreakdownForm';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import type { PaymentType, PaymentMethod, FeeBreakdown, CreatePaymentParams } from '@/types/payment';
import { convertAmountToWords, calculateTotalAmount } from '@/lib/payment/payment.utils';


// Context-aware validation schema
const paymentFormSchema = z.discriminatedUnion('paymentContext', [
  z.object({
    paymentContext: z.literal('admission'),
    studentName: z.string().min(2, 'Student name is required'),
    fatherName: z.string().min(2, 'Father name is required'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
    rollNumber: z.string().optional(),
    course: z.string().min(1, 'Course is required'),
    branch: z.string().min(1, 'Branch is required'),
    category: z.string().min(1, 'Category is required'),
    paymentType: z.enum(['admission', 'semester', 'exam', 'hostel', 'library', 'other']),
    academicYear: z.string().optional(),
    semester: z.number().min(1).max(8).optional(),
    paymentMethod: z.enum(['razorpay', 'cash', 'bank_transfer', 'cheque']),
    notes: z.string().optional(),
  }),
  z.object({
    paymentContext: z.literal('hostel'),
    studentName: z.string().min(2, 'Student name is required'),
    email: z.string().email('Invalid email address'),
    mobile: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
    category: z.string().min(1, 'Category is required'),
    paymentType: z.literal('hostel'),
    paymentMethod: z.enum(['razorpay', 'cash', 'bank_transfer', 'cheque']),
    notes: z.string().optional(),
    // The following fields are optional for hostel
    fatherName: z.string().optional(),
    rollNumber: z.string().optional(),
    course: z.string().optional(),
    branch: z.string().optional(),
    academicYear: z.string().optional(),
    semester: z.number().optional(),
  })
]);

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  // Mode
  mode?: 'create' | 'view';
  // Pre-filled data
  initialData?: Partial<PaymentFormValues>;
  applicationId?: string;
  studentId?: string;
  defaultFeeBreakdown?: Partial<FeeBreakdown>;
  // Callbacks
  onSubmit: (data: CreatePaymentParams) => Promise<void>;
  onCancel?: () => void;
  // Configuration
  allowedPaymentTypes?: PaymentType[];
  showStudentFields?: boolean;
  createdBy: string;
  paymentContext?: 'admission' | 'hostel';
}

const defaultFeeBreakdownAdmission: FeeBreakdown = {
  tuitionFee: 0,
  amalgamatedFund: 2500,
  sportsFeeUniversityShare: 250,
  cautionMoney: 0,
  transferCertificateFee: 0,
  libraryCardReissueFee: 0,
  penaltyFee: 0,
  otherFees: 0,
  transactionCharges: 0,
};

const defaultFeeBreakdownHostel: FeeBreakdown = {
  roomFee: 2000,
  messFee: 1000,
  otherFees: 0,
  tuitionFee: 0,
  amalgamatedFund: 0,
  sportsFeeUniversityShare: 0,
  cautionMoney: 0,
  transferCertificateFee: 0,
  libraryCardReissueFee: 0,
  penaltyFee: 0,
  transactionCharges: 0,
};

export function PaymentForm({
  mode = 'create',
  initialData,
  applicationId,
  studentId,
  defaultFeeBreakdown: customFeeBreakdown,
  onSubmit,
  onCancel,
  allowedPaymentTypes,
  showStudentFields = true,
  createdBy,
  paymentContext = 'admission',
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [feeBreakdown, setFeeBreakdown] = React.useState<FeeBreakdown>(
    customFeeBreakdown
      ? paymentContext === 'hostel'
        ? { ...defaultFeeBreakdownHostel, ...customFeeBreakdown }
        : { ...defaultFeeBreakdownAdmission, ...customFeeBreakdown }
      : paymentContext === 'hostel'
        ? { ...defaultFeeBreakdownHostel }
        : { ...defaultFeeBreakdownAdmission }
  );
  const [paymentLinkUrl, setPaymentLinkUrl] = React.useState<string>('');

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues:
      paymentContext === 'admission'
        ? {
            paymentContext: 'admission',
            studentName: initialData?.studentName || '',
            fatherName: initialData?.fatherName || '',
            email: initialData?.email || '',
            mobile: initialData?.mobile || '',
            rollNumber: initialData?.rollNumber || '',
            course: initialData?.course || '',
            branch: initialData?.branch || '',
            category: initialData?.category || 'General',
            paymentType: initialData?.paymentType || 'admission',
            academicYear: initialData?.academicYear || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
            semester: initialData?.semester,
            paymentMethod: initialData?.paymentMethod || 'razorpay',
            notes: initialData?.notes || '',
          }
        : {
            paymentContext: 'hostel',
            studentName: initialData?.studentName || '',
            email: initialData?.email || '',
            mobile: initialData?.mobile || '',
            category: initialData?.category || 'General',
            paymentType: 'hostel',
            paymentMethod: initialData?.paymentMethod || 'razorpay',
            notes: initialData?.notes || '',
            // Optional fields for hostel context
            fatherName: '',
            rollNumber: '',
            course: '',
            branch: '',
            academicYear: '',
            semester: undefined,
          },
  });

  const selectedPaymentMethod = form.watch('paymentMethod');
  const selectedPaymentType = form.watch('paymentType');
  const totalAmount = calculateTotalAmount(feeBreakdown);
  const amountInWords = convertAmountToWords(totalAmount);

  const handleSubmit = async (values: PaymentFormValues) => {
    if (totalAmount === 0) {
      form.setError('root', { message: 'Total amount must be greater than zero' });
      return;
    }

    setIsLoading(true);
    try {
      // Always get the latest feeBreakdown from state (including roomFee/messFee for hostel)
      const latestFeeBreakdown = { ...feeBreakdown };

      // For hostel, ensure roomFee and messFee are present and numbers
      if (paymentContext === 'hostel') {
        if (typeof latestFeeBreakdown.roomFee !== 'number') latestFeeBreakdown.roomFee = 0;
        if (typeof latestFeeBreakdown.messFee !== 'number') latestFeeBreakdown.messFee = 0;
      }

      const paymentData: CreatePaymentParams = {
        paymentType: values.paymentType,
        studentInfo: {
          applicationId: applicationId || '',
          studentId: studentId || '',
          studentName: values.studentName,
          fatherName: values.fatherName ?? '',
          email: values.email,
          mobile: values.mobile,
          rollNumber: values.rollNumber ?? '',
          course: values.course ?? '',
          branch: values.branch ?? '',
          category: values.category,
          semester: values.semester,
          academicYear: values.academicYear ?? '',
        },
        feeBreakdown: latestFeeBreakdown,
        paymentMethod: values.paymentMethod,
        academicYear: values.academicYear ?? '',
        semester: values.semester,
        notes: values.notes,
        createdBy,
      };

      await onSubmit(paymentData);
    } catch (error: any) {
      form.setError('root', {
        message: error.message || 'Failed to create payment. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isViewMode = mode === 'view';

  const paymentTypes: PaymentType[] = allowedPaymentTypes || [
    'admission',
    'semester',
    'exam',
    'hostel',
    'library',
    'other',
  ];

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Payment Type & Context */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type *</Label>
            <Select
              value={form.watch('paymentType')}
              onValueChange={(value) => form.setValue('paymentType', value as PaymentType)}
              disabled={isViewMode || isLoading}
            >
              <SelectTrigger id="paymentType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {paymentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} Fee
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.paymentType && (
              <p className="text-sm text-destructive">{form.formState.errors.paymentType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear">Academic Year</Label>
            <Input
              id="academicYear"
              placeholder="2024-25"
              {...form.register('academicYear')}
              disabled={isViewMode || isLoading}
            />
          </div>

          {(selectedPaymentType === 'semester' || selectedPaymentType === 'exam') && (
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                type="number"
                min="1"
                max="8"
                placeholder="1"
                {...form.register('semester')}
                disabled={isViewMode || isLoading}
              />
            </div>
          )}
        </div>
      </div>

      {/* Student Information */}
      {showStudentFields && paymentContext === 'admission' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name *</Label>
              <Input
                id="studentName"
                placeholder="Full Name"
                {...form.register('studentName')}
                disabled={isViewMode || isLoading}
              />
              {form.formState.errors.studentName && (
                <p className="text-sm text-destructive">{form.formState.errors.studentName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatherName">Father's Name *</Label>
              <Input
                id="fatherName"
                placeholder="Father's Full Name"
                {...form.register('fatherName')}
                disabled={isViewMode || isLoading}
              />
              {form.formState.errors.fatherName && (
                <p className="text-sm text-destructive">{form.formState.errors.fatherName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                {...form.register('email')}
                disabled={isViewMode || isLoading}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="9876543210"
                {...form.register('mobile')}
                disabled={isViewMode || isLoading}
              />
              {form.formState.errors.mobile && (
                <p className="text-sm text-destructive">{form.formState.errors.mobile.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                placeholder="Roll No."
                {...form.register('rollNumber')}
                disabled={isViewMode || isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={form.watch('category')}
                onValueChange={(value) => form.setValue('category', value)}
                disabled={isViewMode || isLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="OBC">OBC</SelectItem>
                  <SelectItem value="SC">SC</SelectItem>
                  <SelectItem value="ST">ST</SelectItem>
                  <SelectItem value="EWS">EWS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Input
                id="course"
                placeholder="B E, M Tech, etc."
                {...form.register('course')}
                disabled={isViewMode || isLoading}
              />
              {form.formState.errors.course && (
                <p className="text-sm text-destructive">{form.formState.errors.course.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Branch *</Label>
              <Input
                id="branch"
                placeholder="CSE, IT, ECE, etc."
                {...form.register('branch')}
                disabled={isViewMode || isLoading}
              />
              {form.formState.errors.branch && (
                <p className="text-sm text-destructive">{form.formState.errors.branch.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fee Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fee Breakdown</h3>
        <FeeBreakdownForm
          value={feeBreakdown}
          onChange={setFeeBreakdown}
          disabled={isViewMode || isLoading}
          showTransactionCharges={selectedPaymentMethod === 'razorpay'}
          context={paymentContext}
        />
        {totalAmount > 0 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium">Amount in Words:</p>
            <p className="text-sm text-muted-foreground mt-1">{amountInWords}</p>
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Method</h3>
        <PaymentMethodSelector
          value={form.watch('paymentMethod')}
          onChange={(method) => form.setValue('paymentMethod', method)}
          disabled={isViewMode || isLoading}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes or remarks..."
          rows={3}
          {...form.register('notes')}
          disabled={isViewMode || isLoading}
        />
      </div>

      {/* Error Message */}
      {form.formState.errors.root && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-sm text-destructive font-medium">
            {form.formState.errors.root.message}
          </p>
        </div>
      )}

      {/* Payment Link Display */}
      {paymentLinkUrl && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Payment Link Generated:
          </p>
          <div className="flex items-center gap-2">
            <Input value={paymentLinkUrl} readOnly className="flex-1" />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => window.open(paymentLinkUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isViewMode && (
        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading || totalAmount === 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {selectedPaymentMethod === 'razorpay' ? (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Generate Payment Link
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Payment
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
