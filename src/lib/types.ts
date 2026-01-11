

export type Role = "Super Admin" | "Marketing Manager" | "Admission Manager" | "Finance" | "Admission Executive";

export type UserPreferences = {
  currency: 'INR' | 'USD' | 'EUR';
  language: 'en' | 'es' | 'fr';
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  date_format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY/MM/DD';
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  phone?: string;
  preferences?: UserPreferences;
  designation?: string;
  agent_number?: string | null;
  caller_id?: string | null;
};

export type LeadStatus = "New" | "Contacted" | "Interested" | "Enrolled" | "Failed";

export type Note = {
  id?: string;
  content: string;
  author_id: string;
  author_name?: string;
  author_role?: string;
  author_email?: string;
  created_at: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  agent_id: string; // Corresponds to assigned_to from API
  last_contacted_at: string; // Corresponds to updated_at from API
  college?: string;
  course?: string;
  lead_reference_id?: string;
  source_website?: string;
  district?: string;
  state?: string;
  admission_year?: string;
  assigned_to: string | null;
  created_at: string;
  notes?: Note[];
  assigned_user: User | null;
};

export type PaginatedLeadsResponse = {
  leads: Lead[];
  meta: {
    cursor: string | null;
    count: number;
  } | null;
}

export type CampaignStatus = "Planning" | "Active" | "Completed" | "Archived";

export type Campaign = {
  id: string;
  name: string;
  startDate: string; // ISO 8601 date string
  endDate: string; // ISO 8601 date string
  budget: number;
  status: CampaignStatus;
  manager: string; // User ID
};

export type BudgetRequestStatus = "Pending" | "Approved" | "Rejected";

export type BudgetRequest = {
  id: string;
  campaignId: string;
  amount: number;
  status: BudgetRequestStatus;
  submittedBy: string; // User ID
  decisionBy?: string; // User ID
  submittedAt: string; // ISO 8601 date string
  decisionAt?: string; // ISO 8601 date string
};

export type Call = {
  id: string;
  leadId: string;
  agentId: string; // User ID
  duration: number; // in seconds
  timestamp: string; // ISO 8601 date string
  recordingUrl: string;
};

export type LiveCall = {
    callId: string;
    leadName: string;
    agentName: string;
    startTime: number; // Unix timestamp (ms)
};

export type PaymentRecord = {
    id: string;
    leadId: string;
    amount: number;
    date: string; // ISO 8601
    method: 'Credit Card' | 'Bank Transfer' | 'Other';
    status: 'Completed' | 'Pending' | 'Failed';
};

export type AdSpend = {
    id: string;
    campaignId: string;
    platform: 'Google' | 'Facebook' | 'LinkedIn';
    amount: number;
    date: string; // ISO 8601
};

export type NavItem = {
  title: string;
  href: (encryptedPortalId: string, role: string, encryptedUserId: string) => string;
  icon: React.ElementType;
  roles: Role[];
};

export type InventoryResource = {
  name: string;
  count: number;
};
