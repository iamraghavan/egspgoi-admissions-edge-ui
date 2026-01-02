

'use client';
import LeadsDataTable from '@/components/leads/data-table';
import { leadColumns } from '@/components/leads/columns';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';
import type { Lead } from '@/lib/types';
import { getLeads } from '@/lib/data';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchLeads = useCallback(async (cursor: string | null = null) => {
    if (cursor) {
        setIsFetchingMore(true);
    } else {
        setLoading(true);
    }
    const { leads: fetchedLeads, meta, error } = await getLeads(cursor);
    if(error){
        toast({
            variant: "destructive",
            title: "Failed to fetch leads",
            description: error.message || "Could not retrieve lead data from the server.",
        });
    } else {
      setLeads(prev => cursor ? [...prev, ...fetchedLeads] : fetchedLeads);
      setNextCursor(meta?.cursor || null);
    }
    setLoading(false);
    setIsFetchingMore(false);
  }, [toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);


  return (
    <div className="flex flex-col gap-8 h-full">
      <LeadsDataTable
        columns={leadColumns}
        data={leads}
        onLoadMore={() => fetchLeads(nextCursor)}
        canLoadMore={!!nextCursor}
        isFetchingMore={isFetchingMore}
        loading={loading}
        refreshData={fetchLeads}
      />
    </div>
  );
}
