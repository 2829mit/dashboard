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

export const generateFuelData = (count: number): FuelIssue[] => {
    return Array.from({ length: count }).map((_, i) => {
        const start = subDays(new Date(), Math.floor(Math.random() * 10));
        const end = Math.random() > 0.3 ? subHours(start, -Math.floor(Math.random() * 48)) : '';
        
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
            IssueList: getRandomElement(['Connectivity', 'Hardware', 'Software', 'User Error']),
            Status: end ? 'Resolved' : 'Pending',
            Remarks: 'Investigating issue...',
            AppType: getRandomElement(['Operator App', 'Partner App', 'Manager App']),
            IssueFacedBy: getRandomElement(['Fuel Team', 'Customer/Partner'])
        };
    });
};

export const generateAfterSalesData = (count: number): AfterSalesIssue[] => {
    return Array.from({ length: count }).map((_, i) => {
        const start = subDays(new Date(), Math.floor(Math.random() * 14));
        const end = Math.random() > 0.4 ? subHours(start, -Math.floor(Math.random() * 72)) : '';

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
            FirmwareVersion: `FW-202${Math.floor(Math.random() * 4)}`
        };
    });
};