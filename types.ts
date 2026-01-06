// types.ts

export enum SheetType {
    FUEL = 'FUEL',
    AFTER_SALES = 'AFTER_SALES'
}

// Matches "Fuel - Issue" Sheet
export interface FuelIssue {
    Id: string;
    StartTime: string;
    CompletionTime: string;
    Name: string;
    CompanyName: string;
    State: string;
    FuelTeamSPOC: string;
    Product: string;
    ReportedIssue: string; // From "Customer/Partner Reported Issue"
    IssueList: string; // "Issue(s) List"
    Status: 'Pending' | 'Resolved' | 'In Progress'; // Derived or simulated
    Remarks: string;
    AppType: string; // "Facing Issue with which app?"
}

// Matches "After Sales" Sheet
export interface AfterSalesIssue {
    Id: string;
    StartTime: string;
    CompletionTime: string;
    Name: string;
    CompanyName: string;
    Email: string;
    AfterSalesSPOC: string;
    TechSupportSPOC: string;
    WarrantyStatus: 'In Warranty' | 'AMC' | 'Out of Warranty'; // "In Warranty or AMC?"
    State: string;
    Product: string;
    IssueBuckets: string;
    HardwareVersion: string; // "RATG Hardware Version Installed"
    OperatorAppVersion: string;
    IssueList: string;
    FirmwareVersion: string; // "FCC Firmware Version"
}

export interface DashboardStats {
    totalIssues: number;
    resolvedToday: number;
    avgResolutionTimeHours: number;
    criticalPending: number;
}
