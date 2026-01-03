
'use client';
import LeadsDataTable from '@/components/leads/data-table';
import { leadColumns } from '@/components/leads/columns';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';
import type { Lead } from '@/lib/types';
import { getLeads } from '@/lib/data';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const fetchLeads = useCallback(async (
    { cursor, isNewSearch }: { cursor?: string | null; isNewSearch?: boolean } = {}
  ) => {
    if (cursor) {
        setIsFetchingMore(true);
    } else {
        setLoading(true);
    }

    const filters: { cursor?: string; from_date?: string; to_date?: string } = {};
    if (cursor) filters.cursor = cursor;
    if (isNewSearch && dateRange?.from) filters.from_date = format(dateRange.from, 'yyyy-MM-dd');
    if (isNewSearch && dateRange?.to) filters.to_date = format(dateRange.to, 'yyyy-MM-dd');
    

    const { leads: fetchedLeads, meta, error } = await getLeads(filters);
    
    if(error){
        toast({
            variant: "destructive",
            title: "Failed to fetch leads",
            description: error.message || "Could not retrieve lead data from the server.",
        });
    } else {
      setLeads(prev => (cursor && !isNewSearch) ? [...prev, ...fetchedLeads] : fetchedLeads);
      setNextCursor(meta?.cursor || null);
    }
    setLoading(false);
    setIsFetchingMore(false);
  }, [toast, dateRange]);
  
  useEffect(() => {
    fetchLeads({ isNewSearch: true });
  }, [dateRange, fetchLeads]);

  const handleDateRangeChange = (newDateRange?: DateRange) => {
    setDateRange(newDateRange);
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      <LeadsDataTable
        columns={leadColumns}
        data={leads}
        loading={loading}
        onLoadMore={nextCursor ? () => fetchLeads({ cursor: nextCursor }) : undefined}
        canLoadMore={!!nextCursor}
        isFetchingMore={isFetchingMore}
        refreshData={(filters) => fetchLeads({ isNewSearch: true, ...filters })}
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
      />
    </div>
  );
}
