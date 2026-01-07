import * as XLSX from 'xlsx';
import { FuelIssue, AfterSalesIssue } from '../types';

// Helper to find value by partial key match if exact match fails
const getValue = (row: any, possibleKeys: string[]): string => {
    const rowKeys = Object.keys(row);
    // Try exact match first
    for (const key of possibleKeys) {
        if (row[key] !== undefined) return String(row[key]);
    }
    // Try partial match
    for (const key of possibleKeys) {
        const foundKey = rowKeys.find(k => k.toLowerCase().includes(key.toLowerCase()));
        if (foundKey) return String(row[foundKey]);
    }
    return '';
};

// Helper to safely parse numbers from potential strings
const getNumber = (row: any, possibleKeys: string[]): number => {
    const val = getValue(row, possibleKeys);
    if (!val) return 0;
    // Remove non-numeric chars except dot (e.g., "100 Litres" -> 100)
    const cleanVal = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleanVal);
    return isNaN(num) ? 0 : num;
};

const parseDate = (val: any): string => {
    if (!val) return '';
    // Handle Excel serial date
    if (typeof val === 'number') {
        const date = new Date(Math.round((val - 25569) * 86400 * 1000));
        return date.toISOString();
    }
    // Handle string date
    const date = new Date(val);
    return !isNaN(date.getTime()) ? date.toISOString() : '';
};

export const parseExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                // raw: false forces parsing to strings which is safer for this dashboard view
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

export const mapToFuelIssues = (data: any[]): FuelIssue[] => {
    return data.map((row, index) => {
        const completionTime = getValue(row, ['Completion time', 'CompletionTime']);
        
        return {
            Id: getValue(row, ['Id', 'ID']) || `ROW-${index}`,
            StartTime: parseDate(getValue(row, ['Start time', 'StartTime'])),
            CompletionTime: completionTime ? parseDate(completionTime) : '',
            Name: getValue(row, ['Name']),
            CompanyName: getValue(row, ['Company Name', 'Customer/Partner']),
            State: getValue(row, ['State']),
            FuelTeamSPOC: getValue(row, ['Fuel Team SPOC']),
            Product: getValue(row, ['Product']),
            // Complex column mapping based on prompt
            ReportedIssue: getValue(row, ['Customer/Partner Reported Issue', 'Reported Issue']),
            InternalTeamReportedIssue: getValue(row, ['Internal Team Reported Issue', 'Internal Issue']),
            DetailedDescription: getValue(row, ['Describe the issue in detail', 'Description']),
            IssueList: getValue(row, ['Issue(s) List', 'Issue List']),
            Status: completionTime ? 'Resolved' : 'Pending',
            Remarks: getValue(row, ['Remarks']),
            AppType: getValue(row, ['Facing Issue with which app', 'App Type']),
            IssueFacedBy: getValue(row, ['Issue faced by', 'IssueFacedBy'])
        };
    });
};

export const mapToAfterSalesIssues = (data: any[]): AfterSalesIssue[] => {
    return data.map((row, index) => {
        return {
            Id: getValue(row, ['Id', 'ID']) || `ROW-${index}`,
            StartTime: parseDate(getValue(row, ['Start time', 'StartTime'])),
            CompletionTime: parseDate(getValue(row, ['Completion time', 'CompletionTime'])),
            Name: getValue(row, ['Name']),
            CompanyName: getValue(row, ['Company Name', 'Customer/Partner']),
            Email: getValue(row, ['Email']),
            AfterSalesSPOC: getValue(row, ['After Sales SPOC']),
            TechSupportSPOC: getValue(row, ['Tech Support Team SPOC']),
            WarrantyStatus: getValue(row, ['In Warranty or AMC', 'Warranty']) as any || 'Out of Warranty',
            State: getValue(row, ['State']),
            Product: getValue(row, ['Product']),
            IssueBuckets: getValue(row, ['Issue Buckets']),
            HardwareVersion: getValue(row, ['RATG Hardware Version', 'Hardware Version']),
            OperatorAppVersion: getValue(row, ['Operator App Version']),
            IssueList: getValue(row, ['Issue(s) List', 'Hardware Issue', 'Issue List']),
            FirmwareVersion: getValue(row, ['FCC Firmware Version', 'Firmware Version']),
            
            // New Columns Mapping
            RATGController: getValue(row, ['RATG Controller']),
            ManualDipLevel: getNumber(row, ['Manual Dip', 'ManualDip']),
            AppFuelLevel: getNumber(row, ['App Fuel Level', 'App', 'Fuel Level as visible']),
            DispenseOrderQty: getNumber(row, ['Dispense Order Quantity', 'Order Quantity']),
            DispensedQty: getNumber(row, ['Dispensed Quantity']),
            JobNumber: getValue(row, ['JOB Number', 'RFS', 'RFD']),
            Remarks: getValue(row, ['Remarks']),
            DUVendor: getValue(row, ['DU Vendor']),
            FCCHardwareVersion: getValue(row, ['FCC Hardware Version']),
            OrderID: getValue(row, ['Order ID']),
            ReasonFCCNotWorking: getValue(row, ['Reasons for FCC Not Working'])
        };
    });
};