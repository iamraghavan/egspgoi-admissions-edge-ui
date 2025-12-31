
'use client';

import { useEffect, useState } from 'react';
import { getLeads } from '@/lib/data';
import type { Lead } from '@/lib/types';
import { Sparkles, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function InfoMarquee() {
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentLeads() {
      try {
        const { leads } = await getLeads();
        const recentLeads = leads.slice(0, 5); // Get the 5 most recent leads
        const newMessages = recentLeads.map(lead => 
          `New lead assigned: ${lead.name} from ${lead.district || 'N/A'} (${formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })})`
        );
        setMessages(newMessages);
      } catch (error) {
        console.error("Failed to fetch recent leads for marquee:", error);
        // You could set a default or error message here
      } finally {
        setLoading(false);
      }
    }
    fetchRecentLeads();
  }, []);

  if (loading || messages.length === 0) {
    return null; // Don't render anything if there's nothing to show or it's loading
  }

  return (
    <div className="bg-primary text-primary-foreground text-sm overflow-hidden whitespace-nowrap relative">
      <div className="animate-marquee flex py-2">
        {messages.map((message, index) => (
          <div key={index} className="flex items-center mx-4">
            <UserPlus className="h-4 w-4 mr-2 shrink-0" />
            <span>{message}</span>
            <Sparkles className="h-4 w-4 ml-4 text-yellow-300" />
          </div>
        ))}
        {/* Duplicate messages to create a seamless loop */}
        {messages.map((message, index) => (
           <div key={`dup-${index}`} className="flex items-center mx-4">
            <UserPlus className="h-4 w-4 mr-2 shrink-0" />
            <span>{message}</span>
            <Sparkles className="h-4 w-4 ml-4 text-yellow-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
