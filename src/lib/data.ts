

import { User, Role, Lead, Campaign, Call, LeadStatus, BudgetRequest, LiveCall, PaymentRecord, AdSpend, InventoryResource } from './types';
import placeholderImages from './placeholder-images.json';
import { subDays, subHours } from 'date-fns';
import { getAuthHeaders, logout } from './auth';

const API_BASE_URL = "https://cms-egspgoi.vercel.app/api/v1";

const users: User[] = [
  { id: 'user-1', name: 'Sarah Johnson', email: 'sarah@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '', role: 'Admission Manager' },
  { id: 'user-2', name: 'Michael Smith', email: 'michael@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '', role: 'Admission Executive' },
  { id: 'user-3', name: 'Emily Davis', email: 'emily@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl || '', role: 'Marketing Manager' },
  { id: 'user-4', name: 'David Chen', email: 'david@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl || '', role: 'Finance' },
  { id: 'user-5', name: 'Admin User', email: 'admin@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '', role: 'Super Admin' },
  { id: '7260e815-6498-46e8-983b-338cb60f195a', name: 'Agent Smith', email: 'agent@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '', role: 'Admission Executive' },
];

const campaigns: Campaign[] = [
  { id: 'camp-1', name: 'Fall 2024 Undergrad', startDate: '2024-08-01T00:00:00Z', endDate: '2024-11-30T00:00:00Z', budget: 50000, status: 'Active', manager: 'user-3' },
  { id: 'camp-2', name: 'Spring 2025 Grad Programs', startDate: '2024-12-01T00:00:00Z', endDate: '2025-03-31T00:00:00Z', budget: 75000, status: 'Planning', manager: 'user-3' },
  { id: 'camp-4', name: 'Online MBA Launch', startDate: '2024-09-15T00:00:00Z', endDate: '2025-01-15T00:00:00Z', budget: 120000, status: 'Active', manager: 'user-3' },
  { id: 'camp-5', name: 'Data Science Bootcamp', startDate: '2024-10-01T00:00:00Z', endDate: '2024-12-31T00:00:00Z', budget: 60000, status: 'Planning', manager: 'user-3' },
  { id: 'camp-3', name: 'Summer Internships 2024', startDate: '2024-05-01T00:00:00Z', endDate: '2024-07-31T00:00:00Z', budget: 25000, status: 'Completed', manager: 'user-3' },
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

// --- Data access functions ---

// Helper to parse "MM/DD/YYYY - hh:mm:ss aa" format
const parseCustomDate = (dateString: string | null | undefined): string => {
    if (!dateString) return new Date().toISOString();
    try {
        // Check for existing ISO format first
        if (!isNaN(new Date(dateString).getTime())) {
            return new Date(dateString).toISOString();
        }

        const [datePart, timePart] = dateString.split(' - ');
        if (!datePart || !timePart) {
            // Fallback for just date or other non-standard formats
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
        
        // Month in JS is 0-indexed, so subtract 1
        const isoDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds || '00'));
        if (isNaN(isoDate.getTime())) {
             throw new Error("Could not construct a valid date");
        }
        return isoDate.toISOString();
    } catch (e) {
        console.error("Could not parse date:", dateString, e);
        return new Date().toISOString(); // Fallback to current time to avoid crashes
    }
};

export const getLeads = async (): Promise<Lead[]> => {
    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}/leads`, {
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
    
    if (data && Array.isArray(data.items)) {
        return data.items.map((lead: any) => ({
            ...lead,
            agent_id: lead.assigned_to,
            created_at: parseCustomDate(lead.created_at),
            last_contacted_at: parseCustomDate(lead.updated_at || lead.created_at),
        }));
    }
    
    return [];
};

export const createLead = async (leadData: { name: string; email: string; phone: string; college: string; course: string; }): Promise<Lead> => {
    const response = await fetch(`${API_BASE_URL}/leads`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(leadData),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred while creating the lead' }));
        throw new Error(errorData.message || 'Failed to create lead');
    }

    return response.json();
};

export const uploadLeads = async (file: File): Promise<{ message: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const headers = getAuthHeaders();
  // Remove Content-Type, browser will set it with boundary
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

export const addLeadNote = async (leadId: string, content: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/leads/${leadId}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred while adding the note' }));
        throw new Error(errorData.message || 'Failed to add note');
    }
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


export const getLeadById = async (id: string): Promise<Lead | undefined> => {
    const leads = await getLeads();
    return leads.find(lead => lead.id === id)
};
export const getLeadStatuses = async (): Promise<LeadStatus[]> => Promise.resolve(["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"]);
export const getLeadsByStatus = async (status: LeadStatus): Promise<Lead[]> => {
    const leads = await getLeads();
    return leads.filter(lead => lead.status === status)
};

export const getCampaigns = async (): Promise<Campaign[]> => Promise.resolve(campaigns);
export const getCampaignById = async (id: string): Promise<Campaign | undefined> => Promise.resolve(campaigns.find(c => c.id === id));

export const getCalls = async (): Promise<Call[]> => Promise.resolve(calls);
export const getLiveCalls = async (): Promise<LiveCall[]> => Promise.resolve(liveCalls);

export const getBudgetRequests = async (): Promise<BudgetRequest[]> => Promise.resolve(budgetRequests);

export const getPaymentRecords = async (): Promise<PaymentRecord[]> => Promise.resolve(paymentRecords);
export const getAdSpends = async (): Promise<AdSpend[]> => Promise.resolve(adSpends);

export const getUserById = async (id: string): Promise<User | undefined> => {
    // In a real app, this would fetch from /api/v1/users/:id
    return Promise.resolve(users.find(user => user.id === id))
};
export const getUsers = async (): Promise<User[]> => {
    // In a real app, this would fetch from /api/v1/users
    return Promise.resolve(users);
}

export const getCurrentUserRole = async (): Promise<Role> => Promise.resolve('Admission Manager');

export const getDashboardStats = async () => {
  // Simulate some variability
  const leads = await getLeads();
  const newLeadsCount = leads.filter(l => new Date(l.last_contacted_at) > subDays(new Date(), 7)).length;
  return Promise.resolve({
    newLeads: newLeadsCount,
    activeCampaigns: campaigns.filter(c => c.status === 'Active').length,
    callsToday: calls.filter(c => new Date(c.timestamp) > subDays(new Date(), 1)).length,
    conversionRate: Math.floor(Math.random() * 5 + 18), // between 18% and 23%
  });
};

export const getLeadsOverTime = async () => {
    const data = [
        { date: "Jan", leads: Math.floor(Math.random() * 20 + 80) }, // 80-100
        { date: "Feb", leads: Math.floor(Math.random() * 20 + 90) }, // 90-110
        { date: "Mar", leads: Math.floor(Math.random() * 20 + 100) }, // 100-120
        { date: "Apr", leads: Math.floor(Math.random() * 20 + 110) }, // 110-130
        { date: "May", leads: Math.floor(Math.random() * 20 + 100) }, // 100-120
        { date: "Jun", leads: Math.floor(Math.random() * 20 + 120) }, // 120-140
    ];
    return Promise.resolve(data);
}

export const getInventoryResources = async (): Promise<InventoryResource[]> => Promise.resolve(inventoryResources);

/**
 * Performs a global search across different types of data.
 * @param query - The search query string.
 * @returns A promise that resolves with an array of search results.
 */
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
        flattenedResults.push(...results.leads.map((item: any) => ({ ...item, type: 'lead', url: `/u/crm/egspgoi/sa/${item.id}/leads` })));
    }
    if (results.campaigns && Array.isArray(results.campaigns)) {
        flattenedResults.push(...results.campaigns.map((item: any) => ({ ...item, type: 'campaign', url: `/u/crm/egspgoi/sa/${item.id}/campaigns` })));
    }
    if (results.users && Array.isArray(results.users)) {
        flattenedResults.push(...results.users.map((item: any) => ({ ...item, type: 'user', url: `/u/crm/egspgoi/sa/${item.id}/users` })));
    }

    if (flattenedResults.length === 0 && (results.leads?.length === 0 && results.campaigns?.length === 0 && results.users?.length === 0)) {
        return [];
    }

    return flattenedResults;
}

