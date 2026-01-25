

import { User, Role, Lead, LeadStatus, Campaign, Call, BudgetRequest, LiveCall, PaymentRecord, AdSpend, InventoryResource, Note, CallLog, Asset, CampaignStatus, AppNotification, Site, Category, Page, AdminDashboardData, AdmissionManagerDashboardData, AdmissionExecutiveDashboardData } from './types';
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
    filters: { 
        cursor?: string | null, 
        startDate?: Date, 
        endDate?: Date, 
        assignedTo?: string | string[],
        status?: string[]
    } = {}
): Promise<{ leads: Lead[], meta: { cursor: string | null, count: number } | null, error: any }> => {
    const params = new URLSearchParams({ limit: '50' });
    if (filters.cursor) params.append('cursor', filters.cursor);
    if (filters.startDate) params.append('startDate', format(filters.startDate, 'yyyy-MM-dd'));
    if (filters.endDate) params.append('endDate', format(filters.endDate, 'yyyy-MM-dd'));
    
    if (filters.assignedTo) {
        if (Array.isArray(filters.assignedTo)) {
            filters.assignedTo.forEach(id => params.append('assigned_to[]', id));
        } else {
            params.append('assigned_to', filters.assignedTo);
        }
    }
    
    if (filters.status) {
        filters.status.forEach(s => params.append('status[]', s));
    }

    const url = `/api/v1/leads?${params.toString()}`;
    
    const { data, error } = await apiClient<ApiPaginatedResponse>(url, { method: 'GET' });

    if(error){
        return { leads: [], meta: null, error };
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
    if(error) {
        throw new Error(error.message);
    }
    
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
    const { data, error } = await apiClient<any>('/api/v1/campaigns');
    if (error) throw new Error(error.message);
    return (data?.data || []).map((c: any) => ({
        ...c,
        budget: c.settings?.budget_daily || 0,
        created_at: parseCustomDate(c.created_at),
        updated_at: parseCustomDate(c.updated_at),
    }));
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
    const { data, error } = await apiClient<any>(`/api/v1/campaigns/${id}`);
    if (error) {
        if (error.status === 404) return null;
        throw new Error(error.message);
    }
    if (!data?.data) return null;
    const campaign = data.data;
    return {
        ...campaign,
        budget: campaign.settings?.budget_daily || 0,
        created_at: parseCustomDate(campaign.created_at),
        updated_at: parseCustomDate(campaign.updated_at),
        assets: (campaign.assets || []).map((asset: any) => ({
            ...asset,
            created_at: parseCustomDate(asset.created_at),
        })),
    };
};

export const createCampaign = async (campaignData: Partial<Campaign>): Promise<Campaign> => {
    const { data, error } = await apiClient<any>('/api/v1/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
    });
    if (error) throw new Error(error.message);
    return {
        ...data.data,
        budget: data.data.settings?.budget_daily || 0,
    };
};

export const updateCampaign = async (id: string, campaignData: Partial<Campaign>): Promise<Campaign> => {
    const { data, error } = await apiClient<any>(`/api/v1/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(campaignData),
    });
    if (error) throw new Error(error.message);
    const campaign = data.data;
    return {
        ...campaign,
        budget: campaign.settings?.budget_daily || 0,
    };
};

export const updateCampaignStatus = async (id: string, status: CampaignStatus): Promise<Campaign> => {
    const { data, error } = await apiClient<any>(`/api/v1/campaigns/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    if (error) throw new Error(error.message);
    return {
        ...data.data,
        budget: data.data.settings?.budget_daily || 0,
    };
};

export const deleteCampaign = async (id: string): Promise<void> => {
    const { error } = await apiClient(`/api/v1/campaigns/${id}`, { method: 'DELETE' });
    if (error) throw new Error(error.message);
};

export const getAssets = async (campaignId: string): Promise<Asset[]> => {
    const { data, error } = await apiClient<any>(`/api/v1/assets?campaign_id=${campaignId}`);
    if (error) throw new Error(error.message);
    return (data?.data || []).map((asset: any) => ({
        ...asset,
        created_at: parseCustomDate(asset.created_at),
    }));
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
    if (error) throw new Error(error.message);
    return data.data;
};

export const approveAsset = async (assetId: string, status: 'approved' | 'rejected'): Promise<Asset> => {
    const { data, error } = await apiClient<any>(`/api/v1/assets/${assetId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    if (error) throw new Error(error.message);
    return {
        ...data.data,
        created_at: parseCustomDate(data.data.created_at),
    };
};

export const getBudgetRequests = async (): Promise<BudgetRequest[]> => {
    const { data, error } = await apiClient<any>('/api/v1/budgets');
    if (error) throw new Error(error.message);

    const requests = await Promise.all(
        (data?.data || []).map(async (req: any) => {
            const [user, campaign] = await Promise.all([
                getUserById(req.submitted_by),
                getCampaignById(req.campaign_id),
            ]);
            return {
                ...req,
                submitted_by_user: user ? { id: user.id, name: user.name } : { name: 'Unknown' },
                campaign_name: campaign?.name || 'Unknown Campaign',
                submitted_at: parseCustomDate(req.submitted_at),
                decision_at: req.decision_at ? parseCustomDate(req.decision_at) : undefined,
            };
        })
    );
    return requests;
};

export const requestBudget = async (campaignId: string, amount: number): Promise<BudgetRequest> => {
    const { data, error } = await apiClient<any>('/api/v1/budgets', {
        method: 'POST',
        body: JSON.stringify({ campaign_id: campaignId, amount }),
    });
    if (error) throw new Error(error.message);
    return data.data;
};

export const updateBudgetStatus = async (budgetId: string, status: 'approved' | 'rejected'): Promise<BudgetRequest> => {
    const { data, error } = await apiClient<any>(`/api/v1/budgets/${budgetId}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    if (error) throw new Error(error.message);
    return data.data;
};

export const addPaymentRecord = async (paymentData: Partial<PaymentRecord>): Promise<PaymentRecord> => {
    const { data, error } = await apiClient<any>('/api/v1/accounting/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
    });
    if (error) throw new Error(error.message);
    return data.data;
};

export const getPaymentRecords = async (): Promise<PaymentRecord[]> => {
    const { data, error } = await apiClient<any>('/api/v1/accounting/payments');
    if (error) throw new Error(error.message);
    return (data?.data || []).map((p: any) => ({
        ...p,
        date: parseCustomDate(p.date)
    }));
};

export const addAdSpend = async (adSpendData: Partial<AdSpend>): Promise<AdSpend> => {
    const { data, error } = await apiClient<any>('/api/v1/accounting/ad-spends', {
        method: 'POST',
        body: JSON.stringify(adSpendData),
    });
    if (error) throw new Error(error.message);
    return data.data;
};

export const getAdSpends = async (): Promise<AdSpend[]> => {
    const { data, error } = await apiClient<any>('/api/v1/accounting/ad-spends');
    if (error) throw new Error(error.message);

    const spends = await Promise.all(
        (data?.data || []).map(async (spend: any) => {
            const campaign = await getCampaignById(spend.campaign_id);
            return {
                ...spend,
                date: parseCustomDate(spend.date),
                campaign_name: campaign?.name || 'Unknown',
            };
        })
    );
    return spends;
};

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

export const getDashboardStats = async (range?: string | number, startDate?: string, endDate?: string): Promise<AdminDashboardData> => {
    const params = new URLSearchParams();
    if (range) params.append('range', String(range));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const { data, error } = await apiClient<AdminDashboardData>(`/api/v1/analytics/admin?${params.toString()}`);
    if (error) {
        console.error("Failed to fetch dashboard stats", error.message);
        throw new Error(error.message || 'Failed to fetch dashboard stats');
    }
    return data!;
};

export const getAdmissionManagerStats = async (range?: string | number, startDate?: string, endDate?: string): Promise<AdmissionManagerDashboardData> => {
    const params = new URLSearchParams();
    if (range) params.append('range', String(range));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const { data, error } = await apiClient<AdmissionManagerDashboardData>(`/api/v1/analytics/admission?${params.toString()}`);
    if (error) {
        console.error("Failed to fetch admission manager stats", error.message);
        throw new Error(error.message || 'Failed to fetch admission manager stats');
    }
    return data!;
};

export const getExecutiveStats = async (range?: string | number, startDate?: string, endDate?: string): Promise<AdmissionExecutiveDashboardData> => {
    const params = new URLSearchParams();
    if (range) params.append('range', String(range));
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const { data, error } = await apiClient<AdmissionExecutiveDashboardData>(`/api/v1/analytics/executive?${params.toString()}`);
    if (error) {
        console.error("Failed to fetch executive stats", error.message);
        throw new Error(error.message || 'Failed to fetch executive stats');
    }
    return data!;
};


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
    if (error) {
        throw new Error(error.message);
    }
    const sites = (Array.isArray(data) ? data : data?.data) || [];
    return sites.map((site: any) => ({
        ...site,
        status: site.verification?.status || 'pending',
        verification_token: site.verification?.token,
    }));
};


export const createSite = async (siteData: Partial<Site>): Promise<Site> => {
    const payload = { ...siteData };
    if (!payload.api_key) {
        payload.api_key = `pk_${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
    }
    const { data, error } = await apiClient<{ data: any }>('/api/v1/cms/admin/sites', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    if (error) throw new Error(error.message);
    const site = data!.data;
    return {
        ...site,
        status: site.verification?.status || 'pending',
        verification_token: site.verification?.token,
    };
};

export const updateSite = async (siteId: string, siteData: Partial<Site>): Promise<Site> => {
    const { data, error } = await apiClient<{ data: any }>(`/api/v1/cms/admin/sites/${siteId}`, {
        method: 'PUT',
        body: JSON.stringify(siteData),
    });
    if (error) throw new Error(error.message);
    const site = data!.data;
     return {
        ...site,
        status: site.verification?.status || 'pending',
        verification_token: site.verification?.token,
    };
};

export const deleteSite = async (siteId: string): Promise<void> => {
    const { error } = await apiClient(`/api/v1/cms/admin/sites/${siteId}`, {
        method: 'DELETE',
    });
    if (error) throw new Error(error.message);
};

export const verifySite = async (siteId: string): Promise<any> => {
  const { data, error } = await apiClient<any>(`/api/v1/cms/admin/sites/${siteId}/verify`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// --- CMS CATEGORY FUNCTIONS ---

export const getCategories = async (siteId: string): Promise<Category[]> => {
    if (!siteId) return [];
    const { data, error } = await apiClient<any>(`/api/v1/cms/admin/categories?siteId=${siteId}`);
    if (error) {
        throw new Error(error.message);
    }
    return (Array.isArray(data) ? data : data?.data) || [];
};

export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
    const { data, error } = await apiClient<{ data: any }>('/api/v1/cms/admin/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
    });
    if (error) throw new Error(error.message);
    return data!.data;
};

export const updateCategory = async (categoryId: string, categoryData: Partial<Category>): Promise<Category> => {
    const { data, error } = await apiClient<{ data: any }>(`/api/v1/cms/admin/categories/${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
    });
    if (error) throw new Error(error.message);
    return data!.data;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
    const { error } = await apiClient(`/api/v1/cms/admin/categories/${categoryId}`, {
        method: 'DELETE',
    });
    if (error) throw new Error(error.message);
};

// --- CMS PAGE FUNCTIONS ---

export const getPages = async (siteId: string): Promise<Page[]> => {
    if (!siteId) return [];
    const { data, error } = await apiClient<any>(`/api/v1/cms/admin/pages?siteId=${siteId}`);
    if (error) {
        throw new Error(error.message);
    }
    return (Array.isArray(data) ? data : data?.data) || [];
};

export const getPageById = async (pageId: string): Promise<Page> => {
    const { data, error } = await apiClient<{ data: Page }>(`/api/v1/cms/admin/pages/${pageId}`);
    if (error) {
        throw new Error(error.message);
    }
    return data!.data;
};

export const createPage = async (pageData: Partial<Page>): Promise<Page> => {
    const { data, error } = await apiClient<{ data: any }>('/api/v1/cms/admin/pages', {
        method: 'POST',
        body: JSON.stringify(pageData),
    });
    if (error) throw new Error(error.message);
    return data!.data;
};

export const updatePage = async (pageId: string, pageData: Partial<Page>): Promise<{data: Page | null, error: any}> => {
    const { data, error } = await apiClient<{ data: any }>(`/api/v1/cms/admin/pages/${pageId}`, {
        method: 'PUT',
        body: JSON.stringify(pageData),
    });
    if (error) return { data: null, error };
    return { data: data?.data || null, error: null };
};

export const deletePage = async (pageId: string): Promise<{error: any}> => {
    const { error } = await apiClient(`/api/v1/cms/admin/pages/${pageId}`, {
        method: 'DELETE',
    });
    return { error };
};

export const getLiveCalls = async (): Promise<any[]> => {
  return [
    /*
    {
      "call_id": "1720499638.963",
      "state": "Ringing",
      "direction": 2,
      "customer_number": "9944480464",
      "agent_name": "RAGHAVAN",
      "call_time": "00:00:15",
      "created_at": "09/Jul/2024 10:03:58"
    },
    */
  ]
}
