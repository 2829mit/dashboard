import React, { useState } from 'react';
import { LucideIcon, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Interface for individual items in the expanded list view
 */
interface StatItem {
    label: string;
    value: string | number;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean; // true = green (good), false = red (bad/alert)
    color: 'blue' | 'green' | 'orange' | 'red';
    /** Optional list of items to show when the card is expanded */
    expandableItems?: StatItem[];
}

const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
};

/**
 * Reusable StatCard component for dashboard KPIs.
 * Supports displaying a single primary metric or toggling to a list of top contributors.
 */
export const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendUp, 
    color,
    expandableItems 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Dynamically adjust font size for longer text values to prevent overflow
    const isLongText = typeof value === 'string' && value.length > 15;
    const valueClass = isLongText ? "text-xl leading-tight" : "text-3xl";

    return (
        <div className={`p-6 rounded-xl border ${colorMap[color]} transition-all duration-300 hover:shadow-md flex flex-col justify-between h-full relative`}>
            <div>
                {/* Header Section: Icon, Trend, and Toggle Button */}
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-white/60 shadow-sm">
                        <Icon size={24} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Only show trend if not expanded, to reduce clutter */}
                        {trend && !isExpanded && (
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {trend}
                            </span>
                        )}
                        
                        {/* Chevron Toggle for Expandable Content */}
                        {expandableItems && expandableItems.length > 0 && (
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1 hover:bg-black/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current"
                                aria-label={isExpanded ? "Collapse details" : "Expand details"}
                                title={isExpanded ? "Show less" : "Show top 3"}
                            >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                        )}
                    </div>
                </div>
                
                <h3 className="text-sm font-medium opacity-80 uppercase tracking-wide">{title}</h3>
                
                {/* Content Section: Switch between Main Value and List */}
                <div className="mt-1 min-h-[40px] flex flex-col justify-center">
                    {isExpanded && expandableItems ? (
                        <div className="space-y-2 mt-2 animate-fade-in">
                            {expandableItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm border-b border-black/5 pb-1 last:border-0 last:pb-0">
                                    <span className="font-medium truncate pr-2 max-w-[70%]" title={item.label}>
                                        {idx + 1}. {item.label}
                                    </span>
                                    <span className="font-bold opacity-80">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={`${valueClass} font-bold animate-fade-in`}>{value}</p>
                    )}
                </div>
            </div>
        </div>
    );
};