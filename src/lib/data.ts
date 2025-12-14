

import { User, Role, Lead, Campaign, Call, LeadStatus, BudgetRequest, LiveCall, PaymentRecord, AdSpend, InventoryResource, Note, PaginatedLeadsResponse } from './types';
import placeholderImages from './placeholder-images.json';
import { subDays, subHours } from 'date-fns';
import { getAuthHeaders, logout, getProfile } from './auth';

const API_BASE_URL = "https://cms-egspgoi.vercel.app/api/v1";

const users: User[] = [
  { id: 'user-1', name: 'Sarah Johnson', email: 'sarah@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '', role: 'Admission Manager' },
  { id: 'user-2', name: 'Michael Smith', email: 'michael@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '', role: 'Admission Executive' },
  { id: 'user-3', name: 'Emily Davis', email: 'emily@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl || '', role: 'Marketing Manager' },
  { id: 'user-4', name: 'David Chen', email: 'david@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl || '', role: 'Finance' },
  { id: 'user-5', name: 'Admin User', email: 'admin@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '', role: 'Super Admin' },
  { id: '7260e815-6498-46e8-983b-338cb60f195a', name: 'Agent Smith', email: 'agent@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '', role: 'Admission Executive' },
];

const calls: Call[] = [
  { id: 'call-1', leadId: 'lead-2', agentId: 'user-2', duration: 320, timestamp: subHours(new Date(), 26).toISOString(), recordingUrl: '#' },
  { id: 'call-2', leadId: 'lead-3', agentId: 'user-2', duration: 450, timestamp: subHours(new Date(), 49).toISOString(), recordingUrl: '#' },
  { id: 'call-3', leadId: 'lead-4', agentId: 'user-1', duration: 1200, timestamp: subHours(new Date(), 72).toISOString(), recordingUrl: '#' },
  { id: 'call-4', leadId: 'lead-8', agentId: 'user-2', duration: 180, timestamp: subHours(new Date(), 5).toISOString(), recordingUrl: '#' },
];

const budgetRequests: BudgetRequest[] = [
    { id: 'br-1', campaignId: 'camp-1', amount: 10000, status: 'Approved', submittedBy: 'user-3', decisionBy: 'user-4', submittedAt: subDays(new Date(), 10).toISOString(), decisionAt: subDays(new Date(), 9).toISOString() },
    { id: 'br-2', campaignId: 'camp-2', amount: 20000, status: 'Pending', submittedBy: 'user-3', submittedAt: subDays(new Date(), 2).toISOString() },
    { id: 'br-3', campaignId: 'camp-4', amount: 30000, status: 'Pending', submittedBy: 'user-3', submittedAt: subDays(new Date(), 1).toISOString() },
    { id: 'br-4', campaignId: 'camp-5', amount: 15000, status: 'Rejected', submittedBy: 'user-3', decisionBy: 'user-4', submittedAt: subDays(new Date(), 5).toISOString(), decisionAt: subDays(new Date(), 4).toISOString() },
];

const liveCalls: LiveCall[] = [
    { callId: 'live-1', leadName: 'John Doe', agentName: 'Michael Smith', startTime: Date.now() - 1000 * 45 },
    { callId: 'live-2', leadName: 'Jane Smith', agentName: 'Sarah Johnson', startTime: Date.now() - 1000 * 123 },
];

const paymentRecords: PaymentRecord[] = [
    { id: 'pay-1', leadId: 'lead-5', amount: 1500, date: subDays(new Date(), 5).toISOString(), method: 'Credit Card', status: 'Completed' },
    { id: 'pay-2', leadId: 'lead-3', amount: 250, date: subDays(new Date(), 3).toISOString(), method: 'Bank Transfer', status: 'Completed' },
    { id: 'pay-3', leadId: 'lead-4', amount: 500, date: subDays(new Date(), 1).toISOString(), method: 'Credit Card', status: 'Pending' },
];

const adSpends: AdSpend[] = [
    { id: 'ad-1', campaignId: 'camp-1', platform: 'Google', amount: 500, date: subDays(new Date(), 1).toISOString() },
    { id: 'ad-2', campaignId: 'camp-1', platform: 'Facebook', amount: 350, date: subDays(new Date(), 1).toISOString() },
    { id: 'ad-3', campaignId: 'camp-4', platform: 'LinkedIn', amount: 700, date: subDays(new Date(), 1).toISOString() },
    { id: 'ad-4', campaignId: 'camp-1', platform: 'Google', amount: 520, date: subDays(new Date(), 2).toISOString() },
];

const inventoryResources: InventoryResource[] = [
    { name: 'Elastic Compute Cloud (EC2)', count: 9 },
    { name: 'Relational Database Service (RDS)', count: 3 },
    { name: 'Simple Notification Service (SNS)', count: 6 },
    { name: 'Elastic Load Balancer (ELB)', count: 6 },
    { name: 'DynamoDB', count: 3 },
];

const parseCustomDate = (dateString: string | null | undefined): string => {
    if (!dateString) return new Date().toISOString();
    try {
        if (!isNaN(new Date(dateString).getTime())) {
            return new Date(dateString).toISOString();
        }

        const [datePart, timePart] = dateString.split(' - ');
        if (!datePart || !timePart) {
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
        
        const isoDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds || '00')));
        if (isNaN(isoDate.getTime())) {
             throw new Error("Could not construct a valid date");
        }
        return isoDate.toISOString();
    } catch (e) {
        console.error("Could not parse date:", dateString, e);
        return new Date().toISOString();
    }
};

export const getLeads = async (cursor: string | null = null): Promise<PaginatedLeadsResponse> => {
    let response: Response;
    const limit = 20;
    const url = new URL(`${API_BASE_URL}/leads`);
    url.searchParams.append('limit', limit.toString());
    if (cursor) {
        url.searchParams.append('cursor', cursor);
    }

    try {
        response = await fetch(url.toString(), {
            method: 'GET',
            headers: getAuthHeaders(),
        });
    } catch (error) {
        console.error("Network or other fetch error:", error);
        throw new Error("Failed to fetch leads due to a network error.");
    }


    if (!response.ok) {
        const errorText = await response.text();
        let errorJson;
        try {
            errorJson = JSON.parse(errorText);
        } catch (e) {
            errorJson = { message: errorText || 'An unknown error occurred' };
        }
        
        if (response.status === 401 || response.status === 403 || errorJson.message?.toLowerCase().includes("token")) {
             throw new Error("Invalid or expired token");
        }
        throw new Error(errorJson.message || 'Failed to fetch leads');
    }

    const data = await response.json();
    
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
        return { leads, meta: data.meta };
    }
    
    return { leads: [], meta: null };
};

export const createLead = async (leadData: { name: string; email: string; phone: string; college: string; course: string; }): Promise<Lead> => {
    const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            ...leadData,
            admission_year: new Date().getFullYear().toString(),
            source_website: 'internal_dashboard'
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred while creating the lead' }));
        throw new Error(errorData.message || 'Failed to create lead');
    }

    return response.json();
};

export const updateLead = async (leadId: string, leadData: Partial<Lead>): Promise<Lead> => {
    const leadToUpdate: any = { ...leadData };
    
    // API expects `assigned_to` instead of `agent_id`
    if (leadToUpdate.agent_id) {
        leadToUpdate.assigned_to = leadToUpdate.agent_id;
        delete leadToUpdate.agent_id;
    }

    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(leadToUpdate),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred while updating the lead' }));
        throw new Error(errorData.message || 'Failed to update lead');
    }

    return response.json();
}

export const uploadLeads = async (file: File): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const headers = getAuthHeaders();
  delete headers['Content-Type'];

  const response = await fetch(`${API_BASE_URL}/leads/bulk/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred during upload' }));
    throw new Error(errorData.message || 'Failed to upload file');
  }

  return response.json();
};

export const addLeadNote = async (leadId: string, content: string): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred while adding the note' }));
        throw new Error(errorData.message || 'Failed to add note');
    }
    const newNote = await response.json();
    const currentUser = getProfile();
    return {
        ...newNote,
        author_name: newNote.author_name || currentUser?.name || 'Unknown',
        created_at: parseCustomDate(newNote.created_at)
    };
};

export const updateLeadStatus = async (leadId: string, status: LeadStatus): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: status }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred while updating lead status' }));
        throw new Error(errorData.message || 'Failed to update lead status');
    }
};

export const initiateCall = async (leadId: string): Promise<any> => {
    const profile = getProfile();
    const agentNumber = profile?.phone || "918064522110";

    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/call`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ agent_number: agentNumber }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred while initiating the call' }));
        throw new Error(errorData.message || 'Failed to initiate call');
    }
    return response.json();
};

export const transferLead = async (leadId: string, newAgentId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/transfer`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ new_agent_id: newAgentId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred while transferring the lead' }));
        throw new Error(errorData.message || 'Failed to transfer lead');
    }
    return response.json();
};

export const deleteLead = async (leadId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred while deleting the lead' }));
        throw new Error(errorData.message || 'Failed to delete lead');
    }
};


export const getLeadById = async (id: string): Promise<Lead | undefined> => {
    try {
        const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorJson;
            try {
                errorJson = JSON.parse(errorText);
            } catch (e) {
                errorJson = { message: errorText || 'An unknown error occurred' };
            }
            
            if (response.status === 401 || response.status === 403 || errorJson.message?.toLowerCase().includes("token")) {
                 throw new Error("Invalid or expired token");
            }
            throw new Error(errorJson.message || 'Failed to fetch lead');
        }

        const data = await response.json();

        if (data && data.success && data.data) {
            const lead = data.data;
            return {
                ...lead,
                agent_id: lead.assigned_to,
                created_at: parseCustomDate(lead.created_at),
                last_contacted_at: parseCustomDate(lead.updated_at || lead.created_at),
                notes: (lead.notes || []).map((note: any) => ({
                    ...note,
                    author_name: note.author_name || 'Unknown',
                    created_at: parseCustomDate(note.created_at),
                })),
            };
        }
    } catch (error) {
        console.error("Error in getLeadById:", error);
        throw error;
    }
    
    return undefined;
};
export const getLeadStatuses = async (): Promise<LeadStatus[]> => Promise.resolve(["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"]);
export const getLeadsByStatus = async (status: LeadStatus): Promise<Lead[]> => {
    const { leads } = await getLeads();
    return leads.filter(lead => lead.status === status)
};

export const getCampaigns = async (): Promise<Campaign[]> => {
    const response = await fetch(`${API_BASE_URL}/campaigns`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        if (response.status === 401 || response.status === 403) throw new Error("Invalid or expired token");
        throw new Error(errorData.message || 'Failed to fetch campaigns');
    }
    const result = await response.json();
    return result.data.map((c: any) => ({
        ...c,
        startDate: c.start_date,
        endDate: c.end_date,
        budget: c.settings?.budget_daily || 0,
    })) as Campaign[];
};

export const getCampaignById = async (id: string): Promise<Campaign | undefined> => {
    const response = await fetch(`${API_BASE_URL}/campaigns/${id}`, {
        headers: getAuthHeaders(),
    });
     if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        if (response.status === 401 || response.status === 403) throw new Error("Invalid or expired token");
        throw new Error(errorData.message || 'Failed to fetch campaign');
    }
    const result = await response.json();
    const campaign = result.data;
    return {
        ...campaign,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        budget: campaign.settings?.budget_daily || 0,
    }
};

export const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'status'>): Promise<Campaign> => {
    const response = await fetch(`${API_BASE_URL}/campaigns`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            name: campaignData.name,
            start_date: campaignData.startDate,
            end_date: campaignData.endDate,
            settings: {
                budget_daily: campaignData.budget
            },
            status: 'draft'
        }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || 'Failed to create campaign');
    }
    const result = await response.json();
    const campaign = result.data;
    return {
        ...campaign,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        budget: campaign.settings?.budget_daily || 0,
    }
};

export const getCalls = async (): Promise<Call[]> => Promise.resolve(calls);
export const getLiveCalls = async (): Promise<LiveCall[]> => Promise.resolve(liveCalls);

export const getBudgetRequests = async (): Promise<BudgetRequest[]> => Promise.resolve(budgetRequests);

export const getPaymentRecords = async (): Promise<PaymentRecord[]> => Promise.resolve(paymentRecords);
export const getAdSpends = async (): Promise<AdSpend[]> => Promise.resolve(adSpends);

export const getUserById = async (id: string): Promise<User | undefined> => {
    return Promise.resolve(users.find(user => user.id === id))
};
export const getUsers = async (): Promise<User[]> => {
    return Promise.resolve(users);
}

export const getCurrentUserRole = async (): Promise<Role> => Promise.resolve('Admission Manager');

export const getDashboardStats = async () => {
  const { leads } = await getLeads();
  const campaigns = await getCampaigns();
  const newLeadsCount = leads.filter(l => new Date(l.last_contacted_at) > subDays(new Date(), 7)).length;
  return Promise.resolve({
    newLeads: newLeadsCount,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    callsToday: calls.filter(c => new Date(c.timestamp) > subDays(new Date(), 1)).length,
    conversionRate: Math.floor(Math.random() * 5 + 18),
  });
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

export const getInventoryResources = async (): Promise<InventoryResource[]> => Promise.resolve(inventoryResources);

export async function globalSearch(query: string): Promise<any[]> {
    if (query.trim().length < 3) {
        return [];
    }
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred during search' }));
        if (response.status === 401 || response.status === 403 || errorData.message?.toLowerCase().includes("token")) {
             throw new Error("Invalid or expired token");
        }
        throw new Error(errorData.message || 'Failed to perform search');
    }
    
    const results = await response.json();
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

    

    

