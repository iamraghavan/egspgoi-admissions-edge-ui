

import { User, Role, Lead, LeadStatus, Campaign, Call, BudgetRequest, LiveCall, PaymentRecord, AdSpend, InventoryResource, Note, CallLog, Asset, CampaignStatus, AppNotification, Site } from './types';
import { subDays, subHours, format } from 'date-fns';
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

const roleIdToNameMap: Record<string, Role> = {
    "1c71bf70-49cf-410b-8d81-990825bed137": "Admission Manager",
    "5ad3c8c2-28f5-4685-848c-3b07ffe1d6e3": "Admission Executive",
    "1847e5ff-ca6c-46b9-8cce-993f69b90ff5": "Super Admin", // Assuming this is Super Admin
};

type ApiPaginatedResponse = {
    success: boolean;
    data: any[];
    meta: {
        cursor: string | null;
        count: number;
    }
}

export const getLeads = async (
    filters: { cursor?: string | null, startDate?: Date, endDate?: Date, assignedTo?: string } = {}
): Promise<{ leads: Lead[], meta: { cursor: string | null, count: number } | null, error: any }> => {
    const params = new URLSearchParams({ limit: '20' });
    if (filters.cursor) params.append('cursor', filters.cursor);
    if (filters.startDate) params.append('startDate', format(filters.startDate, 'yyyy-MM-dd'));
    if (filters.endDate) params.append('endDate', format(filters.endDate, 'yyyy-MM-dd'));
    if (filters.assignedTo) params.append('assigned_to', filters.assignedTo);

    const url = `/api/v1/leads?${params.toString()}`;
    
    const { data, error } = await apiClient<ApiPaginatedResponse>(url, { method: 'GET' });

    if(error){
        if (error.status === 401 || error.status === 403) {
            return { leads: [], meta: null, error };
        }
        throw new Error(error.message || 'Failed to fetch leads');
    }
    
    if (data && data.success && Array.isArray(data.data)) {
        const leads = data.data.map((lead: any) => ({
            ...lead,
            agent_id: lead.assigned_to,
            created_at: parseCustomDate(lead.created_at),
            last_contacted_at: parseCustomDate(lead.updated_at || lead.created_at),
            assigned_user: lead.assigned_user ? {
                ...lead.assigned_user,
                avatarUrl: lead.assigned_user.avatarUrl || '',
                role: lead.assigned_user.role_id, 
            } : null,
            notes: (lead.notes || []).map((note: any) => ({
                id: note.note_id,
                content: note.content,
                author_id: note.author_id,
                author_name: note.author_name || 'Unknown',
                author_role: note.author_role,
                author_email: note.author_email,
                created_at: parseCustomDate(note.created_at),
            })),
        }));
        return { leads, meta: data.meta, error: null };
    }
    
    return { leads: [], meta: null, error: { message: "Unexpected response format." } };
};

export const createLead = async (leadData: { name: string; email: string; phone: string; college: string; course: string; }): Promise<Lead> => {
     const { data, error } = await apiClient<Lead>('/api/v1/leads', {
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
    
    const { data, error } = await apiClient<Lead>(`/api/v1/leads/${leadId}`, {
        method: 'PUT',
        body: JSON.stringify(leadToUpdate),
    });

    if(error) throw new Error(error.message);
    return data!;
}

export const uploadLeads = async (file: File): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data, error } = await apiClient<{ message: string }>('/api/v1/leads/bulk/upload', {
    method: 'POST',
    body: formData,
  });

  if(error) throw new Error(error.message);
  return data!;
};

export const getLeadNotes = async (leadId: string): Promise<Note[]> => {
    const { data, error } = await apiClient<{ success: boolean; data: any[] }>(`/api/v1/leads/${leadId}/notes`);
    if(error) throw new Error(error.message);
    
    return (data?.data || []).map((note: any) => ({
        id: note.note_id,
        content: note.content,
        author_id: note.author_id,
        author_name: note.author_name || 'Unknown',
        author_role: note.author_role,
        author_email: note.author_email,
        created_at: parseCustomDate(note.created_at),
    })).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};


export const addLeadNote = async (leadId: string, content: string): Promise<Note> => {
    const { data, error } = await apiClient<{ success: boolean; data: any }>(`/api/v1/leads/${leadId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });

    if(error) throw new Error(error.message);
    const newNote = data!.data;
    return {
        id: newNote.note_id,
        content: newNote.content,
        author_id: newNote.author_id,
        author_name: newNote.author_name || 'Unknown',
        author_role: newNote.author_role,
        author_email: newNote.author_email,
        created_at: parseCustomDate(newNote.created_at)
    };
};

export const getLeadCallLogs = async (leadId: string): Promise<CallLog[]> => {
    const { data, error } = await apiClient<{ success: boolean; data: any[] }>(`/api/v1/leads/${leadId}/call-logs`);
    if (error) {
        throw new Error(error.message);
    }
    return (data?.data || []).map((log: any) => ({
        ...log,
        start_stamp: log.start_stamp ? new Date(log.start_stamp).toLocaleString() : 'N/A',
        end_stamp: log.end_stamp ? new Date(log.end_stamp).toLocaleString() : 'N/A',
    }));
};

export const updateLeadStatus = async (leadId: string, status: LeadStatus): Promise<void> => {
     const { error } = await apiClient(`/api/v1/leads/${leadId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: status }),
    });
    if(error) throw new Error(error.message);
};

export const initiateCall = async (leadId: string): Promise<string> => {
    const profile = await getProfile();
    const callerId = profile?.caller_id;

    if (!callerId) {
        throw new Error("Caller ID not found in your profile. Please update your settings.");
    }

    const { data, error } = await apiClient<any>(`/api/v1/leads/${leadId}/call`, {
        method: 'POST',
        body: JSON.stringify({ agent_number: callerId }),
    });


    if (error) {
        throw new Error(error.message);
    }
    
    const ref_id = data?.data?.ref_id;
    if (!ref_id) {
        throw new Error("Call initiation successful, but did not receive a valid 'ref_id' from the API.");
    }
    
    return ref_id;
};


export const transferLead = async (leadId: string, newAgentId: string): Promise<any> => {
    const { data, error } = await apiClient(`/api/v1/leads/${leadId}/transfer`, {
        method: 'POST',
        body: JSON.stringify({ new_agent_id: newAgentId })
    });
    if(error) throw new Error(error.message);
    return data;
};

export const bulkTransferLeads = async (leadIds: string[], newAgentId: string): Promise<any> => {
    const { data, error } = await apiClient('/api/v1/leads/bulk-transfer', {
        method: 'POST',
        body: JSON.stringify({ lead_ids: leadIds, new_agent_id: newAgentId })
    });
    if(error) throw new Error(error.message);
    return data;
};

export const deleteLead = async (leadId: string, type: 'soft' | 'hard' = 'soft'): Promise<void> => {
    let url = `/api/v1/leads/${leadId}`;
    if (type === 'hard') {
        url += '?type=hard';
    }
    const { error } = await apiClient(url, {
        method: 'DELETE',
    });
    if(error) throw new Error(error.message);
};


export const getLeadById = async (id: string): Promise<{data: Lead | null, error: any}> => {
    const { data, error } = await apiClient<{ success: boolean, data: any }>(`/api/v1/leads/${id}`, { method: 'GET' });
    if(error) return { data: null, error };
    if (data && data.success && data.data) {
        const lead = data.data;
        return {
            data: {
                ...lead,
                agent_id: lead.assigned_to,
                assigned_user: lead.assigned_user ? {
                    ...lead.assigned_user,
                    avatarUrl: lead.assigned_user.avatarUrl || '',
                    role: lead.assigned_user.role_id,
                } : null,
                created_at: parseCustomDate(lead.created_at),
                last_contacted_at: parseCustomDate(lead.updated_at || lead.created_at),
                notes: (lead.notes || []).map((note: any) => ({
                    id: note.note_id,
                    content: note.content,
                    author_id: note.author_id,
                    author_name: note.author_name || 'Unknown',
                    author_role: note.author_role,
                    author_email: note.author_email,
                    created_at: parseCustomDate(note.created_at),
                })),
            },
            error: null,
        };
    }
    return { data: null, error: { message: "Lead not found or unexpected format" }};
};
export const getLeadStatuses = async (): Promise<LeadStatus[]> => Promise.resolve(["New", "Contacted", "Interested", "Enrolled", "Failed"]);

export const getCampaigns = async (): Promise<Campaign[]> => {
    const { data, error } = await apiClient<{ success: boolean; data: any[] }>('/api/v1/campaigns');
    if(error) throw new Error(error.message);
    return data!.data.map((c: any) => ({
        ...c,
        budget: c.settings?.budget_daily || 0,
    })) as Campaign[];
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
    const { data, error } = await apiClient<any>(`/api/v1/campaigns/${id}`);
    if(error) {
        if (error.status === 404) {
            return null;
        }
        throw new Error(error.message);
    };
    if (!data || !data.data) {
        return null;
    }
    const campaign = data.data;
    return { 
        ...campaign,
        budget: campaign.settings?.budget_daily || 0,
        assets: campaign.assets || [],
    };
};

export const createCampaign = async (campaignData: Partial<Campaign>): Promise<Campaign> => {
     const { data, error } = await apiClient<any>('/api/v1/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
    });
    if(error) throw new Error(error.message);
    const campaign = data.data;
    return {
        ...campaign,
        budget: campaign.settings?.budget_daily || 0,
    }
};

export const updateCampaign = async (id: string, campaignData: Partial<Campaign>): Promise<Campaign> => {
    const { data, error } = await apiClient<any>(`/api/v1/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(campaignData),
    });
    if(error) throw new Error(error.message);
    const campaign = data.data;
    return {
        ...campaign,
        budget: campaign.settings?.budget_daily || 0,
    }
}

export const updateCampaignStatus = async (id: string, status: CampaignStatus): Promise<Campaign> => {
    const { data, error } = await apiClient<any>(`/api/v1/campaigns/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    if(error) throw new Error(error.message);
    const campaign = data.data;
    return {
        ...campaign,
        budget: campaign.settings?.budget_daily || 0,
    }
};

export const deleteCampaign = async (id: string): Promise<void> => {
    const { error } = await apiClient<any>(`/api/v1/campaigns/${id}`, {
        method: 'DELETE',
    });
    if(error) throw new Error(error.message);
};

export const uploadAsset = async (assetData: { campaign_id: string; name: string; file: File }): Promise<Asset> => {
    const formData = new FormData();
    formData.append('campaign_id', assetData.campaign_id);
    formData.append('name', assetData.name);
    formData.append('file', assetData.file);

    const { data, error } = await apiClient<any>('/api/v1/assets', {
        method: 'POST',
        body: formData,
    });
    if(error) throw new Error(error.message);
    return data.data;
};

export const getCalls = async (): Promise<Call[]> => {
    const calls: Call[] = [
        { id: 'call-1', leadId: 'lead-2', agentId: 'user-2', duration: 320, timestamp: subHours(new Date(), 26).toISOString(), recordingUrl: '#' },
        { id: 'call-2', leadId: 'lead-3', agentId: 'user-2', duration: 450, timestamp: subHours(new Date(), 49).toISOString(), recordingUrl: '#' },
    ];
    return Promise.resolve(calls);
}

export const getLiveCalls = async (): Promise<any[]> => {
    const { data, error } = await apiClient<any>(`/api/v1/smartflo/live-calls`);
    if(error) {
        throw new Error(error.message || 'Failed to fetch live calls');
    };
    return data.data || [];
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
        { id: 'pay-1', leadId: 'lead-5', leadName: 'Suresh Kumar', amount: 1500, date: subDays(new Date(), 5).toISOString(), method: 'Credit Card', status: 'Completed' },
        { id: 'pay-2', leadId: 'lead-3', leadName: 'Priya Sharma', amount: 250, date: subDays(new Date(), 3).toISOString(), method: 'Bank Transfer', status: 'Completed' },
    ];
    return Promise.resolve(paymentRecords);
}

export const getAdSpends = async (): Promise<AdSpend[]> => {
     const adSpends: AdSpend[] = [
        { id: 'ad-1', campaignId: 'camp-1', campaignName: 'Fall Admissions 2024', platform: 'Google', amount: 500, date: subDays(new Date(), 1).toISOString() },
        { id: 'ad-2', campaignId: 'camp-1', campaignName: 'Fall Admissions 2024', platform: 'Facebook', amount: 350, date: subDays(new Date(), 1).toISOString() },
    ];
    return Promise.resolve(adSpends);
}

export const getUserById = async (id: string): Promise<User | null> => {
    if (!id) return null;
    const { data, error } = await apiClient<{data: any}>(`/api/v1/users/${id}`);
    if (error) {
        return null;
    }
    const user = data?.data;
    if (!user) return null;
    return {
        ...user,
        role: roleIdToNameMap[user.role_id] || user.role,
        avatarUrl: user.avatarUrl || ''
    };
};

export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await apiClient<any[]>(`/api/v1/users`);
    if (error) {
        if (error.status === 401 || error.status === 403) {
            return []; // Gracefully return empty array on auth errors
        }
        throw new Error(error.message || 'Failed to fetch users');
    }
    const users = Array.isArray(data) ? data : [];
    return users.map((user: any) => ({
      ...user,
      role: roleIdToNameMap[user.role_id] || 'Admission Executive',
      avatarUrl: user.avatarUrl || '',
    }));
}

export const createUser = async (userData: Partial<User>): Promise<User> => {
    const { data, error } = await apiClient<any>(`/api/v1/users`, {
        method: 'POST',
        body: JSON.stringify(userData),
    });
    if (error) throw new Error(error.message);
    const user = data.data;
    return {
        ...user,
        role: roleIdToNameMap[user.role_id] || 'Admission Executive'
    };
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User> => {
    const { data, error } = await apiClient<any>(`/api/v1/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
    if (error) throw new Error(error.message);
    const user = data.data;
     return {
        ...user,
        role: roleIdToNameMap[user.role_id] || 'Admission Executive'
    };
};

export const deleteUser = async (userId: string, type: 'soft' | 'hard'): Promise<void> => {
    const { error } = await apiClient(`/api/v1/users/${userId}?type=${type}`, {
        method: 'DELETE',
    });
    if (error) throw new Error(error.message);
};

export const getCurrentUserRole = async (): Promise<Role> => Promise.resolve('Admission Manager');

export const getDashboardStats = async (range?: string | number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (range) params.append('range', String(range));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const { data, error } = await apiClient<any>(`/api/v1/analytics/admin?${params.toString()}`);
    if (error) {
        console.error("Failed to fetch dashboard stats", error.message);
        throw new Error(error.message || 'Failed to fetch dashboard stats');
    }
    return data;
};

export const getExecutiveStats = async (range?: string | number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (range) params.append('range', String(range));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const { data, error } = await apiClient<any>(`/api/v1/analytics/executive?${params.toString()}`);
    if (error) {
        console.error("Failed to fetch executive stats", error.message);
        throw new Error(error.message || 'Failed to fetch executive stats');
    }
    return data;
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
    const { data, error } = await apiClient<any>(`/api/v1/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
    });

    if (error) {
        console.error("Search failed:", error.message);
        throw new Error(error.message);
    }
    
    const results = data.data;
    const flattenedResults = [];
    if (results.leads && Array.isArray(results.leads)) {
        flattenedResults.push(...results.leads.map((item: any) => ({ ...item, type: 'lead', url: `/u/app/${item.role}/${item.encryptedUserId}/leads/${item.id}` })));
    }
    if (results.campaigns && Array.isArray(results.campaigns)) {
        flattenedResults.push(...results.campaigns.map((item: any) => ({ ...item, type: 'campaign', url: `/u/app/${item.role}/${item.encryptedUserId}/campaigns/${item.id}` })));
    }
    if (results.users && Array.isArray(results.users)) {
        flattenedResults.push(...results.users.map((item: any) => ({ ...item, type: 'user', url: `/u/app/${item.role}/${item.encryptedUserId}/user-management/${item.id}` })));
    }

    if (flattenedResults.length === 0 && (results.leads?.length === 0 && results.campaigns?.length === 0 && results.users?.length === 0)) {
        return [];
    }

    return flattenedResults;
}


// Smartflo API integrations
export const hangupCall = async (callId: string): Promise<any> => {
    const { data, error } = await apiClient(`/api/v1/smartflo/call/hangup`, {
        method: 'POST',
        body: JSON.stringify({ call_id: callId }),
    });
    if(error) throw new Error(error.message);
    return data;
};

export const dialNumber = async (numberToDial: string): Promise<any> => {
    const profile = await getProfile();
    const agentNumber = profile?.agent_number;
    
    if (!agentNumber) {
        throw new Error("Agent number not found in profile.");
    }

    const { data, error } = await apiClient(`/api/v1/smartflo/call/dial`, {
        method: 'POST',
        body: JSON.stringify({ agent_number: agentNumber, customer_number: numberToDial }),
    });
    if(error) throw new Error(error.message);
    return data;
}

type GetCallRecordsParams = {
  from_date?: string;
  to_date?: string;
  direction?: 'inbound' | 'outbound' | 'all';
  destination?: string; // For outbound calls
  callerid?: string; // For inbound calls
  agent_number?: string;
  agent_name?: string;
  page?: number;
  limit?: number;
};

export const getCallRecords = async (params: GetCallRecordsParams): Promise<any> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value && value !== 'all') {
            query.append(key, value.toString());
        }
    });

    const endpoint = `/api/v1/smartflo/call/records?${query.toString()}`;
    
    const { data, error } = await apiClient<any>(endpoint, {
        method: 'GET',
    });

    if(error) throw new Error(error.message);
    
    return {
        success: data?.success,
        results: data?.data?.results || [],
        count: data?.data?.count || 0,
        limit: data?.data?.limit || 20,
        message: data?.message
    };
};

export async function saveDeviceToken(token: string): Promise<void> {
    const { error } = await apiClient('/api/v1/users/users/device-token', {
        method: 'POST',
        body: JSON.stringify({ fcm_token: token }),
    });
    if (error) {
        // It's often okay for this to fail silently as it's not critical for app functionality
        console.error("Failed to save FCM token:", error.message);
    }
}

export async function getNotificationHistory(): Promise<AppNotification[]> {
    const { data, error } = await apiClient<{ success: boolean; data: any[] }>('/api/v1/notifications');

    if (error) {
        console.error("Failed to fetch notification history:", error.message);
        return []; // Fail gracefully for a non-critical feature.
    }

    if (data && data.success && Array.isArray(data.data)) {
        const sortedNotifications = data.data
            .map((item: any): AppNotification => ({
                id: item.id,
                title: item.title,
                body: item.body,
                read: !!item.read_at, // Convert timestamp/null to boolean
                timestamp: item.created_at,
                data: item.data || {},
            }))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return sortedNotifications;
    }

    return [];
}


export async function markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await apiClient(`/api/v1/notifications/${notificationId}/read`, {
        method: 'PATCH',
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
    });
    if (error) {
        // Fail silently for now, as it's not a critical user-facing error
        console.error("Failed to mark notification as read:", error.message);
    }
}

export async function markAllNotificationsAsRead(): Promise<void> {
    const { error } = await apiClient('/api/v1/notifications/read-all', {
        method: 'PATCH',
    });
    if (error) {
        // Fail silently for now
        console.error("Failed to mark all notifications as read:", error.message);
    }
}


// --- CMS DATA FUNCTIONS ---

export const getSites = async (): Promise<Site[]> => {
    const { data, error } = await apiClient<any>('/api/v1/cms/admin/sites');
    if (error) throw new Error(error.message);
    return data.data;
};

export const createSite = async (siteData: Partial<Site>): Promise<Site> => {
    const { data, error } = await apiClient<any>('/api/v1/cms/admin/sites', {
        method: 'POST',
        body: JSON.stringify(siteData),
    });
    if (error) throw new Error(error.message);
    return data.data;
};

export const updateSite = async (siteId: string, siteData: Partial<Site>): Promise<Site> => {
    const { data, error } = await apiClient<any>(`/api/v1/cms/admin/sites/${siteId}`, {
        method: 'PUT',
        body: JSON.stringify(siteData),
    });
    if (error) throw new Error(error.message);
    return data.data;
};

export const deleteSite = async (siteId: string): Promise<void> => {
    const { error } = await apiClient(`/api/v1/cms/admin/sites/${siteId}`, {
        method: 'DELETE',
    });
    if (error) throw new Error(error.message);
};
