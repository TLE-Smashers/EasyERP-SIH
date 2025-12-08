/**
 * Format date string safely for SSR/Client consistency
 * Prevents hydration mismatch by using a consistent format
 */
export function formatDate(dateString: string | undefined, format: "short" | "long" = "short"): string {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);

        if (format === "long") {
            // Format: January 15, 2025
            const month = date.toLocaleString('en-US', { month: 'long' });
            const day = date.getDate();
            const year = date.getFullYear();
            return `${month} ${day}, ${year}`;
        } else {
            // Format: Jan 15, 2025
            const month = date.toLocaleString('en-US', { month: 'short' });
            const day = date.getDate();
            const year = date.getFullYear();
            return `${month} ${day}, ${year}`;
        }
    } catch {
        return dateString;
    }
}

/**
 * Format date for display (short month format)
 */
export function formatDateShort(dateString: string | undefined): string {
    if (!dateString) return "N/A";

    try {
        const date = new Date(dateString);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    } catch {
        return dateString;
    }
}
