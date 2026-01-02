

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/types";

interface LeadAssignedAgentProps {
    user?: User | null;
}

export function LeadAssignedAgent({ user }: LeadAssignedAgentProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Assigned Agent</CardTitle>
            </CardHeader>
            <CardContent>
                {user ? (
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">Unassigned</p>
                )}
            </CardContent>
        </Card>
    );
}
