'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import { uploadProofOfPayment } from '@/lib/data';
import type { BudgetRequest } from '@/lib/types';
import { formatCurrency } from '@/lib/formatters';

interface ProofOfPaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  budgetRequest: BudgetRequest | null;
  onSuccess: () => void;
}

export function ProofOfPaymentDialog({ isOpen, onOpenChange, budgetRequest, onSuccess }: ProofOfPaymentDialogProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!budgetRequest || !file || !transactionRef) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a transaction reference and select a file.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await uploadProofOfPayment(budgetRequest.id, transactionRef, file);
      toast({ title: 'Proof Uploaded', description: 'Your proof of payment has been successfully uploaded.' });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: error.message });
    } finally {
      setIsSubmitting(false);
      setFile(null);
      setTransactionRef('');
    }
  };

  if (!budgetRequest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Proof of Payment</DialogTitle>
          <DialogDescription>
            Attach the receipt for the approved budget of {formatCurrency(budgetRequest.amount)} for campaign "{budgetRequest.campaign_name}".
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="transaction-ref">Transaction Reference</Label>
            <Input id="transaction-ref" value={transactionRef} onChange={(e) => setTransactionRef(e.target.value)} placeholder="e.g., UTR, Ref No." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proof-file">Proof File (PDF, JPG, PNG)</Label>
            <Input id="proof-file" type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="file:text-foreground" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleUpload} disabled={isSubmitting || !file || !transactionRef}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Upload Proof
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
