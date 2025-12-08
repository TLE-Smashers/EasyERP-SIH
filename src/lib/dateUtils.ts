/**
 * Date utility functions for Google Forms date parsing
 */

/**
 * Parse Google Forms date format: "16/11/2025 23:16:50" (DD/MM/YYYY HH:MM:SS)
 * Also handles standard date formats
 */
export function parseGoogleFormsDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  try {
    // Check if it's already in ISO format or standard format
    const directParse = new Date(dateStr);
    if (!isNaN(directParse.getTime())) {
      return directParse;
    }
    
    // Parse DD/MM/YYYY HH:MM:SS format (Google Forms format)
    const [datePart, timePart] = dateStr.split(' ');
    const [day, month, year] = datePart.split('/').map(Number);
    
    if (timePart) {
      const [hours, minutes, seconds] = timePart.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes, seconds);
    }
    
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return new Date();
  }
}

/**
 * Format date for display in a consistent format (DD/MM/YYYY)
 * This prevents hydration errors by avoiding locale-dependent formatting
 */
export function formatDateForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseGoogleFormsDate(date) : date;
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format date with time for display (DD/MM/YYYY HH:MM)
 */
export function formatDateTimeForDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseGoogleFormsDate(date) : date;
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
