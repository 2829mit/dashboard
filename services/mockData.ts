import { FuelIssue, AfterSalesIssue } from '../types';

// Helpers
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generateId = () => Math.floor(Math.random() * 10000).toString();

// Date helpers to replace date-fns
const subDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

const subHours = (date: Date, hours: number): Date => {
    const result = new Date(date);
    result.setHours(result.getHours() - hours);
    return result;
};

const COMPANIES = ['Repos Energy', 'Tata Power', 'Mahindra Logistics', 'Amazon Transportation', 'Blue Dart'];
const STATES = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat'];
const PRODUCTS = ['Mobile Petrol Pump', 'DATUM', 'Zap', 'Repos App'];
const SPOCS_FUEL = ['Aditya R.', 'Rahul S.', 'Sneha P.', 'Vikram M.'];
const SPOCS_SALES = ['Priya K.', 'Amit B.', 'Rohan J.'];

const TECH_ISSUES_LIST = [
    'Bluetooth Connectivity Issue; Order Stuck',
    'Finish Button Disabled',
    'Live Fuel Stock Inaccuracy (ATG Issue)',
    'Wrong Total Outstanding; Quantity Mismatch Issue',
    'Backend Corrections; Point Jump Issue',
    'Application (Define in detail)',
    'Engineering (Define in detail)'
];

const INTERNAL_ISSUES = [
    'Ble connection timeout',
    'API 500 Error',
    'Sensor recalibration needed',
    'User permission denied',
    'Firmware outdated'
];

export const generateFuelData = (count: number): FuelIssue[] => {
    return Array.from({ length: count }).map((_, i) => {
        // Changed from 10 to 120 days to show monthly trends
        const start = subDays(new Date(), Math.floor(Math.random() * 120));
        const end = Math.random() > 0.3 ? subHours(start, -Math.floor(Math.random() * 48)) : '';
        const issueList = getRandomElement(TECH_ISSUES_LIST);
        
        return {
            Id: generateId(),
            StartTime: start.toISOString(),
            CompletionTime: end ? end.toISOString() : '',
            Name: `User ${i + 1}`,
            CompanyName: getRandomElement(COMPANIES),
            State: getRandomElement(STATES),
            FuelTeamSPOC: getRandomElement(SPOCS_FUEL),
            Product: getRandomElement(PRODUCTS),
            ReportedIssue: getRandomElement(['OTP Not Received', 'Data Mismatch', 'Bluetooth Fail', 'Dispense Error']),
            InternalTeamReportedIssue: getRandomElement(INTERNAL_ISSUES),
            DetailedDescription: 'Logs show intermittent packet loss during dispense cycle.',
            IssueList: issueList,
            Status: end ? 'Resolved' : 'Pending',
            Remarks: 'Investigating issue...',
            AppType: getRandomElement(['Operator App', 'Partner App', 'Manager App']),
            IssueFacedBy: getRandomElement(['Fuel Team', 'Customer/Partner'])
        };
    });
};

export const generateAfterSalesData = (count: number): AfterSalesIssue[] => {
    return Array.from({ length: count }).map((_, i) => {
        // Changed from 14 to 120 days
        const start = subDays(new Date(), Math.floor(Math.random() * 120));
        const end = Math.random() > 0.4 ? subHours(start, -Math.floor(Math.random() * 72)) : '';

        // Generate calibration data with occasional discrepancy
        const manualDip = Math.floor(Math.random() * 500) + 100;
        const isCalibError = Math.random() > 0.8;
        const appLevel = isCalibError ? manualDip + (Math.random() * 50 - 25) : manualDip + (Math.random() * 4 - 2);

        // Generate dispense data with occasional mismatch
        const orderQty = Math.floor(Math.random() * 200) + 20;
        const dispensedQty = Math.random() > 0.9 ? orderQty - (Math.random() * 5) : orderQty;

        const reasonFCC = Math.random() > 0.7 ? getRandomElement([
            'Power fluctuation', 'SIM Card Issue', 'Firmware Crash', 'Physical Damage', 'Unknown'
        ]) : '';

        return {
            Id: generateId(),
            StartTime: start.toISOString(),
            CompletionTime: end ? end.toISOString() : '',
            Name: `Client ${i + 1}`,
            CompanyName: getRandomElement(COMPANIES),
            Email: `contact${i}@example.com`,
            AfterSalesSPOC: getRandomElement(SPOCS_SALES),
            TechSupportSPOC: getRandomElement(SPOCS_FUEL),
            WarrantyStatus: getRandomElement(['In Warranty', 'AMC', 'Out of Warranty']),
            State: getRandomElement(STATES),
            Product: getRandomElement(PRODUCTS),
            IssueBuckets: getRandomElement(['Critical', 'Major', 'Minor']),
            HardwareVersion: `v${Math.floor(Math.random() * 5)}.0`,
            OperatorAppVersion: `2.${Math.floor(Math.random() * 9)}.1`,
            IssueList: getRandomElement(['Sensor Fail', 'Controller Offline', 'Calibration Required']),
            FirmwareVersion: `FW-202${Math.floor(Math.random() * 4)}`,

            // New Data
            RATGController: getRandomElement(['Controller A', 'Controller B', 'Controller Pro']),
            ManualDipLevel: parseFloat(manualDip.toFixed(1)),
            AppFuelLevel: parseFloat(appLevel.toFixed(1)),
            DispenseOrderQty: orderQty,
            DispensedQty: parseFloat(dispensedQty.toFixed(1)),
            JobNumber: `JOB-${Math.floor(Math.random() * 8888)}`,
            Remarks: 'Remote diagnosis initiated.',
            DUVendor: getRandomElement(['Vendor X', 'Vendor Y', 'Global Tech']),
            FCCHardwareVersion: `FCC-v${Math.floor(Math.random() * 3)}.0`,
            OrderID: `ORD-${Math.floor(Math.random() * 5555)}`,
            ReasonFCCNotWorking: reasonFCC
        };
    });
};