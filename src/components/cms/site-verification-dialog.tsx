
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import type { Site } from '@/lib/types';
import { verifySite } from '@/lib/data';

interface SiteVerificationDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    site: Site | null;
    onVerificationSuccess: () => void;
}

export function SiteVerificationDialog({ isOpen, onOpenChange, site, onVerificationSuccess }: SiteVerificationDialogProps) {
    const { toast } = useToast();
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState<string | null>(null);

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    };

    const handleVerify = async () => {
        if (!site) return;
        setIsVerifying(true);
        setVerificationError(null);
        try {
            const result = await verifySite(site.id);
            toast({ title: 'Verification Successful!', description: result.message || `Domain ${site.domain} has been verified.` });
            onVerificationSuccess();
            onOpenChange(false);
        } catch (error: any) {
            setVerificationError(error.message || 'An unknown error occurred.');
            toast({
                variant: 'destructive',
                title: 'Verification Failed',
                description: 'Please double-check your DNS records and try again in a few minutes.'
            });
        } finally {
            setIsVerifying(false);
        }
    };
    
    if (!site) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Verify Domain Ownership</DialogTitle>
                    <DialogDescription>
                        To finish setting up <strong>{site.domain}</strong>, you need to add a TXT record to your DNS provider.
                    </DialogDescription>
                </DialogHeader>
                
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        DNS changes can take up to 24 hours to propagate, but it's usually much faster.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4 py-4">
                    <div className="space-y-1">
                        <Label>Type</Label>
                        <Input readOnly value="TXT" />
                    </div>
                    <div className="space-y-1">
                        <Label>Host / Name</Label>
                        <Input readOnly value="@" />
                    </div>
                    <div className="space-y-1">
                        <Label>Value / Content</Label>
                        <div className="relative">
                             <Input readOnly value={site.verification_token || 'Token not available'} />
                             <Button 
                                type="button" 
                                size="icon" 
                                variant="ghost" 
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                onClick={() => handleCopyToClipboard(site.verification_token || '')}
                                disabled={!site.verification_token}
                            >
                                <Copy className="h-4 w-4" />
                             </Button>
                        </div>
                    </div>
                </div>

                {verificationError && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{verificationError}</AlertDescription>
                    </Alert>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button onClick={handleVerify} disabled={isVerifying}>
                        {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
