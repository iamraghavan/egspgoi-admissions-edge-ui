export type Role = "Super Admin" | "Marketing Manager" | "Admission Manager" | "Finance" | "Admission Executive";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
};

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  assignedTo: string; // User ID
  lastContacted: string; // ISO 8601 date string
};

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
  href: (role: string) => string;
  icon: React.ElementType;
  roles: Role[];
};
