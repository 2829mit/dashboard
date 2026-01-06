import { FuelIssue, AfterSalesIssue } from '../types';
import { generateFuelData, generateAfterSalesData } from './mockData';

// In a real production app, this would use the Microsoft Graph Client
// import { Client } from "@microsoft/microsoft-graph-client";

interface DataResponse {
    fuelData: FuelIssue[];
    afterSalesData: AfterSalesIssue[];
    lastSynced: Date;
}

// Simulating API Latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchDashboardData = async (): Promise<DataResponse> => {
    // Simulate network request
    await delay(800); 

    // NOTE: This is where we would fetch from SharePoint using Graph API
    // const client = Client.init({ authProvider: ... });
    // const fuelSheet = await client.api('/drives/{drive-id}/items/{item-id}/workbook/worksheets/{id}/range(address=\'A1:Z100\')').get();

    return {
        fuelData: generateFuelData(45), // Generate 45 random rows
        afterSalesData: generateAfterSalesData(35), // Generate 35 random rows
        lastSynced: new Date()
    };
};
