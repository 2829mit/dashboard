import React from 'react';
import { X, Calendar, Hash, User, Building, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface IssueDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any | null; // Can be FuelIssue or AfterSalesIssue
    title: string;
}

/**
 * Helper to format camelCase keys into Title Case
 * e.g., "FuelTeamSPOC" -> "Fuel Team SPOC"
 */
const formatKey = (key: string): string => {
    // Add space before capital letters, then capitalize first letter
    const result = key.replace(/([A-Z])/g, ' $1').trim();
    return result.charAt(0).toUpperCase() + result.slice(1);
};

/**
 * Helper to format specific values (dates, etc)
 */
const formatValue = (key: string, value: any): React.ReactNode => {
    if (!value) return <span className="text-slate-400 italic">N/A</span>;
    
    // Handle Dates
    if ((key.includes('Time') || key.includes('Date')) && typeof value === 'string') {
        try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                return (
                    <span className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {format(date, 'PPpp')}
                    </span>
                );
            }
        } catch (e) {
            return value;
        }
    }
    return String(value);
};

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ isOpen, onClose, data, title }) => {
    if (!isOpen || !data) return null;

    // Define keys we generally want to highlight at the top or treat differently
    const primaryKeys = ['Id', 'CompanyName', 'Status', 'ReportedIssue', 'IssueBuckets'];
    
    // Get all keys except internal ones if any
    const allKeys = Object.keys(data);
    const detailKeys = allKeys.filter(k => !primaryKeys.includes(k));

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">{title} Details</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                            <Hash size={12} /> ID: <span className="font-mono text-slate-700">{data.Id}</span>
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    
                    {/* Primary Info Card */}
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                                <Building size={12} /> Customer
                            </span>
                            <p className="text-lg font-bold text-slate-800">{data.CompanyName}</p>
                        </div>
                        
                        <div className="space-y-1">
                             <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle size={12} /> Primary Issue
                            </span>
                            <p className="text-lg font-medium text-slate-800">
                                {data.ReportedIssue || data.IssueBuckets || 'Unspecified'}
                            </p>
                        </div>

                        {data.Status && (
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Status</span>
                                <div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${data.Status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {data.Status}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        {data.State && (
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                                    <MapPin size={12} /> Location
                                </span>
                                <p className="text-sm font-medium text-slate-700">{data.State}</p>
                            </div>
                        )}
                    </div>

                    {/* Detailed Grid */}
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">All Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {detailKeys.map((key) => (
                            <div key={key} className="border-b border-slate-50 pb-2 last:border-0 group hover:bg-slate-50/50 p-2 rounded transition-colors">
                                <p className="text-xs text-slate-500 font-medium mb-1">{formatKey(key)}</p>
                                <div className="text-sm text-slate-800 break-words font-medium">
                                    {formatValue(key, data[key])}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};