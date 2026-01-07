import React from 'react';
import { X, Calendar, User, FileText } from 'lucide-react';
import { FuelIssue } from '../types';
import { format } from 'date-fns';

interface DrillDownModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    issues: FuelIssue[];
    onRowClick: (issue: FuelIssue) => void;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    subtitle,
    issues, 
    onRowClick 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Table Content */}
                <div className="overflow-auto custom-scrollbar flex-1">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-100 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-3 whitespace-nowrap">ID</th>
                                <th className="px-6 py-3 whitespace-nowrap">Date</th>
                                <th className="px-6 py-3 whitespace-nowrap">Reported Issue</th>
                                <th className="px-6 py-3 whitespace-nowrap">Internal Note</th>
                                <th className="px-6 py-3 whitespace-nowrap">SPOC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map((row) => (
                                <tr 
                                    key={row.Id} 
                                    onClick={() => onRowClick(row)}
                                    className="bg-white border-b hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-900">#{row.Id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {row.StartTime ? format(new Date(row.StartTime), 'MMM d, yyyy') : '-'}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={row.ReportedIssue}>
                                        {row.ReportedIssue}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate italic text-slate-500" title={row.InternalTeamReportedIssue}>
                                        {row.InternalTeamReportedIssue || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-slate-400"/>
                                            {row.FuelTeamSPOC}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-medium">
                        Showing {issues.length} records
                    </span>
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Close List
                    </button>
                </div>
            </div>
        </div>
    );
};