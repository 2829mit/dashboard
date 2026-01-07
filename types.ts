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
    InternalTeamReportedIssue: string; // NEW: "Internal Team Reported Issue"
    DetailedDescription: string; // NEW: "Describe the issue in detail"
    IssueList: string; // "Issue(s) List"
    Status: 'Pending' | 'Resolved' | 'In Progress'; // Derived or simulated
    Remarks: string;
    AppType: string; // "Facing Issue with which app?"
    IssueFacedBy: string; // "Issue faced by" - 'Fuel Team' | 'Customer/Partner'
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
    
    // New Columns
    RATGController: string;
    ManualDipLevel: number; // "RATG - Fuel Level as reported by Manual Dip"
    AppFuelLevel: number; // "RATG - Fuel Level as visible in the App"
    DispenseOrderQty: number; // "Dispense Order Quantity"
    DispensedQty: number; // "Dispensed Quantity"
    JobNumber: string; // "RFS/RFD/RPS JOB Number"
    Remarks: string;
    DUVendor: string;
    FCCHardwareVersion: string;
    OrderID: string;
    ReasonFCCNotWorking: string;
}

export interface DashboardStats {
    totalIssues: number;
    resolvedToday: number;
    avgResolutionTimeHours: number;
    criticalPending: number;
}