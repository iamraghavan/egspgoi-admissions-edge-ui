
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Edit, Phone, Printer, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Lead, User } from '@/lib/types';
import { EditLeadDialog } from './edit-lead-dialog';
import { TransferLeadDialog } from './transfer-lead-dialog';
import { CallStatusDialog } from '../calls/call-status-dialog';

interface LeadDetailHeaderProps {
  lead: Lead;
  onLeadUpdate: () => void;
  availableAgents: User[];
}

export function LeadDetailHeader({ lead, onLeadUpdate, availableAgents }: LeadDetailHeaderProps) {
  const params = useParams() as { encryptedPortalId: string; role: string; encryptedUserId: string; leadId: string };
  const [isEditOpen, setEditOpen] = useState(false);
  const [isTransferOpen, setTransferOpen] = useState(false);
  const [isCallDialogOpen, setCallDialogOpen] = useState(false);

  const printUrl = `/u/crm/${params.encryptedPortalId}/${params.role}/${params.encryptedUserId}/leads/${params.leadId}/print`;
  const leadsUrl = `/u/crm/${params.encryptedPortalId}/${params.role}/${params.encryptedUserId}/leads`;


  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={leadsUrl}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to leads</span>
          </Link>
        </Button>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{lead.name}</h1>
        <Badge variant="outline" className="capitalize text-sm ml-2">{lead.status}</Badge>
        <div className="ml-auto flex items-center gap-2">
           <Button variant="outline" size="sm" asChild>
             <Link href={printUrl} target="_blank">
                 <Printer className="mr-2 h-4 w-4" />
                 Print
             </Link>
           </Button>
          <Button variant="outline" size="sm" onClick={() => setCallDialogOpen(true)}>
            <Phone className="mr-2 h-4 w-4" />
            Call Lead
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
            <Users className="mr-2 h-4 w-4" />
            Transfer
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <EditLeadDialog
        isOpen={isEditOpen}
        onOpenChange={setEditOpen}
        lead={lead}
        onLeadUpdate={onLeadUpdate}
      />
      <TransferLeadDialog
        isOpen={isTransferOpen}
        onOpenChange={setTransferOpen}
        lead={lead}
        agents={availableAgents}
        onLeadUpdate={onLeadUpdate}
      />
       <CallStatusDialog
        isOpen={isCallDialogOpen}
        onOpenChange={setCallDialogOpen}
        lead={lead}
      />
    </>
  );
}
