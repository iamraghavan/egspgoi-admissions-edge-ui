
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getLeadById, getUserById } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download, Loader2 } from "lucide-react";
import type { Lead, User } from "@/lib/types";
import { format } from "date-fns";
import { useToast } from '@/hooks/use-toast';
import { logout } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PrintDetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div>
        <p className="text-xs text-gray-500 uppercase font-medium">{label}</p>
        <div className="text-sm text-gray-800">{value || 'N/A'}</div>
    </div>
);

export default function LeadPrintPage() {
    const params = useParams() as { leadId: string };
    const router = useRouter();
    const { toast } = useToast();
    
    const [lead, setLead] = useState<Lead | null>(null);
    const [assignedUser, setAssignedUser] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);


    const handleLogout = useCallback(() => {
        logout();
        router.push('/');
    }, [router]);

    useEffect(() => {
        const fetchLeadDetails = async () => {
            if (!params.leadId) return;

            try {
                setLoading(true);
                const { data: fetchedLead, error } = await getLeadById(params.leadId);
                
                if (error) {
                    throw new Error(error.message);
                }
                
                if (fetchedLead) {
                    setLead(fetchedLead);
                    if (fetchedLead.agent_id && fetchedLead.assigned_user) {
                        setAssignedUser(fetchedLead.assigned_user);
                    }
                } else {
                    toast({ variant: "destructive", title: "Lead not found" });
                }
            } catch (error: any) {
                console.error("Failed to fetch lead details", error);
                if (error.message.includes('Authentication token') || error.message.includes('Invalid or expired token')) {
                    toast({
                        variant: "destructive",
                        title: "Session Expired",
                        description: "Your session has expired. Please log in again.",
                    });
                    handleLogout();
                } else {
                    toast({
                        variant: "destructive",
                        title: "Failed to fetch lead",
                        description: error.message || "An unexpected error occurred.",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLeadDetails();
    }, [params.leadId, toast, handleLogout]);
    
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        if (!printRef.current || !lead) return;
        setIsDownloading(true);
        
        try {
            const canvas = await html2canvas(printRef.current, {
                scale: 2, // Increase resolution
                useCORS: true, 
            });
            const imgData = canvas.toDataURL('image/png');
            
            // A4 landscape dimensions in mm: 297 x 210
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const canvasAspectRatio = canvasWidth / canvasHeight;
            
            let finalPdfWidth = pdfWidth;
            let finalPdfHeight = pdfWidth / canvasAspectRatio;

            if (finalPdfHeight > pdfHeight) {
                finalPdfHeight = pdfHeight;
                finalPdfWidth = pdfHeight * canvasAspectRatio;
            }

            const x = (pdfWidth - finalPdfWidth) / 2;
            const y = (pdfHeight - finalPdfHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, finalPdfWidth, finalPdfHeight);
            pdf.save(`lead-summary-${lead.lead_reference_id}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({
                variant: 'destructive',
                title: 'PDF Download Failed',
                description: 'Could not generate PDF. Please try again.'
            });
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen p-8">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <Skeleton className="h-10 w-48 mb-8" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        );
    }
    
    if (!lead) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <p className="text-xl">Lead not found or could not be loaded.</p>
                    <Button onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 print:bg-white">
            <style jsx global>{`
                @page {
                    size: A4 landscape;
                    margin: 1cm;
                }
                @media print {
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  .no-print {
                    display: none !important;
                  }
                  .printable-area {
                    display: block !important;
                    width: 100%;
                    height: auto;
                    box-shadow: none !important;
                    border: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                }
            `}</style>
            
            <div className="max-w-6xl mx-auto p-4 md:p-8 no-print">
                 <div className="flex justify-between items-center mb-8">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Lead Details
                    </Button>
                    <div className='flex items-center gap-2'>
                        <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                            {isDownloading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Downloading...</>
                            ) : (
                                <><Download className="mr-2 h-4 w-4" />Download PDF</>
                            )}
                        </Button>
                        <Button onClick={handlePrint} variant="outline">
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                    </div>
                </div>
            </div>
            
            <div ref={printRef} className="printable-area bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-6xl mx-auto">
                <header className="flex justify-between items-start pb-8 border-b">
                    <div>
                        <Image src="https://egspgoi-admission.vercel.app/_next/static/media/egspgoi_svg.414b207b.svg" alt="College Logo" width={64} height={64} className="h-16 w-auto" />
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-bold text-gray-800">Lead Summary</h1>
                        <p className="text-sm text-gray-500 mt-1">Lead ID: {lead.lead_reference_id}</p>
                        <p className="text-sm text-gray-500">Generated on: {format(new Date(), 'PPpp')}</p>
                    </div>
                </header>

                <main className="mt-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Lead Information</h2>
                            <div className="space-y-4">
                                <PrintDetailItem label="Name" value={lead.name} />
                                <PrintDetailItem label="Email" value={lead.email} />
                                <PrintDetailItem label="Phone" value={lead.phone} />
                                <PrintDetailItem label="Location" value={`${lead.district}, ${lead.state}`} />
                                <PrintDetailItem label="Status" value={<Badge variant="outline" className="capitalize">{lead.status}</Badge>} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Course Interest & Source</h2>
                            <div className="space-y-4">
                                <PrintDetailItem label="College" value={lead.college} />
                                <PrintDetailItem label="Course" value={lead.course} />
                                <PrintDetailItem label="Admission Year" value={lead.admission_year} />
                                <PrintDetailItem label="Source Website" value={lead.source_website} />
                                <PrintDetailItem label="Date Created" value={format(new Date(lead.created_at), 'PPpp')} />
                            </div>
                        </div>
                    </div>

                     {assignedUser && (
                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">Assigned Agent</h2>
                             <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                                <Avatar>
                                    <AvatarImage src={assignedUser.avatarUrl} />
                                    <AvatarFallback>{assignedUser.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium leading-none text-gray-800">{assignedUser.name}</p>
                                    <p className="text-sm text-gray-500">{assignedUser.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Notes History</h2>
                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                            {lead.notes && lead.notes.length > 0 ? (
                                <div className="space-y-4 p-4">
                                    {[...lead.notes].reverse().map((note, index) => (
                                        <div key={note.id || index} className="p-3 bg-gray-50 rounded-md break-inside-avoid">
                                            <p className="text-sm text-gray-800">{note.content}</p>
                                            <p className="text-xs text-gray-500 mt-2 text-right">
                                                - {note.author_name}, {format(new Date(note.created_at), 'PPpp')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-center text-gray-500 py-8">No notes available for this lead.</p>
                            )}
                        </div>
                    </div>
                </main>

                <footer className="mt-12 pt-8 border-t space-y-4">
                    <p className="text-xs text-gray-500 text-center">
                        This is a computer-generated document and does not require a physical signature. E.G.S. Pillay Group of Institutions.
                    </p>
                </footer>
            </div>
        </div>
    );
}
