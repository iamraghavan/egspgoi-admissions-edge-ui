'use client';

import Nav from './nav';
import { Card, CardContent } from '../ui/card';

export default function AppSidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <Nav />
        <div className="mt-auto p-4">
            <Card>
                <CardContent className="pt-6">
                    <p className="text-sm text-center text-muted-foreground">Sidebar bottom content</p>
                </CardContent>
            </Card>
        </div>
    </aside>
  );
}