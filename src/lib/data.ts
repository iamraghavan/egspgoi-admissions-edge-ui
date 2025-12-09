import { User, Role, Lead, Campaign, Call, LeadStatus, BudgetRequest, LiveCall, PaymentRecord, AdSpend } from './types';
import placeholderImages from './placeholder-images.json';
import { subDays, subHours } from 'date-fns';

const users: User[] = [
  { id: 'user-1', name: 'Sarah Johnson', email: 'sarah@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '', role: 'Admission Manager' },
  { id: 'user-2', name: 'Michael Smith', email: 'michael@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-2')?.imageUrl || '', role: 'Admission Executive' },
  { id: 'user-3', name: 'Emily Davis', email: 'emily@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-3')?.imageUrl || '', role: 'Marketing Manager' },
  { id: 'user-4', name: 'David Chen', email: 'david@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-4')?.imageUrl || '', role: 'Finance' },
  { id: 'user-5', name: 'Admin User', email: 'admin@example.com', avatarUrl: placeholderImages.placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '', role: 'Super Admin' },
];

const leads: Lead[] = [
  { id: 'lead-1', name: 'James Carter', email: 'james.carter@email.com', phone: '555-0101', status: 'New', assignedTo: 'user-2', lastContacted: subDays(new Date(), 2).toISOString() },
  { id: 'lead-2', name: 'Sophia Miller', email: 'sophia.miller@email.com', phone: '555-0102', status: 'Contacted', assignedTo: 'user-2', lastContacted: subDays(new Date(), 3).toISOString() },
  { id: 'lead-3', name: 'Liam Garcia', email: 'liam.garcia@email.com', phone: '555-0103', status: 'Qualified', assignedTo: 'user-2', lastContacted: subDays(new Date(), 4).toISOString() },
  { id: 'lead-4', name: 'Olivia Martinez', email: 'olivia.martinez@email.com', phone: '555-0104', status: 'Proposal', assignedTo: 'user-2', lastContacted: subDays(new Date(), 5).toISOString() },
  { id: 'lead-5', name: 'Noah Rodriguez', email: 'noah.rodriguez@email.com', phone: '555-0105', status: 'Won', assignedTo: 'user-2', lastContacted: subDays(new Date(), 6).toISOString() },
  { id: 'lead-6', name: 'Emma Wilson', email: 'emma.wilson@email.com', phone: '555-0106', status: 'Lost', assignedTo: 'user-2', lastContacted: subDays(new Date(), 7).toISOString() },
  { id: 'lead-7', name: 'Aiden Anderson', email: 'aiden.anderson@email.com', phone: '555-0107', status: 'New', assignedTo: 'user-2', lastContacted: subDays(new Date(), 1).toISOString()},
  { id: 'lead-8', name: 'Isabella Thomas', email: 'isabella.thomas@email.com', phone: '555-0108', status: 'Contacted', assignedTo: 'user-2', lastContacted: subDays(new Date(), 1).toISOString()},
  { id: 'lead-9', name: 'Mason Jackson', email: 'mason.jackson@email.com', phone: '555-0109', status: 'Qualified', assignedTo: 'user-1', lastContacted: subDays(new Date(), 2).toISOString()},
  { id: 'lead-10', name: 'Harper White', email: 'harper.white@email.com', phone: '555-0110', status: 'Proposal', assignedTo: 'user-1', lastContacted: subDays(new Date(), 3).toISOString()},
];

export const leadStatuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

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

// --- Data access functions ---

export const getLeads = async (): Promise<Lead[]> => Promise.resolve(leads);
export const getLeadById = async (id: string): Promise<Lead | undefined> => Promise.resolve(leads.find(lead => lead.id === id));
export const getLeadStatuses = async (): Promise<LeadStatus[]> => Promise.resolve(leadStatuses);
export const getLeadsByStatus = async (status: LeadStatus): Promise<Lead[]> => Promise.resolve(leads.filter(lead => lead.status === status));

export const getCampaigns = async (): Promise<Campaign[]> => Promise.resolve(campaigns);
export const getCampaignById = async (id: string): Promise<Campaign | undefined> => Promise.resolve(campaigns.find(c => c.id === id));

export const getCalls = async (): Promise<Call[]> => Promise.resolve(calls);
export const getLiveCalls = async (): Promise<LiveCall[]> => Promise.resolve(liveCalls);

export const getBudgetRequests = async (): Promise<BudgetRequest[]> => Promise.resolve(budgetRequests);

export const getPaymentRecords = async (): Promise<PaymentRecord[]> => Promise.resolve(paymentRecords);
export const getAdSpends = async (): Promise<AdSpend[]> => Promise.resolve(adSpends);

export const getUserById = async (id: string): Promise<User | undefined> => Promise.resolve(users.find(user => user.id === id));
export const getUsers = async (): Promise<User[]> => Promise.resolve(users);

export const getCurrentUserRole = async (): Promise<Role> => Promise.resolve('Admission Manager');

export const getDashboardStats = async () => {
  // Simulate some variability
  const newLeadsCount = leads.filter(l => new Date(l.lastContacted) > subDays(new Date(), 7)).length;
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
