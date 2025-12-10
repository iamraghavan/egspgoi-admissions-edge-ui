import { getLeadsByStatus, getLeadStatuses, getUserById } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

async function KanbanColumn({ status }: { status: string }) {
  const leads = await getLeadsByStatus(status as any);

  return (
    <div className="flex flex-col flex-shrink-0 w-80">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="font-semibold text-lg">{status}</h3>
        <span className="text-sm font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-full">
          {leads.length}
        </span>
      </div>
      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="flex flex-col gap-4 p-3">
          {leads.map(async (lead) => {
            const assignedUser = await getUserById(lead.assignedTo);
            return (
              <Card key={lead.id} className="bg-card shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-base">{lead.name}</p>
                    {assignedUser && (
                        <Avatar className="w-8 h-8">
                          {assignedUser.avatarUrl && <AvatarImage src={assignedUser.avatarUrl} alt={assignedUser.name} />}
                          <AvatarFallback>
                            {assignedUser?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(lead.lastContacted), { addSuffix: true })}
                  </p>
                  <div className="flex justify-start items-center mt-4 gap-2 border-t pt-3">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <a href={`tel:${lead.phone}`} aria-label={`Call ${lead.name}`}>
                        <Phone className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <a href={`mailto:${lead.email}`} aria-label={`Email ${lead.name}`}>
                        <Mail className="w-4 h-4" />
                      </a>
                    </Button>
                     <Button variant="outline" size="icon" className="h-8 w-8">
                      <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${lead.name}`}>
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export default async function KanbanBoard() {
  const statuses = await getLeadStatuses();

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {statuses.map((status) => (
        <KanbanColumn key={status} status={status} />
      ))}
    </div>
  );
}
