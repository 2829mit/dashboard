import React, { useMemo, useState } from 'react';
import { AfterSalesIssue } from '../types';
import { StatCard } from './StatCard';
import { IssueDetailModal } from './IssueDetailModal';
import { ShieldAlert, Cpu, Server, Scale, Factory, Radio, CheckCircle2, AlertTriangle, CircuitBoard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface Props {
    data: AfterSalesIssue[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const SEVERITY_COLORS: Record<string, string> = {
    'Critical': '#ef4444', // Red
    'Major': '#f97316',    // Orange
    'Minor': '#3b82f6',    // Blue
    'Unspecified': '#94a3b8' // Slate
};

export const AfterSalesDashboard: React.FC<Props> = ({ data }) => {
    const [selectedIssue, setSelectedIssue] = useState<AfterSalesIssue | null>(null);
    
    const stats = useMemo(() => {
        const total = data.length;
        const warranty = data.filter(d => d.WarrantyStatus === 'In Warranty').length;
        const amc = data.filter(d => d.WarrantyStatus === 'AMC').length;
        const critical = data.filter(d => d.IssueBuckets === 'Critical').length;
        
        // Calibration Issues: Where variance between App and Manual Dip is > 5%
        const calibrationIssues = data.filter(d => {
            if(!d.ManualDipLevel || !d.AppFuelLevel) return false;
            const diff = Math.abs(d.ManualDipLevel - d.AppFuelLevel);
            const pct = (diff / d.ManualDipLevel) * 100;
            return pct > 5;
        }).length;

        return { total, warranty, amc, critical, calibrationIssues };
    }, [data]);

    // Data for Vendor Distribution (Simple Bar)
    const vendorData = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(d => {
            const v = d.DUVendor || 'Unknown';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [data]);

    // Data for FCC Reasons (Pie)
    const fccData = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(d => {
            if (d.ReasonFCCNotWorking) {
                counts[d.ReasonFCCNotWorking] = (counts[d.ReasonFCCNotWorking] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [data]);

    // Data for Severity Bucket
    const severityData = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(d => {
            const bucket = d.IssueBuckets || 'Unspecified';
            counts[bucket] = (counts[bucket] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1]) // Sort descending
            .map(([name, value]) => ({ name, value }));
    }, [data]);

    // Data for Hardware Version
    const hardwareVersionData = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(d => {
            const version = d.HardwareVersion || 'Unknown';
            counts[version] = (counts[version] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1]) // Sort descending
            .map(([name, value]) => ({ name, value }));
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
                    title="Calibration Alerts" 
                    value={stats.calibrationIssues} 
                    icon={Scale} 
                    color="orange" 
                    trend={stats.calibrationIssues > 5 ? "High Variance" : "Stable"}
                    trendUp={stats.calibrationIssues <= 5}
                />
                <StatCard 
                    title="In Warranty" 
                    value={stats.warranty} 
                    icon={ShieldAlert} 
                    color="green" 
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

            {/* Severity & Hardware Version Section (RESTORED) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Issue Severity Bucket */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertTriangle className="text-orange-500" size={20} />
                        <h3 className="text-lg font-bold text-slate-800">Issue Severity Buckets</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={severityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {severityData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={SEVERITY_COLORS[entry.name] || COLORS[index % COLORS.length]} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Issues By Hardware Version */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <CircuitBoard className="text-purple-500" size={20} />
                        <h3 className="text-lg font-bold text-slate-800">Issues By Hardware Version</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hardwareVersionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Hardware & FCC Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Vendor Analysis */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Factory className="text-slate-400" size={20} />
                        <h3 className="text-lg font-bold text-slate-800">DU Vendor Issues</h3>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={vendorData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* FCC Issues */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Radio className="text-red-400" size={20} />
                        <h3 className="text-lg font-bold text-slate-800">FCC Failures</h3>
                    </div>
                    {fccData.length > 0 ? (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={fccData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {fccData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconSize={8} fontSize={10}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                            <CheckCircle2 size={32} className="mb-2 text-green-500" />
                            <p>No FCC Issues Reported</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Table Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Detailed Hardware Report</h3>
                    <span className="text-xs text-slate-400 font-medium">Click a row for full details</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Job #</th>
                                <th className="px-6 py-3">Vendor</th>
                                <th className="px-6 py-3">Controller</th>
                                <th className="px-6 py-3">Manual Dip</th>
                                <th className="px-6 py-3">App Level</th>
                                <th className="px-6 py-3 text-right">Variance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 10).map((row) => {
                                const variance = Math.abs((row.ManualDipLevel || 0) - (row.AppFuelLevel || 0));
                                const isHighVariance = variance > (row.ManualDipLevel * 0.05); // > 5%

                                return (
                                    <tr 
                                        key={row.Id} 
                                        onClick={() => setSelectedIssue(row)}
                                        className="bg-white border-b hover:bg-blue-50/50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-900 group-hover:text-blue-600 transition-colors">#{row.Id}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{row.JobNumber || '-'}</td>
                                        <td className="px-6 py-4">{row.DUVendor || '-'}</td>
                                        <td className="px-6 py-4">{row.RATGController || '-'}</td>
                                        <td className="px-6 py-4">{row.ManualDipLevel || 0}</td>
                                        <td className="px-6 py-4">{row.AppFuelLevel || 0}</td>
                                        <td className={`px-6 py-4 text-right font-bold ${isHighVariance ? 'text-red-500' : 'text-green-500'}`}>
                                            {variance.toFixed(1)} L
                                        </td>
                                    </tr>
                                );
                            })}
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