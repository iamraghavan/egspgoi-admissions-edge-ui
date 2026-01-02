

import { User, Role, Lead, Campaign, Call, LeadStatus, BudgetRequest, LiveCall, PaymentRecord, AdSpend, InventoryResource, Note, PaginatedLeadsResponse } from './types';
import { subDays, subHours } from 'date-fns';
import { getProfile } from './auth';
import { apiClient } from './api-client';

const parseCustomDate = (dateString: string | null | undefined): string => {
    if (!dateString) return new Date().toISOString();
    try {
        // First, try standard ISO parsing
        if (!isNaN(new Date(dateString).getTime())) {
            return new Date(dateString).toISOString();
        }

        // Then, try the custom 'DD/MM/YYYY - hh:mm:ss aa' format
        const [datePart, timePart] = dateString.split(' - ');
        if (!datePart || !timePart) {
             // Fallback for other potential simple date formats without time
             const parsed = new Date(dateString);
             if(!isNaN(parsed.getTime())) return parsed.toISOString();
             throw new Error("Unrecognized date format");
        }

        const [day, month, year] = datePart.split('/');
        const [time, period] = timePart.split(' ');
        let [hours, minutes, seconds] = time.split(':');

        if (period?.toLowerCase() === 'pm' && hours !== '12') {
            hours = (parseInt(hours, 10) + 12).toString();
        }
        if (period?.toLowerCase() === 'am' && hours === '12') {
            hours = '00';
        }
        
        // Use UTC to avoid timezone shifts during conversion
        const isoDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds || '00')));
        if (isNaN(isoDate.getTime())) {
             throw new Error("Could not construct a valid date from parts");
        }
        return isoDate.toISOString();
    } catch (e) {
        console.error("Could not parse date:", dateString, e);
        return new Date().toISOString(); // Fallback to current date on parsing failure
    }
};

type ApiPaginatedResponse = {
    success: boolean;
    data: any[];
    meta: {
        cursor: string | null;
        count: number;
    }
}

export const getLeads = async (cursor: string | null = null): Promise<{ leads: Lead[], meta: { cursor: string | null, count: number } | null, error: any }> => {
    const url = new URL('https://cms-egspgoi.vercel.app/api/v1/leads');
    url.searchParams.append('limit', '20');
    if (cursor) {
        url.searchParams.append('cursor', cursor);
    }
    
    // We use fetch directly here as we are constructing the URL with base
    const { data, error } = await apiClient<ApiPaginatedResponse>(url.pathname + url.search, { method: 'GET' });

    if(error){
        return { leads: [], meta: null, error };
    }
    
    if (data && data.success && Array.isArray(data.data)) {
        const leads = data.data.map((lead: any) => ({
            ...lead,
            agent_id: lead.assigned_to,
            created_at: parseCustomDate(lead.created_at),
            last_contacted_at: parseCustomDate(lead.updated_at || lead.created_at),
            notes: (lead.notes || []).map((note: any) => ({
                ...note,
                author_name: note.author_name || 'Unknown',
                created_at: parseCustomDate(note.created_at),
            })),
        }));
        return { leads, meta: data.meta, error: null };
    }
    
    return { leads: [], meta: null, error: { message: "Unexpected response format." } };
};

export const createLead = async (leadData: { name: string; email: string; phone: string; college: string; course: string; }): Promise<Lead> => {
     const { data, error } = await apiClient<Lead>('/leads', {
        method: 'POST',
        body: JSON.stringify({
            ...leadData,
            admission_year: new Date().getFullYear().toString(),
            source_website: 'internal_dashboard'
        }),
    });
    if(error) throw new Error(error.message);
    return data!;
};

export const updateLead = async (leadId: string, leadData: Partial<Lead>): Promise<Lead> => {
    const leadToUpdate: any = { ...leadData };
    
    if (leadToUpdate.agent_id) {
        leadToUpdate.assigned_to = leadToUpdate.agent_id;
        delete leadToUpdate.agent_id;
    }
    
    const { data, error } = await apiClient<Lead>(`/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify(leadToUpdate),
    });

    if(error) throw new Error(error.message);
    return data!;
}

export const uploadLeads = async (file: File): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data, error } = await apiClient<{ message: string }>('/leads/bulk/upload', {
    method: 'POST',
    body: formData,
  });

  if(error) throw new Error(error.message);
  return data!;
};

export const addLeadNote = async (leadId: string, content: string): Promise<Note> => {
    const { data, error } = await apiClient<Note>(`/leads/${leadId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });

    if(error) throw new Error(error.message);
    const newNote = data!;
    const currentUser = getProfile();
    return {
        ...newNote,
        author_name: newNote.author_name || currentUser?.name || 'Unknown',
        created_at: parseCustomDate(newNote.created_at)
    };
};

export const updateLeadStatus = async (leadId: string, status: LeadStatus): Promise<void> => {
     const { error } = await apiClient(`/leads/${leadId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: status }),
    });
    if(error) throw new Error(error.message);
};

export const initiateCall = async (leadId: string): Promise<any> => {
    const profile = getProfile();
    const agentNumber = profile?.phone || "918064522110";

    const { data, error } = await apiClient(`/leads/${leadId}/call`, {
        method: 'POST',
        body: JSON.stringify({ agent_number: agentNumber }),
    });

    if(error) throw new Error(error.message);
    return data;
};

export const transferLead = async (leadId: string, newAgentId: string): Promise<any> => {
    const { data, error } = await apiClient(`/leads/${leadId}/transfer`, {
        method: 'POST',
        body: JSON.stringify({ new_agent_id: newAgentId }),
    });
    if(error) throw new Error(error.message);
    return data;
};

export const deleteLead = async (leadId: string): Promise<void> => {
    const { error } = await apiClient(`/leads/${leadId}`, {
        method: 'DELETE',
    });
    if(error) throw new Error(error.message);
};


export const getLeadById = async (id: string): Promise<{data: Lead | null, error: any}> => {
    const { data, error } = await apiClient<{ success: boolean, data: any }>(`/leads/${id}`, { method: 'GET' });
    if(error) return { data: null, error };
    if (data && data.success && data.data) {
        const lead = data.data;
        return {
            data: {
                ...lead,
                agent_id: lead.assigned_to,
                created_at: parseCustomDate(lead.created_at),
                last_contacted_at: parseCustomDate(lead.updated_at || lead.created_at),
                notes: (lead.notes || []).map((note: any) => ({
                    ...note,
                    author_name: note.author_name || 'Unknown',
                    created_at: parseCustomDate(note.created_at),
                })),
            },
            error: null,
        };
    }
    return { data: null, error: { message: "Lead not found or unexpected format" }};
};
export const getLeadStatuses = async (): Promise<LeadStatus[]> => Promise.resolve(["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"]);

export const getCampaigns = async (): Promise<Campaign[]> => {
    const { data, error } = await apiClient<{ success: boolean; data: any[] }>('/campaigns');
    if(error) throw new Error(error.message);
    return data!.data.map((c: any) => ({
        ...c,
        startDate: c.start_date,
        endDate: c.end_date,
        budget: c.settings?.budget_daily || 0,
    })) as Campaign[];
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
    const { data, error } = await apiClient<any>(`/campaigns/${id}`);
    if(error) throw new Error(error.message);
    const campaign = data.data;
    return { 
        ...campaign,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        budget: campaign.settings?.budget_daily || 0,
    };
};

export const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'status'>): Promise<Campaign> => {
     const { data, error } = await apiClient<any>('/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
    });
    if(error) throw new Error(error.message);
    const campaign = data.data;
    return {
        ...campaign,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        budget: campaign.settings?.budget_daily || 0,
    }
};

export const getCalls = async (): Promise<Call[]> => {
    // Mock data for now
    const calls: Call[] = [
        { id: 'call-1', leadId: 'lead-2', agentId: 'user-2', duration: 320, timestamp: subHours(new Date(), 26).toISOString(), recordingUrl: '#' },
        { id: 'call-2', leadId: 'lead-3', agentId: 'user-2', duration: 450, timestamp: subHours(new Date(), 49).toISOString(), recordingUrl: '#' },
    ];
    return Promise.resolve(calls);
}

export const getLiveCalls = async (): Promise<LiveCall[]> => {
    const liveCalls: LiveCall[] = [
        { callId: 'live-1', leadName: 'John Doe', agentName: 'Michael Smith', startTime: Date.now() - 1000 * 45 },
        { callId: 'live-2', leadName: 'Jane Smith', agentName: 'Sarah Johnson', startTime: Date.now() - 1000 * 123 },
    ];
    return Promise.resolve(liveCalls);
}

export const getBudgetRequests = async (): Promise<BudgetRequest[]> => {
     const budgetRequests: BudgetRequest[] = [
        { id: 'br-1', campaignId: 'camp-1', amount: 10000, status: 'Approved', submittedBy: 'user-3', decisionBy: 'user-4', submittedAt: subDays(new Date(), 10).toISOString(), decisionAt: subDays(new Date(), 9).toISOString() },
        { id: 'br-2', campaignId: 'camp-2', amount: 20000, status: 'Pending', submittedBy: 'user-3', submittedAt: subDays(new Date(), 2).toISOString() },
    ];
    return Promise.resolve(budgetRequests);
}

export const getPaymentRecords = async (): Promise<PaymentRecord[]> => {
    const paymentRecords: PaymentRecord[] = [
        { id: 'pay-1', leadId: 'lead-5', amount: 1500, date: subDays(new Date(), 5).toISOString(), method: 'Credit Card', status: 'Completed' },
        { id: 'pay-2', leadId: 'lead-3', amount: 250, date: subDays(new Date(), 3).toISOString(), method: 'Bank Transfer', status: 'Completed' },
    ];
    return Promise.resolve(paymentRecords);
}

export const getAdSpends = async (): Promise<AdSpend[]> => {
     const adSpends: AdSpend[] = [
        { id: 'ad-1', campaignId: 'camp-1', platform: 'Google', amount: 500, date: subDays(new Date(), 1).toISOString() },
        { id: 'ad-2', campaignId: 'camp-1', platform: 'Facebook', amount: 350, date: subDays(new Date(), 1).toISOString() },
    ];
    return Promise.resolve(adSpends);
}

export const getUserById = async (id: string): Promise<User | null> => {
    const { data, error } = await apiClient<{data: User}>(`/users/${id}`);
    if (error) {
        console.error(`Failed to fetch user ${id}:`, error.message);
        return null;
    }
    return data?.data || null;
};

export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await apiClient<{ data: User[] }>('/users');
    if (error) {
        console.error("Failed to fetch users:", error.message);
        return [];
    }
    return data?.data || [];
}

export const getCurrentUserRole = async (): Promise<Role> => Promise.resolve('Admission Manager');

export const getDashboardStats = async () => {
    // This would in reality be a single API call
  const { leads } = await getLeads();
  const campaigns = await getCampaigns();
  const newLeadsCount = leads.filter(l => new Date(l.last_contacted_at) > subDays(new Date(), 7)).length;
  return {
    newLeads: newLeadsCount,
    activeCampaigns: campaigns.filter(c => c.status === 'Active').length,
    callsToday: 12, // mock
    conversionRate: Math.floor(Math.random() * 5 + 18),
  };
};

export const getLeadsOverTime = async () => {
    const data = [
        { date: "Jan", leads: Math.floor(Math.random() * 20 + 80) },
        { date: "Feb", leads: Math.floor(Math.random() * 20 + 90) },
        { date: "Mar", leads: Math.floor(Math.random() * 20 + 100) },
        { date: "Apr", leads: Math.floor(Math.random() * 20 + 110) },
        { date: "May", leads: Math.floor(Math.random() * 20 + 100) },
        { date: "Jun", leads: Math.floor(Math.random() * 20 + 120) },
    ];
    return Promise.resolve(data);
}

export const getInventoryResources = async (): Promise<InventoryResource[]> => {
    const inventoryResources: InventoryResource[] = [
        { name: 'Elastic Compute Cloud (EC2)', count: 9 },
        { name: 'Relational Database Service (RDS)', count: 3 },
    ];
    return Promise.resolve(inventoryResources);
}

export async function globalSearch(query: string): Promise<any[]> {
    if (query.trim().length < 3) {
        return [];
    }
    const { data, error } = await apiClient<any>(`/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
    });

    if (error) {
        // The error is already handled by apiClient, but we can log it or re-throw
        console.error("Search failed:", error.message);
        throw new Error(error.message);
    }
    
    const results = data.data;
    const flattenedResults = [];
    if (results.leads && Array.isArray(results.leads)) {
        flattenedResults.push(...results.leads.map((item: any) => ({ ...item, type: 'lead', url: `/u/crm/:encryptedPortalId/:role/:encryptedUserId/leads/${item.id}` })));
    }
    if (results.campaigns && Array.isArray(results.campaigns)) {
        flattenedResults.push(...results.campaigns.map((item: any) => ({ ...item, type: 'campaign', url: `/u/crm/:encryptedPortalId/:role/:encryptedUserId/campaigns/${item.id}` })));
    }
    if (results.users && Array.isArray(results.users)) {
        flattenedResults.push(...results.users.map((item: any) => ({ ...item, type: 'user', url: `/u/crm/:encryptedPortalId/:role/:encryptedUserId/users/${item.id}` })));
    }

    if (flattenedResults.length === 0 && (results.leads?.length === 0 && results.campaigns?.length === 0 && results.users?.length === 0)) {
        return [];
    }

    return flattenedResults;
}


// Smartflo API integrations
export const hangupCall = async (callId: string): Promise<any> => {
    const { data, error } = await apiClient(`/smartflo/call/hangup`, {
        method: 'POST',
        body: JSON.stringify({ call_id: callId }),
    });
    if(error) throw new Error(error.message);
    return data;
};

export const dialNumber = async (numberToDial: string): Promise<any> => {
    const profile = getProfile();
    const agentNumber = profile?.phone || "918064522110";

    const { data, error } = await apiClient(`/smartflo/call/dial`, {
        method: 'POST',
        body: JSON.stringify({ agent_number: agentNumber, customer_number: numberToDial }),
    });
    if(error) throw new Error(error.message);
    return data;
}

type GetCallRecordsParams = {
  from_date?: string;
  to_date?: string;
  call_direction?: 'inbound' | 'outbound' | 'all';
  agent_name?: string;
  page?: number;
};

export const getCallRecords = async (params: GetCallRecordsParams): Promise<any> => {
    const url = new URL('https://cms-egspgoi.vercel.app/api/v1/smartflo/call/records');
    Object.entries(params).forEach(([key, value]) => {
        if (value && (key !== 'call_direction' || (key === 'call_direction' && value !== 'all'))) {
            url.searchParams.append(key, value.toString());
        }
    });
    
    const { data, error } = await apiClient(url.pathname + url.search, {
        method: 'GET',
    });
    if(error) throw new Error(error.message);
    return data;
};
