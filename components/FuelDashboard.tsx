import React, { useMemo } from 'react';
import { FuelIssue } from '../types';
import { StatCard } from './StatCard';
import { Activity, CheckCircle, AlertTriangle, AlertOctagon, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Props {
    data: FuelIssue[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const FuelDashboard: React.FC<Props> = ({ data }) => {
    
    const stats = useMemo(() => {
        const total = data.length;
        const resolved = data.filter(d => d.CompletionTime).length;
        const pending = total - resolved;
        
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
            resolved, 
            pending, 
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard 
                    title="Total Fuel Issues" 
                    value={stats.total} 
                    icon={Activity} 
                    color="blue" 
                    trend="+12% vs last week" 
                    trendUp={false}
                />
                <StatCard 
                    title="Pending Resolution" 
                    value={stats.pending} 
                    icon={AlertTriangle} 
                    color="orange" 
                />
                <StatCard 
                    title="Resolved Rate" 
                    value={`${stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%`} 
                    icon={CheckCircle} 
                    color="green" 
                    trend="+5%"
                    trendUp={true}
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
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
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
                                <tr key={row.Id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">#{row.Id}</td>
                                    <td className="px-6 py-4">{row.CompanyName}</td>
                                    <td className="px-6 py-4">{row.ReportedIssue}</td>
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
        </div>
    );
};