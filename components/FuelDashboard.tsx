import React, { useMemo, useState } from 'react';
import { FuelIssue } from '../types';
import { StatCard } from './StatCard';
import { IssueDetailModal } from './IssueDetailModal';
import { Activity, AlertOctagon, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Props {
    data: FuelIssue[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const FuelDashboard: React.FC<Props> = ({ data }) => {
    const [selectedIssue, setSelectedIssue] = useState<FuelIssue | null>(null);
    
    const stats = useMemo(() => {
        const total = data.length;
        
        // 1. Calculate Top Issue Types (Top 1 and Top 3 list)
        const issueCounts: Record<string, number> = {};
        data.forEach(d => {
            const issue = d.IssueList || 'Unspecified';
            issueCounts[issue] = (issueCounts[issue] || 0) + 1;
        });
        const sortedIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);
        
        // Main stat (Top 1)
        const topIssue = sortedIssues.length > 0 ? sortedIssues[0][0] : 'None';
        const topIssueCount = sortedIssues.length > 0 ? sortedIssues[0][1] : 0;

        // Expanded stats (Top 3)
        const top3Issues = sortedIssues.slice(0, 3).map(([name, count]) => ({
            label: name,
            value: count
        }));

        // 2. Calculate Top Affected Customers (Top 1 and Top 3 list)
        const customerCounts: Record<string, number> = {};
        data.forEach(d => {
            const customer = d.CompanyName || 'Unknown';
            customerCounts[customer] = (customerCounts[customer] || 0) + 1;
        });
        const sortedCustomers = Object.entries(customerCounts).sort((a, b) => b[1] - a[1]);
        
        // Main stat (Top 1)
        const topCustomer = sortedCustomers.length > 0 ? sortedCustomers[0][0] : 'None';
        const topCustomerCount = sortedCustomers.length > 0 ? sortedCustomers[0][1] : 0;

        // Expanded stats (Top 3)
        const top3Customers = sortedCustomers.slice(0, 3).map(([name, count]) => ({
            label: name,
            value: count
        }));
        
        return { 
            total, 
            topIssue, 
            topIssueCount, 
            top3Issues,
            topCustomer, 
            topCustomerCount,
            top3Customers 
        };
    }, [data]);

    const issuesByProduct = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(d => counts[d.Product] = (counts[d.Product] || 0) + 1);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [data]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Fuel Issues" 
                    value={stats.total} 
                    icon={Activity} 
                    color="blue" 
                />
                <StatCard 
                    title="Top Issue Type" 
                    value={stats.topIssue} 
                    icon={AlertOctagon} 
                    color="red" 
                    trend={`${stats.topIssueCount} reports`}
                    trendUp={false}
                    expandableItems={stats.top3Issues}
                />
                <StatCard 
                    title="Top Affected Customer" 
                    value={stats.topCustomer} 
                    icon={Building2} 
                    color="blue" 
                    trend={`${stats.topCustomerCount} tickets`}
                    trendUp={false}
                    expandableItems={stats.top3Customers}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issues by Product */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Issues by Product</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issuesByProduct}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Issues by App Type (Pie) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">App Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={issuesByProduct} // Reusing for demo
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {issuesByProduct.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

             {/* Recent Table Preview */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Recent Reported Issues</h3>
                    <span className="text-xs text-slate-400 font-medium">Click a row for full details</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Company</th>
                                <th className="px-6 py-3">Issue</th>
                                <th className="px-6 py-3">SPOC</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 5).map((row) => (
                                <tr 
                                    key={row.Id} 
                                    onClick={() => setSelectedIssue(row)}
                                    className="bg-white border-b hover:bg-blue-50/50 cursor-pointer transition-colors group"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-blue-600 transition-colors">#{row.Id}</td>
                                    <td className="px-6 py-4">{row.CompanyName}</td>
                                    <td className="px-6 py-4 max-w-xs truncate">{row.ReportedIssue}</td>
                                    <td className="px-6 py-4">{row.FuelTeamSPOC}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.Status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {row.Status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <IssueDetailModal 
                isOpen={!!selectedIssue} 
                onClose={() => setSelectedIssue(null)} 
                data={selectedIssue}
                title="Fuel Issue"
            />
        </div>
    );
};