// Centralized Mock Data for Documents, Timeline, and Dashboard

export interface FileRow {
  id: string;
  fileName: {
    name: string;
    icon: string;
  };
  version: string;
  uploader: {
    name: string;
    icon: string;
  };
  lastUpdated: string;
  dateCreated: string;
  status: "signed" | "inProgress" | "paid" | "sent";
  category: 'SoW' | 'Legal' | 'Billing' | 'Assets';
}

export interface FilterTag {
  label: 'SoW' | 'Legal' | 'Billing' | 'Assets';
  icon: string;
  activeIcon: string;
}

export type FilterType = 'Version' | 'Uploader' | 'Status' | 'Last Updated' | 'Date Created';

export interface FilterCategory {
  type: FilterType;
  label: string;
}

export interface MilestoneData {
  title: string;
  dueDate: string;
  assignedPerson: string;
  status: "revision" | "delivered" | "waiting" | "completed" | "inProgress";
}

export interface RecentUpdate {
  date: string;
  time: string;
  description: string;
  owner: string;
  status: 'past' | 'present' | 'future';
}

// ===== DOCUMENTS DATA =====
export const MOCK_FILES: FileRow[] = [
  {
    id: "1",
    fileName: { name: "Customer_Report_Q1.pdf", icon: "/documents/table-doc.svg" },
    version: "v1.0.3",
    uploader: { name: "Jane Doe", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-10T09:12:00Z",
    dateCreated: "2025-10-01T08:00:00Z",
    status: "signed",
    category: 'SoW',
  },
  {
    id: "2",
    fileName: { name: "Sales_Data_Export.csv", icon: "/documents/table-doc.svg" },
    version: "v2.1.0",
    uploader: { name: "John Smith", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-08T15:42:00Z",
    dateCreated: "2025-10-15T10:30:00Z",
    status: "inProgress",
    category: 'Billing',
  },
  {
    id: "3",
    fileName: { name: "Product_Images.zip", icon: "/documents/table-doc.svg" },
    version: "v3.4.1",
    uploader: { name: "Emily Carter", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-10-29T18:21:00Z",
    dateCreated: "2025-09-20T14:15:00Z",
    status: "paid",
    category: 'Assets',
  },
  {
    id: "4",
    fileName: { name: "Contract_Template.docx", icon: "/documents/table-doc.svg" },
    version: "v1.2.0",
    uploader: { name: "Efsora", icon: "/documents/table-people.svg" },
    lastUpdated: "2025-11-11T07:50:00Z",
    dateCreated: "2025-10-05T09:00:00Z",
    status: "sent",
    category: 'Legal',
  },
  {
    id: "5",
    fileName: { name: "Release_Notes.md", icon: "/documents/table-doc.svg" },
    version: "v5.0.0",
    uploader: { name: "Sarah Johnson", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-13T12:10:00Z",
    dateCreated: "2025-11-01T11:20:00Z",
    status: "sent",
    category: 'SoW',
  },
  {
    id: "6",
    fileName: { name: "Invoice_November.xlsx", icon: "/documents/table-doc.svg" },
    version: "v1.5.0",
    uploader: { name: "Michael Lee", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-12T11:30:00Z",
    dateCreated: "2025-10-28T13:45:00Z",
    status: "signed",
    category: 'Billing',
  },
  {
    id: "7",
    fileName: { name: "Brand_Guidelines.pdf", icon: "/documents/table-doc.svg" },
    version: "v2.0.0",
    uploader: { name: "Lisa Wong", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-09T14:15:00Z",
    dateCreated: "2025-09-10T16:00:00Z",
    status: "inProgress",
    category: 'Assets',
  },
  {
    id: "8",
    fileName: { name: "Legal_Agreement.pdf", icon: "/documents/table-doc.svg" },
    version: "v3.0.0",
    uploader: { name: "Robert Brown", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-14T10:00:00Z",
    dateCreated: "2025-10-12T12:30:00Z",
    status: "paid",
    category: 'Legal',
  },
  {
    id: "9",
    fileName: { name: "Company_Logo.png", icon: "/documents/table-doc.svg" },
    version: "v1.0.0",
    uploader: { name: "Lisa Wong", icon: "/documents/table-person.svg" },
    lastUpdated: "2025-11-11T16:45:00Z",
    dateCreated: "2025-09-15T09:00:00Z",
    status: "signed",
    category: 'Assets',
  },
];

export const FILTER_TAGS: FilterTag[] = [
  { label: 'SoW', icon: '/documents/sow-g.svg', activeIcon: '/documents/sow-w.svg' },
  { label: 'Legal', icon: '/documents/shield-g.svg', activeIcon: '/documents/shield-w.svg' },
  { label: 'Billing', icon: '/documents/biling-g.svg', activeIcon: '/documents/biling-w.svg' },
  { label: 'Assets', icon: '/documents/asset-g.svg', activeIcon: '/documents/asset-w.svg' },
];

export const FILTER_CATEGORIES: FilterCategory[] = [
  // { type: 'Version', label: 'Version' },
  { type: 'Uploader', label: 'Uploader' },
  { type: 'Status', label: 'Status' },
  { type: 'Last Updated', label: 'Last Updated' },
  { type: 'Date Created', label: 'Date Created' },
];

// ===== TIMELINE DATA =====
export const MILESTONES: MilestoneData[] = [
  {
    title: "Customer Report Q1 Review",
    dueDate: "10 Nov 2025",
    assignedPerson: "Jane Doe",
    status: "completed"
  },
  {
    title: "Sales Data Export Processing",
    dueDate: "08 Nov 2025",
    assignedPerson: "John Smith",
    status: "inProgress"
  },
  {
    title: "Product Images & Assets Delivery",
    dueDate: "29 Oct 2025",
    assignedPerson: "Emily Carter",
    status: "delivered"
  },
  {
    title: "Contract Template Finalization",
    dueDate: "11 Nov 2025",
    assignedPerson: "Efsora",
    status: "waiting"
  }
];

// ===== DASHBOARD DATA =====
export const ACTIVE_MILESTONE: MilestoneData = {
  title: "Sales Data Export Processing",
  dueDate: "08 Nov 2025",
  assignedPerson: "John Smith",
  status: "inProgress"
};

export const RECENT_UPDATES: RecentUpdate[] = [
  {
    date: 'Nov 14, 2025',
    time: '10:00 AM',
    description: 'Legal Agreement document signed and finalized.',
    owner: 'Robert Brown',
    status: 'past'
  },
  {
    date: 'Nov 12, 2025',
    time: '11:30 AM',
    description: 'Invoice for November processed and approved.',
    owner: 'Michael Lee',
    status: 'present'
  },
  {
    date: 'Nov 11, 2025',
    time: '4:45 PM',
    description: 'Company Logo asset finalized and signed off.',
    owner: 'Lisa Wong',
    status: 'future'
  }
];

// ===== HELPER FUNCTIONS =====
export const getUniqueVersions = () => [...new Set(MOCK_FILES.map(f => f.version))].sort();
export const getUniqueUploaders = () => [...new Set(MOCK_FILES.map(f => f.uploader.name))].sort();
export const getUniqueStatuses = () => [...new Set(MOCK_FILES.map(f => f.status))];

export const getLastUpdatedMonths = () => {
  const months = new Set(MOCK_FILES.map(f => {
    const date = new Date(f.lastUpdated);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }));
  return Array.from(months).sort();
};

export const getCreatedMonths = () => {
  const months = new Set(MOCK_FILES.map(f => {
    const date = new Date(f.dateCreated);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }));
  return Array.from(months).sort();
};

export const getFilterOptions = (type: FilterType): string[] => {
  switch (type) {
    // case 'Version':
    //   return getUniqueVersions();
    case 'Uploader':
      return getUniqueUploaders();
    case 'Status':
      return getUniqueStatuses().map(s =>
        s === 'signed' ? 'Signed' :
        s === 'inProgress' ? 'In Progress' :
        s === 'paid' ? 'Paid' :
        s === 'sent' ? 'Sent' : s
      );
    case 'Last Updated':
      return getLastUpdatedMonths();
    case 'Date Created':
      return getCreatedMonths();
    default:
      return [];
  }
};
