import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { parseExcelFile, mapToFuelIssues, mapToAfterSalesIssues } from '../utils/excelParser';
import { SheetType } from '../types';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: (type: SheetType, data: any[]) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadComplete }) => {
    const [uploadType, setUploadType] = useState<SheetType>(SheetType.FUEL);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFile = async (file: File) => {
        if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
            setError("Please upload a valid Excel file (.xlsx, .xls)");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const rawData = await parseExcelFile(file);
            let mappedData;

            if (uploadType === SheetType.FUEL) {
                mappedData = mapToFuelIssues(rawData);
            } else {
                mappedData = mapToAfterSalesIssues(rawData);
            }

            if (mappedData.length === 0) {
                throw new Error("No valid data found in the file.");
            }

            onUploadComplete(uploadType, mappedData);
            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to parse file. Please check the format.");
        } finally {
            setIsProcessing(false);
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">Upload Data</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Type Selector */}
                    <div className="flex gap-4 mb-6">
                        <button 
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${uploadType === SheetType.FUEL ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            onClick={() => setUploadType(SheetType.FUEL)}
                        >
                            Fuel - Issues
                        </button>
                        <button 
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${uploadType === SheetType.AFTER_SALES ? 'bg-blue-50 text-blue-700 border-2 border-blue-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            onClick={() => setUploadType(SheetType.AFTER_SALES)}
                        >
                            After Sales
                        </button>
                    </div>

                    {/* Drop Zone */}
                    <div 
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".xlsx,.xls" 
                            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                        />
                        
                        {isProcessing ? (
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-slate-600 font-medium">Processing file...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center cursor-pointer">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                                    <Upload size={24} />
                                </div>
                                <p className="text-slate-900 font-semibold mb-1">Click to upload or drag and drop</p>
                                <p className="text-slate-500 text-sm">Excel files (.xlsx, .xls) only</p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};