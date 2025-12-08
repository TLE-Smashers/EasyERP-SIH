/**
 * PDF Download Utility - Client Only
 * This module should only run in the browser
 */

export const downloadPDF = async (element: HTMLElement, filename: string) => {
  try {
    // Only import html2pdf on the client side
    if (typeof window === "undefined") {
      console.error("PDF download only works in the browser");
      return;
    }

    const html2pdf = (await import("html2pdf.js")).default;

    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("button").forEach((btn) => btn.remove());

    const opt = {
      margin: 10,
      filename,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait" as const, unit: "mm", format: "a4" },
    };

    html2pdf().set(opt).from(clone).save();
  } catch (error) {
    console.error("PDF download error:", error);
  }
};
