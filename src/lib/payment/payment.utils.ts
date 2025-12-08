/**
 * Payment Utilities
 * Client-safe utility functions for payment calculations
 * These functions don't depend on Node.js modules
 */

/**
 * Calculate total amount from fee breakdown
 */
export function calculateTotalAmount(feeBreakdown: any): number {
  // If hostel fields are present (even if 0), only sum hostel fields
  const hasHostelFields = Object.prototype.hasOwnProperty.call(feeBreakdown, 'roomFee') ||
    Object.prototype.hasOwnProperty.call(feeBreakdown, 'messFee');
  if (hasHostelFields) {
    return (
      (feeBreakdown.roomFee || 0) +
      (feeBreakdown.messFee || 0) +
      (feeBreakdown.otherFees || 0) +
      (feeBreakdown.transactionCharges || 0)
    );
  }
  // Otherwise, sum all standard fields (admission/other)
  return (
    (feeBreakdown.tuitionFee || 0) +
    (feeBreakdown.amalgamatedFund || 0) +
    (feeBreakdown.sportsFeeUniversityShare || 0) +
    (feeBreakdown.cautionMoney || 0) +
    (feeBreakdown.transferCertificateFee || 0) +
    (feeBreakdown.libraryCardReissueFee || 0) +
    (feeBreakdown.penaltyFee || 0) +
    (feeBreakdown.otherFees || 0) +
    (feeBreakdown.transactionCharges || 0)
  );
}

/**
 * Convert amount to words in Indian numbering system
 * Handles Lakhs and Crores
 */
export function convertAmountToWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  ];
  const teens = [
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
    'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety',
  ];

  function convertTwoDigit(num: number): string {
    if (num === 0) return '';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
  }

  function convertThreeDigit(num: number): string {
    if (num === 0) return '';
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    let result = '';
    if (hundred > 0) {
      result += ones[hundred] + ' Hundred';
    }
    if (remainder > 0) {
      if (result) result += ' ';
      result += convertTwoDigit(remainder);
    }
    return result;
  }

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  // Split into Indian number system: Crores, Lakhs, Thousands, Hundreds
  const crore = Math.floor(integerPart / 10000000);
  const lakh = Math.floor((integerPart % 10000000) / 100000);
  const thousand = Math.floor((integerPart % 100000) / 1000);
  const hundred = integerPart % 1000;

  let words = '';

  if (crore > 0) {
    words += convertTwoDigit(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertTwoDigit(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertTwoDigit(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += convertThreeDigit(hundred);
  }

  words = words.trim();

  if (!words) return 'Zero Rupees Only';

  let result = 'Rupees ' + words;

  if (decimalPart > 0) {
    result += ' and ' + convertTwoDigit(decimalPart) + ' Paise';
  }

  result += ' Only';

  return result;
}

/**
 * Calculate transaction charges based on payment method
 * Razorpay: ~2.36% (2% + 18% GST)
 */
export function calculateTransactionCharges(
  amount: number,
  paymentMethod: 'razorpay' | 'cash' | 'bank_transfer' | 'cheque'
): number {
  if (paymentMethod === 'razorpay') {
    return Math.round(amount * 0.0236); // 2% + 18% GST
  }
  return 0;
}

/**
 * Get default admission fee structure
 * Can be customized based on course/branch
 */
export function getDefaultAdmissionFeeBreakdown(course: string, branch: string): {
  tuitionFee: number;
  amalgamatedFund: number;
  sportsFeeUniversityShare: number;
  cautionMoney: number;
  transferCertificateFee: number;
  libraryCardReissueFee: number;
  penaltyFee: number;
  otherFees: number;
  transactionCharges: number;
} {
  // This can be made dynamic based on course/branch
  // For now, returning a default structure
  return {
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
}

/**
 * Get default semester fee structure
 * Can be customized based on course/branch/semester
 */
export function getDefaultSemesterFeeBreakdown(
  course: string,
  branch: string,
  semester: number
): {
  tuitionFee: number;
  amalgamatedFund: number;
  sportsFeeUniversityShare: number;
  cautionMoney: number;
  transferCertificateFee: number;
  libraryCardReissueFee: number;
  penaltyFee: number;
  otherFees: number;
  transactionCharges: number;
} {
  // This can be made dynamic based on course/branch/semester
  // For now, returning a default structure
  return {
    tuitionFee: 50000,
    amalgamatedFund: 1000,
    sportsFeeUniversityShare: 500,
    cautionMoney: 0,
    transferCertificateFee: 0,
    libraryCardReissueFee: 0,
    penaltyFee: 0,
    otherFees: 0,
    transactionCharges: 0,
  };
}
