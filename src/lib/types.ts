

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

export type CallLog = {
    call_id: string;
    start_stamp: string;
    answer_stamp: string;
    end_stamp: string;
    call_status: 'answered' | 'missed' | 'failed' | 'not_answered';
    direction: 'clicktocall' | 'inbound';
    duration: string;
    billsec: string;
    recording_url: string;
    answered_agent_name: string;
    hangup_cause_description: string;
}

export type PaginatedLeadsResponse = {
  leads: Lead[];
  meta: {
    cursor: string | null;
    count: number;
  } | null;
}

export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export type Campaign = {
  id: string;
  name: string;
  start_date: string; // ISO 8601 date string
  end_date: string; // ISO 8601 date string
  budget: number;
  status: CampaignStatus;
  type: string;
  platform: string;
  institution: string;
  objective: string;
  kpi: string;
  target_audience: {
      age: string;
      location: string;
  };
  settings: {
      budget_daily: number;
  };
  assets?: Asset[];
  created_at: string;
  updated_at: string;
};

export type Asset = {
    id: string;
    campaign_id: string;
    name: string;
    storage_url: string;
    file_type: string;
    version: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
};


export type BudgetRequestStatus = "pending" | "approved" | "rejected";

export type BudgetRequest = {
  id: string;
  campaign_id: string;
  campaign_name?: string;
  amount: number;
  status: BudgetRequestStatus;
  submitted_by: string; // User ID
  decision_by?: string; // User ID
  submitted_at: string; // ISO 8601 date string
  decision_at?: string; // ISO 8601 date string
  submitted_by_user?: Partial<User>;
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
    date: string; // ISO 8601
    amount: number;
    transfer_by: string;
    payment_method: string;
    transaction_id: string;
    purpose: string;
    leadId?: string;
    leadName?: string;
    status?: 'Completed' | 'Pending' | 'Failed';
};

export type AdSpend = {
    id: string;
    date: string; // ISO 8601
    platform: string;
    budget_allocated: number;
    actual_spend: number;
    campaign_id: string;
    campaign_name?: string;
};

export type NavItem = {
  title: string;
  href?: (role: string, encryptedUserId: string) => string;
  icon?: React.ElementType;
  roles: Role[];
  subItems?: Omit<NavItem, 'roles' | 'icon' | 'subItems' | 'type'>[];
  type?: 'heading';
};

export type InventoryResource = {
  name: string;
  count: number;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: string; // ISO 8601
  data?: Record<string, any>;
};

// --- CMS Types ---

export type SiteSettings = {
  theme_color?: string;
  logo?: string;
};

export type SiteSeo = {
  title_suffix?: string;
};

export type Site = {
  id: string;
  name: string;
  domain: string;
  api_key: string;
  settings: SiteSettings;
  seo_global: SiteSeo;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'verified' | 'failed' | 'active';
  verification_token?: string;
};


export type Category = {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  order: number;
  show_on_menu: boolean;
};

export type Page = {
    id: string;
    site_id: string;
    title: string;
    slug: string;
    content: string;
    location: 'header' | 'footer' | 'none';
    status: 'published' | 'draft';
    order: number;
    main_image?: string;
    seo: {
        meta_title?: string;
        meta_description?: string;
        og_image?: string;
    };
};

export type Post = {
    id: string;
    site_id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    category_id: string;
    tags: string[];
    status: 'published' | 'draft';
    video?: {
        url?: string;
        embed_code?: string;
    };
    seo: {
        meta_title?: string;
        keywords?: string;
    };
    featured_image_url?: string;
};

export type Ad = {
    id: string;
    site_id: string;
    space_key: string;
    type: 'image' | 'code';
    image_url?: string;
    target_url?: string;
    code_block?: string;
    status: 'active' | 'inactive';
};

// --- Analytics Types ---

export interface AdminDashboardKpi {
    value: number;
    label: string;
}

export interface AdminDashboardKpis {
    total_leads: AdminDashboardKpi;
    ad_spend: AdminDashboardKpi;
    active_users: AdminDashboardKpi;
    total_posts: AdminDashboardKpi;
    active_leads: AdminDashboardKpi;
    revenue: AdminDashboardKpi;
}

export interface AdminDashboardChartPoint {
    date: string;
    value: number;
}

export interface AdminDashboardCharts {
    leads_trend: AdminDashboardChartPoint[];
    revenue_trend: AdminDashboardChartPoint[];
    spend_trend: AdminDashboardChartPoint[];
}

export interface AdminDashboardRecentActivity {
    type: string;
    message: string;
    time: string;
}

export interface AdminDashboardData {
    meta: {
        startDate: string;
        endDate: string;
    };
    kpi: AdminDashboardKpis;
    funnel: Record<string, number>;
    charts: AdminDashboardCharts;
    recentActivity: AdminDashboardRecentActivity[];
}


// For Admission Manager
export interface Kpi {
    value: number | string;
    label: string;
}

export interface AdmissionManagerKpis {
    total_leads_period: Kpi;
    unassigned_leads: Kpi;
    conversions_period: Kpi;
    conversion_rate: Kpi;
}

export interface LeaderboardEntry {
    id: string;
    name: string;
    leads: number;
    conversions: number;
    conversionRate: number;
}

export interface ChartPoint {
    date: string;
    value: number;
}

export interface AdmissionManagerCharts {
    daily_leads: ChartPoint[];
    daily_conversions: ChartPoint[];
}

export interface AdmissionManagerDashboardData {
    meta: {
        startDate: string;
        endDate: string;
    };
    kpi: AdmissionManagerKpis;
    leaderboard: LeaderboardEntry[];
    source_breakdown: Record<string, number>;
    charts: AdmissionManagerCharts;
}

// For Admission Executive
export interface AdmissionExecutiveKpis {
    total_leads: Kpi;
    my_conversions: Kpi;
    performance_target?: Kpi; // The guide mentions this as '5/10 achieved'
    conversion_rate: Kpi; // Not in guide but useful, and exists in current code
    pending_followups: Kpi;
}

export interface AdmissionExecutiveTask {
    lead: {
        id: string;
        name: string;
        phone: string;
    };
    task_description: string;
    due_date: string;
    isOverdue: boolean;
}

export interface AdmissionExecutiveCharts {
    daily_leads: ChartPoint[];
    daily_conversions: ChartPoint[];
}

export interface AdmissionExecutiveDashboardData {
     meta: {
        startDate: string;
        endDate: string;
    };
    kpi: AdmissionExecutiveKpis;
    tasks: AdmissionExecutiveTask[];
    charts: AdmissionExecutiveCharts;
}
