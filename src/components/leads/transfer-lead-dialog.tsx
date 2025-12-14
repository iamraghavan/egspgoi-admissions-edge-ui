
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { transferLead } from '@/lib/data';
import type { Lead, User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface TransferLeadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  lead: Lead;
  agents: User[];
  onLeadUpdate: () => void;
}

export function TransferLeadDialog({ isOpen, onOpenChange, lead, agents, onLeadUpdate }: TransferLeadDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  const handleTransferLead = async () => {
    if (!selectedAgent) return;

    setIsSubmitting(true);
    try {
      await transferLead(lead.id, selectedAgent);
      toast({
        title: "Lead Transferred",
        description: `Lead has been successfully transferred.`,
      });
      onLeadUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Transfer Lead",
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Lead</DialogTitle>
          <DialogDescription>
            Assign this lead to another agent.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedAgent} defaultValue={lead.agent_id}>
            <SelectTrigger>
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleTransferLead} disabled={isSubmitting || !selectedAgent}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
