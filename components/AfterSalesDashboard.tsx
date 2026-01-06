import React, { useMemo, useState } from 'react';
import { AfterSalesIssue } from '../types';
import { StatCard } from './StatCard';
import { IssueDetailModal } from './IssueDetailModal';
import { ShieldAlert, Wrench, Users, Cpu, Server } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Props {
    data: AfterSalesIssue[];
}

export const AfterSalesDashboard: React.FC<Props> = ({ data }) => {
    const [selectedIssue, setSelectedIssue] = useState<AfterSalesIssue | null>(null);
    
    const stats = useMemo(() => {
        const total = data.length;
        const warranty = data.filter(d => d.WarrantyStatus === 'In Warranty').length;
        const amc = data.filter(d => d.WarrantyStatus === 'AMC').length;
        const critical = data.filter(d => d.IssueBuckets === 'Critical').length;
        
        return { total, warranty, amc, critical };
    }, [data]);

    const issuesByHardware = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(d => counts[d.HardwareVersion] = (counts[d.HardwareVersion] || 0) + 1);
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => a.name.localeCompare(b.name));
    }, [data]);

    const issuesByBucket = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(d => counts[d.IssueBuckets] = (counts[d.IssueBuckets] || 0) + 1);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [data]);

    return (
        <div className="space-y-6 animate-fade-in">
             {/* KPI Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Active Tickets" 
                    value={stats.total} 
                    icon={Server} 
                    color="blue" 
                />
                <StatCard 
                    title="In Warranty" 
                    value={stats.warranty} 
                    icon={ShieldAlert} 
                    color="green" 
                    trend="Healthy"
                    trendUp={true}
                />
                <StatCard 
                    title="AMC Clients" 
                    value={stats.amc} 
                    icon={Users} 
                    color="orange" 
                />
                 <StatCard 
                    title="Critical H/W Issues" 
                    value={stats.critical} 
                    icon={Cpu} 
                    color="red" 
                    trend="Requires Action"
                    trendUp={false}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hardware Version Analysis */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Issues by Hardware Version</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={issuesByHardware}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={3} dot={{r: 4}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Issue Buckets */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Issue Severity Buckets</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issuesByBucket} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Hardware Table Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Hardware & Firmware Status</h3>
                    <span className="text-xs text-slate-400 font-medium">Click a row for full details</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">H/W Version</th>
                                <th className="px-6 py-3">F/W Version</th>
                                <th className="px-6 py-3">Issue List</th>
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
                                    <td className="px-6 py-4">{row.Product}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{row.HardwareVersion}</td>
                                    <td className="px-6 py-4 font-mono text-xs">{row.FirmwareVersion}</td>
                                    <td className="px-6 py-4 text-red-600 truncate max-w-xs">{row.IssueList}</td>
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
                title="After Sales Issue"
            />
        </div>
    );
};