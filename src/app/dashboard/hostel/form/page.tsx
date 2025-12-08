"use client";

import React, { useRef, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";


export default function HostelFormPage() {
    const [formUrl, setFormUrl] = useState("");
    const [showQR, setShowQR] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const qrRef = useRef<SVGSVGElement | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch stored QR link on mount
    useEffect(() => {
        async function fetchQrLink() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/hostel-form-link");
                const data = await res.json();
                if (data.qrLink) {
                    setFormUrl(data.qrLink);
                    setShowQR(true);
                }
            } catch (err) {
                setError("Failed to fetch QR link");
            } finally {
                setLoading(false);
            }
        }
        fetchQrLink();
    }, []);

    // Save QR link to API
    const saveQrLink = async (link: string) => {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/hostel-form-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrLink: link }),
            });
            if (!res.ok) throw new Error("Failed to save QR link");
        } catch (err) {
            setError("Failed to save QR link");
        } finally {
            setSaving(false);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formUrl) return;
        setShowQR(true); // Show QR immediately
        saveQrLink(formUrl); // Save in background, don't await
    };

    const handlePrint = () => {
        if (!qrRef.current) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print QR Code</title></head><body style="display:flex;justify-content:center;align-items:center;height:100vh;">');
            printWindow.document.write(qrRef.current.outerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Hostel Application Google Form QR</CardTitle>
                    <CardDescription>
                        Paste your Google Form link below to generate a QR code for students to scan and apply for hostel. You can print the QR code for display.
                    </CardDescription>
                </CardHeader>
                {error && (
                    <div className="text-red-600 text-sm px-4 pt-2">{error}</div>
                )}
                <form onSubmit={handleGenerate} autoComplete="off">
                    <CardContent className="flex flex-col gap-4">
                        <Label htmlFor="form-link">Google Form Link</Label>
                        <Input
                            id="form-link"
                            type="url"
                            placeholder="https://docs.google.com/forms/..."
                            value={formUrl}
                            onChange={e => setFormUrl(e.target.value)}
                            required
                            autoFocus
                            disabled={loading || saving}
                        />
                        <Button type="submit" className="w-full" disabled={loading || saving}>
                            {saving ? "Saving..." : "Generate QR"}
                        </Button>
                    </CardContent>
                </form>
                {loading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading QR link...</div>
                ) : showQR && (
                    <CardFooter className="flex flex-col items-center gap-2">
                        <QRCodeSVG value={formUrl} size={180} ref={qrRef} />
                        <Button variant="outline" onClick={handlePrint} className="mt-2 w-full">Print QR Code</Button>
                        <a href={formUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline mt-1">Open Google Form</a>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
