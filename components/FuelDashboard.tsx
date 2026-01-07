import React, { useMemo, useState } from 'react';
import { FuelIssue } from '../types';
import { StatCard } from './StatCard';
import { IssueDetailModal } from './IssueDetailModal';
import { DrillDownModal } from './DrillDownModal'; // Import the new modal
import { Activity, AlertOctagon, Building2, Calendar, Smartphone, Cpu, Wifi, RefreshCw, Layers, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

interface Props {
    data: FuelIssue[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

// Tech Layer Colors
const TECH_COLORS = {
    App: '#3b82f6', // Blue
    Hardware: '#ef4444', // Red
    Connectivity: '#f59e0b', // Orange
    DataSync: '#10b981', // Green
    Other: '#94a3b8' // Slate
};

// Helper to truncate long strings for chart labels
const truncate = (str: string, length: number = 15) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
};

// Helper to split semicolon separated issues
const getIndividualIssues = (issueListStr: string): string[] => {
    if (!issueListStr) return ['Unspecified'];
    // Split by semicolon, trim, and filter out empty strings
    return issueListStr
        .split(/[;]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.toLowerCase() !== 'null' && s.toLowerCase() !== 'undefined');
};

// Categorize issues into Tech Layers
const getTechLayer = (issue: string): string => {
    const lower = issue.toLowerCase();
    if (lower.includes('app') || lower.includes('software') || lower.includes('finish button') || lower.includes('order stuck') || lower.includes('otp')) return 'App';
    if (lower.includes('atg') || lower.includes('sensor') || lower.includes('battery') || lower.includes('hardware') || lower.includes('pump')) return 'Hardware';
    if (lower.includes('bluetooth') || lower.includes('connectivity') || lower.includes('network') || lower.includes('offline')) return 'Connectivity';
    if (lower.includes('sync') || lower.includes('data') || lower.includes('mismatch') || lower.includes('backend') || lower.includes('correction')) return 'Data Sync';
    return 'Other';
};

export const FuelDashboard: React.FC<Props> = ({ data }) => {
    const [selectedIssue, setSelectedIssue] = useState<FuelIssue | null>(null);
    
    // State for Drill Down Modal
    const [drillDownInfo, setDrillDownInfo] = useState<{
        isOpen: boolean;
        title: string;
        issues: FuelIssue[];
    }>({ isOpen: false, title: '', issues: [] });
    
    const stats = useMemo(() => {
        // 1. Calculate Top Issue Types (splitting multi-values for accuracy)
        // AND Calculate Total Detected Issues (sum of all splits)
        const issueCounts: Record<string, number> = {};
        let totalDetectedIssues = 0;

        data.forEach(d => {
            const issues = getIndividualIssues(d.IssueList);
            issues.forEach(issue => {
                issueCounts[issue] = (issueCounts[issue] || 0) + 1;
                totalDetectedIssues++;
            });
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

        // 2. Calculate Top Affected Customers
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

        // 3. Average Daily Issues (Based on tickets/rows, not split issues, as date applies to the ticket)
        const uniqueDates = new Set(data
            .filter(d => d.StartTime)
            .map(d => {
                try {
                    return new Date(d.StartTime).toISOString().split('T')[0];
                } catch {
                    return null;
                }
            })
            .filter(Boolean)
        ).size;
        
        // We use totalDetectedIssues for consistency with the first KPI
        const avgDaily = uniqueDates > 0 ? (totalDetectedIssues / uniqueDates).toFixed(1) : "0";
        
        return { 
            total: totalDetectedIssues, // UPDATED: Now uses sum of detected issues, not row count
            topIssue, 
            topIssueCount, 
            top3Issues,
            topCustomer, 
            topCustomerCount,
            top3Customers,
            avgDaily
        };
    }, [data]);

    const issuesByProduct = useMemo(() => {
        const counts: Record<string, number> = {};
        data.forEach(d => counts[d.Product] = (counts[d.Product] || 0) + 1);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [data]);

    // Technology Health Index Metrics
    const { techLayerData, repeatFailures } = useMemo(() => {
        const layerCounts: Record<string, number> = { App: 0, Hardware: 0, Connectivity: 0, 'Data Sync': 0, Other: 0 };
        const companyIssueMap: Record<string, Set<string>> = {};
        // Map to store details for repeat failures: key -> { count, issue, ids[] }
        const repeatDetailsMap: Record<string, { count: number, issue: string, ids: string[] }> = {};

        data.forEach(d => {
            const issues = getIndividualIssues(d.IssueList);
            const company = d.CompanyName || 'Unknown';
            
            issues.forEach(issue => {
                // 1. Layer Classification
                const layer = getTechLayer(issue);
                if (layer === 'Data Sync') layerCounts['Data Sync']++;
                else if (layerCounts[layer] !== undefined) layerCounts[layer]++;
                else layerCounts['Other']++;

                // 2. Repeat Failure Detection
                const key = `${company}|${issue}`;
                
                // Always track this ID for this key (used for drill down)
                if (!repeatDetailsMap[key]) {
                    repeatDetailsMap[key] = { count: 0, issue: issue, ids: [] };
                }
                repeatDetailsMap[key].count++;
                repeatDetailsMap[key].ids.push(d.Id);
            });
        });

        const formattedLayers = Object.entries(layerCounts)
            .filter(([_, value]) => value > 0)
            .map(([name, value]) => ({ name, value }));

        // Filter for true repeats (count > 1) and sort
        const sortedRepeats = Object.entries(repeatDetailsMap)
            .filter(([_, val]) => val.count > 1)
            .map(([key, val]) => ({
                company: key.split('|')[0],
                issue: val.issue,
                count: val.count,
                ids: val.ids
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5 Repeat Offenders

        return { techLayerData: formattedLayers, repeatFailures: sortedRepeats };
    }, [data]);

    // Handler for clicking a Repeat Failure row
    const handleRepeatClick = (company: string, issue: string, ids: string[]) => {
        // Filter the main data to find all issues with these IDs
        const relevantIssues = data.filter(d => ids.includes(d.Id));
        setDrillDownInfo({
            isOpen: true,
            title: `${company} - ${issue}`,
            issues: relevantIssues
        });
    };

    // Handler for clicking a Tech Layer statistic
    const handleLayerClick = (layerName: string) => {
        // Filter data to find any row that contains an issue belonging to this layer
        const relevantIssues = data.filter(d => {
            const issues = getIndividualIssues(d.IssueList);
            return issues.some(issue => getTechLayer(issue) === layerName);
        });

        setDrillDownInfo({
            isOpen: true,
            title: `${layerName} Issues`,
            issues: relevantIssues
        });
    };

    // Calculate Average Issues per Customer per Month
    const monthlyTrendData = useMemo(() => {
        const grouped = new Map<string, { count: number, customers: Set<string> }>();

        data.forEach(d => {
            if (!d.StartTime) return;
            try {
                const date = new Date(d.StartTime);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
                
                if (!grouped.has(key)) {
                    grouped.set(key, { count: 0, customers: new Set() });
                }
                
                const entry = grouped.get(key)!;
                // Count individual issues for trend intensity
                const issueCount = getIndividualIssues(d.IssueList).length;
                entry.count += issueCount;
                
                if (d.CompanyName) entry.customers.add(d.CompanyName);
            } catch (e) { }
        });

        // Convert to array and sort by date
        return Array.from(grouped.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, value]) => {
                const [year, month] = key.split('-');
                const dateObj = new Date(parseInt(year), parseInt(month) - 1);
                const avg = value.customers.size > 0 ? (value.count / value.customers.size) : 0;
                
                return {
                    name: dateObj.toLocaleString('default', { month: 'short', year: '2-digit' }), // e.g. "Jan 24"
                    avg: parseFloat(avg.toFixed(1)),
                    totalIssues: value.count,
                    uniqueCustomers: value.customers.size
                };
            });
    }, [data]);

    // New Metric: Issue Type vs Product (Stacked Bar Chart)
    const { productIssueData, topIssueTypes } = useMemo(() => {
        // 1. Identify Global Top 5 Issues to limit legend and complexity
        const globalIssueCounts: Record<string, number> = {};
        data.forEach(d => {
            const issues = getIndividualIssues(d.IssueList);
            issues.forEach(i => globalIssueCounts[i] = (globalIssueCounts[i] || 0) + 1);
        });
        
        const top5Issues = Object.entries(globalIssueCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);

        // 2. Build Stacked Data
        const productMap: Record<string, any> = {};
        
        data.forEach(d => {
            const product = d.Product || 'Unknown';
            if (!productMap[product]) {
                productMap[product] = { name: product };
            }
            
            const issues = getIndividualIssues(d.IssueList);
            issues.forEach(issue => {
                // If this issue is in Top 5, use its name, otherwise bucket into "Others"
                const key = top5Issues.includes(issue) ? issue : 'Others';
                productMap[product][key] = (productMap[product][key] || 0) + 1;
            });
        });

        return { 
            productIssueData: Object.values(productMap), 
            topIssueTypes: [...top5Issues, 'Others'] // These will be our stack keys
        };
    }, [data]);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Detected Faults" 
                    value={stats.total} 
                    icon={Activity} 
                    color="blue" 
                />
                 <StatCard 
                    title="Avg Daily Faults" 
                    value={stats.avgDaily} 
                    icon={Calendar} 
                    color="orange" 
                />
                <StatCard 
                    title="Top Issue Type" 
                    value={truncate(stats.topIssue, 20)} 
                    icon={AlertOctagon} 
                    color="red" 
                    trend={`${stats.topIssueCount} reports`}
                    trendUp={false}
                    expandableItems={stats.top3Issues}
                />
                <StatCard 
                    title="Top Affected Customer" 
                    value={truncate(stats.topCustomer, 20)} 
                    icon={Building2} 
                    color="blue" 
                    trend={`${stats.topCustomerCount} tickets`}
                    trendUp={false}
                    expandableItems={stats.top3Customers}
                />
            </div>

            {/* TECHNOLOGY HEALTH INDEX SECTION */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-700 pb-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                        <Layers className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Technology Health Index</h2>
                        <p className="text-slate-400 text-sm">System-wide performance based on issue layers and recurring failures</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Layer 1: Tech Layer Distribution */}
                    <div className="lg:col-span-1 flex flex-col items-center justify-center">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Issues by Tech Layer</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={techLayerData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {techLayerData.map((entry, index) => {
                                            const colorKey = entry.name.replace(' ', '') as keyof typeof TECH_COLORS;
                                            return <Cell key={`cell-${index}`} fill={TECH_COLORS[colorKey] || TECH_COLORS.Other} />
                                        })}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Layer 2: Breakdown Stats */}
                    <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                        <div 
                            onClick={() => handleLayerClick('App')}
                            className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-700/50 transition-colors group"
                        >
                            <Smartphone className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-2xl font-bold">{techLayerData.find(l => l.name === 'App')?.value || 0}</span>
                            <span className="text-xs text-slate-400 uppercase">App Issues</span>
                        </div>
                        <div 
                            onClick={() => handleLayerClick('Hardware')}
                            className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-700/50 transition-colors group"
                        >
                            <Cpu className="text-red-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-2xl font-bold">{techLayerData.find(l => l.name === 'Hardware')?.value || 0}</span>
                            <span className="text-xs text-slate-400 uppercase">Hardware</span>
                        </div>
                         <div 
                            onClick={() => handleLayerClick('Connectivity')}
                            className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-700/50 transition-colors group"
                        >
                            <Wifi className="text-orange-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-2xl font-bold">{techLayerData.find(l => l.name === 'Connectivity')?.value || 0}</span>
                            <span className="text-xs text-slate-400 uppercase">Connectivity</span>
                        </div>
                         <div 
                            onClick={() => handleLayerClick('Data Sync')}
                            className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-700/50 transition-colors group"
                        >
                            <RefreshCw className="text-green-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
                            <span className="text-2xl font-bold">{techLayerData.find(l => l.name === 'Data Sync')?.value || 0}</span>
                            <span className="text-xs text-slate-400 uppercase">Data Sync</span>
                        </div>
                    </div>

                    {/* Layer 3: Repeat Failures */}
                    <div className="lg:col-span-1 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-700 bg-slate-800">
                            <h3 className="text-sm font-bold text-slate-300 uppercase flex items-center gap-2">
                                <Activity size={16} className="text-red-400" /> Repeat Tech Failures
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                            {repeatFailures.length > 0 ? (
                                <div className="space-y-2">
                                    {repeatFailures.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            onClick={() => handleRepeatClick(item.company, item.issue, item.ids)}
                                            className="flex justify-between items-center p-3 hover:bg-slate-700/80 rounded-lg transition-all cursor-pointer group"
                                            title="Click to view detailed list"
                                        >
                                            <div className="overflow-hidden">
                                                <p className="font-semibold text-sm truncate group-hover:text-blue-300 transition-colors">{item.company}</p>
                                                <p className="text-xs text-slate-400 truncate w-48" title={item.issue}>{item.issue}</p>
                                            </div>
                                            <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                                                {item.count}x
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                    No repeat failures detected
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW: Monthly Trend Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="text-blue-600" size={24} />
                    <h3 className="text-lg font-bold text-slate-800">Average Issue Intensity per Customer</h3>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [`${value} faults`, 'Avg Faults per Customer']}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="avg" 
                                stroke="#3b82f6" 
                                strokeWidth={3} 
                                dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} 
                                activeDot={{r: 6}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                    Shows the average number of specific technical faults per customer ticket over time.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issues by Product */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Issues by Product</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issuesByProduct}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(val) => truncate(val, 10)}
                                />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* App Breakdown Chart (Pie) */}
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

            {/* Issue Type vs Product Stacked Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Top 5 Issue Types vs Product</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productIssueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(val) => truncate(val, 12)} 
                            />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            {topIssueTypes.map((type, index) => (
                                <Bar 
                                    key={type} 
                                    dataKey={type} 
                                    stackId="a" 
                                    fill={type === 'Others' ? '#cbd5e1' : COLORS[index % COLORS.length]} 
                                    name={truncate(type, 25)}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
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
                                <th className="px-6 py-3 whitespace-nowrap">ID</th>
                                <th className="px-6 py-3 whitespace-nowrap">Company</th>
                                <th className="px-6 py-3 whitespace-nowrap">Issue</th>
                                <th className="px-6 py-3 whitespace-nowrap">Internal Note</th>
                                <th className="px-6 py-3 whitespace-nowrap">SPOC</th>
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
                                    <td className="px-6 py-4 max-w-[150px] truncate" title={row.CompanyName}>{row.CompanyName}</td>
                                    <td className="px-6 py-4 max-w-[200px] truncate" title={row.ReportedIssue}>{row.ReportedIssue}</td>
                                    <td className="px-6 py-4 max-w-[200px] truncate text-slate-500 italic">{row.InternalTeamReportedIssue || '-'}</td>
                                    <td className="px-6 py-4 max-w-[100px] truncate">{row.FuelTeamSPOC}</td>
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

            <DrillDownModal 
                isOpen={drillDownInfo.isOpen}
                onClose={() => setDrillDownInfo(prev => ({ ...prev, isOpen: false }))}
                title={drillDownInfo.title}
                subtitle="Detailed list of filtered occurrences"
                issues={drillDownInfo.issues}
                onRowClick={(issue) => {
                    // Close drill down and open detail view for specific issue
                    setDrillDownInfo(prev => ({ ...prev, isOpen: false }));
                    setSelectedIssue(issue);
                }}
            />
        </div>
    );
};