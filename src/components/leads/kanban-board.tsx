import { getLeadsByStatus, getLeadStatuses, getUserById } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone } from "lucide-react";
import { Button } from "../ui/button";

async function KanbanColumn({ status }: { status: string }) {
  const leads = await getLeadsByStatus(status as any);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-semibold text-lg font-headline">{status} ({leads.length})</h3>
      <div className="flex flex-col gap-4">
        {leads.map(async (lead) => {
          const assignedUser = await getUserById(lead.assignedTo);
          return (
            <Card key={lead.id} className="bg-card">
              <CardHeader className="p-4">
                <CardTitle className="text-base">{lead.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">{lead.email}</p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      {assignedUser && <AvatarImage src={assignedUser.avatarUrl} alt={assignedUser.name} />}
                      <AvatarFallback>
                        {assignedUser?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{assignedUser?.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <a href={`tel:${lead.phone}`} aria-label={`Call ${lead.name}`}>
                      <Phone className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default async function KanbanBoard() {
  const statuses = await getLeadStatuses();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 items-start">
      {statuses.map((status) => (
        <KanbanColumn key={status} status={status} />
      ))}
    </div>
  );
}
