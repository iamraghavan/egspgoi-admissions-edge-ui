
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Lead, Note } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { addLeadNote } from "@/lib/data";

interface LeadNotesProps {
    lead: Lead;
    onNoteAdded: () => void;
}

export function LeadNotes({ lead, onNoteAdded }: LeadNotesProps) {
    const { toast } = useToast();
    const [newNote, setNewNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setIsSubmitting(true);
        try {
            await addLeadNote(lead.id, newNote);
            toast({ title: "Note Added", description: "Your note has been successfully saved." });
            setNewNote('');
            onNoteAdded();
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to Add Note",
                description: error.message || "An unexpected error occurred.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    {lead.notes && lead.notes.length > 0 ? (
                        <ul className="space-y-4">
                        {[...lead.notes].reverse().map((note: Note, index) => (
                            <li key={note.id || index} className="flex gap-3">
                                <MessageSquare className="h-5 w-5 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm">{note.content}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Added by {note.author_name} - {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No notes for this lead yet.</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Textarea
                        placeholder="Add a new note..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleAddNote} disabled={isSubmitting || !newNote.trim()}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Note
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
