import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { SheetType, FuelIssue, AfterSalesIssue } from './types';
import { fetchDashboardData } from './services/dataService';
import { FuelDashboard } from './components/FuelDashboard';
import { AfterSalesDashboard } from './components/AfterSalesDashboard';
import { UploadModal } from './components/UploadModal';
import { LayoutDashboard, Wrench, RefreshCw, AlertCircle, Menu, UploadCloud, Search, Calendar, X } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

function App() {
  const [activeTab, setActiveTab] = useState<SheetType>(SheetType.FUEL);
  const [fuelData, setFuelData] = useState<FuelIssue[]>([]);
  const [afterSalesData, setAfterSalesData] = useState<AfterSalesIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  // New state for handling manual uploads
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isManualMode, setManualMode] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Poll for data every 30 seconds, but only if not in manual mode
  useEffect(() => {
    let interval: any;

    const loadData = async () => {
      if (isManualMode) return;
      try {
        setLoading(true);
        const response = await fetchDashboardData();
        setFuelData(response.fuelData);
        setAfterSalesData(response.afterSalesData);
        setLastSynced(response.lastSynced);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isManualMode) {
      loadData();
      interval = setInterval(loadData, 30000); 
    }

    return () => clearInterval(interval);
  }, [isManualMode]);

  const handleUploadComplete = useCallback((type: SheetType, data: any[]) => {
    setManualMode(true); // Stop auto-sync
    if (type === SheetType.FUEL) {
      setFuelData(data as FuelIssue[]);
      setActiveTab(SheetType.FUEL);
    } else {
      setAfterSalesData(data as AfterSalesIssue[]);
      setActiveTab(SheetType.AFTER_SALES);
    }
    setLastSynced(new Date());
  }, []);

  // Filtering Logic
  const filteredData = useMemo(() => {
    let data: any[] = activeTab === SheetType.FUEL ? fuelData : afterSalesData;

    // 1. Search Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter((item) => {
        const searchableFields = [
            item.Id,
            item.CompanyName,
            item.Name,
            item.State,
            item.Product,
            (item as FuelIssue).ReportedIssue,
            (item as FuelIssue).IssueList,
            (item as AfterSalesIssue).IssueBuckets,
            (item as FuelIssue).FuelTeamSPOC,
            (item as AfterSalesIssue).AfterSalesSPOC
        ];
        
        return searchableFields.some(field => 
            field && String(field).toLowerCase().includes(lowerTerm)
        );
      });
    }

    // 2. Date Range Filter (Using StartTime)
    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0); // Start of day
        data = data.filter(item => {
            if (!item.StartTime) return false;
            const itemDate = new Date(item.StartTime);
            return itemDate >= start;
        });
    }

    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        data = data.filter(item => {
            if (!item.StartTime) return false;
            const itemDate = new Date(item.StartTime);
            return itemDate <= end;
        });
    }

    return data;
  }, [activeTab, fuelData, afterSalesData, searchTerm, startDate, endDate]);

  const clearFilters = () => {
      setSearchTerm('');
      setStartDate('');
      setEndDate('');
  };

  const hasActiveFilters = searchTerm || startDate || endDate;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-xl",
        !isSidebarOpen && "-translate-x-full md:hidden"
      )}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white text-xl">R</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Repos Energy</h1>
            <p className="text-xs text-slate-400">Analytics Portal</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab(SheetType.FUEL)}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              activeTab === SheetType.FUEL 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Fuel - Issues</span>
          </button>

          <button
            onClick={() => setActiveTab(SheetType.AFTER_SALES)}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
              activeTab === SheetType.AFTER_SALES 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Wrench size={20} />
            <span className="font-medium">After Sales</span>
          </button>
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <AlertCircle size={16} />
              <span className="text-xs font-bold uppercase">{isManualMode ? 'Manual Mode' : 'Demo Mode'}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isManualMode 
                ? "Showing data from uploaded file. Refresh page to reset to sync mode." 
                : "Data is currently mocked. Upload a file to see real data."}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === SheetType.FUEL ? 'Fuel Operations Dashboard' : 'After Sales & Support'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={() => setUploadModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
             >
                <UploadCloud size={16} />
                Upload Data
             </button>

             <div className="flex flex-col items-end mr-2">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Last Sync</span>
                <span className="text-xs font-bold text-slate-700">
                   {lastSynced ? format(lastSynced, 'hh:mm:ss a') : '...'}
                </span>
             </div>
             <div className={clsx("p-2 rounded-full bg-slate-100 text-slate-500", loading && !isManualMode && "animate-spin text-blue-600")}>
                <RefreshCw size={20} />
             </div>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between z-30">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search ID, Company, Issue..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={16} />
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>
                    <span className="text-slate-400 text-sm font-medium">to</span>
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={16} />
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            className="pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>
            </div>

            {hasActiveFilters && (
                <button 
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium ml-auto md:ml-0"
                >
                    <X size={16} />
                    Clear Filters
                </button>
            )}
        </div>

        {/* Dashboard Content */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            {loading && !lastSynced && !isManualMode ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <RefreshCw size={48} className="animate-spin mb-4 text-blue-500" />
                    <p>Syncing with SharePoint...</p>
                </div>
            ) : (
                <>
                    {/* Show filter count if active */}
                    {hasActiveFilters && (
                        <div className="mb-6 flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                {filteredData.length} results found
                            </span>
                        </div>
                    )}

                    {activeTab === SheetType.FUEL ? (
                        <FuelDashboard data={filteredData as FuelIssue[]} />
                    ) : (
                        <AfterSalesDashboard data={filteredData as AfterSalesIssue[]} />
                    )}
                </>
            )}
        </div>
      </main>
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setUploadModalOpen(false)} 
        onUploadComplete={handleUploadComplete} 
      />
    </div>
  );
}

export default App;