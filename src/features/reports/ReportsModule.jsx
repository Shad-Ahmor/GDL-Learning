import React, { useState } from 'react';
import { FileBarChart, Download, FileText, Printer, FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ReportsModule() {
  const [activeTab, setActiveTab] = useState('Financial');
  const [isGenerating, setIsGenerating] = useState(null);

  const handleGenerateReport = async (report) => {
    try {
      setIsGenerating(report.id);
      
      const response = await fetch(`http://localhost:1422/api/reports/${report.id}`);
      if (!response.ok) {
        throw new Error('Report not found or not yet implemented');
      }
      
      const resData = await response.json();
      const { title, data } = resData;

      if (!data || data.length === 0) {
        alert('No data found for this report.');
        setIsGenerating(null);
        return;
      }

      // Convert JSON data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Auto-size columns based on header/content length
      const colWidths = Object.keys(data[0]).map(key => ({
        wch: Math.max(
          key.length,
          ...data.map(row => (row[key] ? row[key].toString().length : 0))
        ) + 2
      }));
      worksheet['!cols'] = colWidths;

      // Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

      // Generate Excel file and trigger download
      const fileName = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again later.');
    } finally {
      setIsGenerating(null);
    }
  };

  const reports = [
    { id: '1', title: 'Daily Fee Collection', type: 'Financial', format: 'PDF/Excel' },
    { id: '2', title: 'Monthly Attendance Summary', type: 'Academic', format: 'PDF/Excel' },
    { id: '3', title: 'Class Toppers List', type: 'Examination', format: 'PDF' },
    { id: '4', title: 'Pending Dues Ledger', type: 'Financial', format: 'Excel' },
  ];

  const filteredReports = reports.filter(r => r.type === activeTab);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-600 text-left inline-block">
            Reporting Engine
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Generate dynamic PDF and Excel reports for all modules.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 pt-4 px-1 custom-scrollbar w-full snap-x">
        {[
          { id: 'Financial', label: 'Financial', icon: FileBarChart, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(59,130,246,0.5)]', border: 'border-blue-500', text: 'text-blue-500', iconBg: 'bg-blue-500/10' },
          { id: 'Academic', label: 'Academic', icon: FileText, color: 'from-emerald-500 to-teal-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(16,185,129,0.5)]', border: 'border-emerald-500', text: 'text-emerald-500', iconBg: 'bg-emerald-500/10' },
          { id: 'Examination', label: 'Examination', icon: Printer, color: 'from-purple-500 to-indigo-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(168,85,247,0.5)]', border: 'border-purple-500', text: 'text-purple-500', iconBg: 'bg-purple-500/10' },
          { id: 'HR & Payroll', label: 'HR & Payroll', icon: FileSpreadsheet, color: 'from-orange-500 to-amber-500', shadow: 'shadow-[0_10px_30px_-10px_rgba(249,115,22,0.5)]', border: 'border-orange-500', text: 'text-orange-500', iconBg: 'bg-orange-500/10' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all duration-300 snap-center border hover:scale-[1.02] min-w-max relative overflow-hidden group ${
              activeTab === tab.id 
                ? `bg-gradient-to-r ${tab.color} text-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] border-transparent z-10 scale-[1.02]` 
                : `bg-card ${tab.text} ${tab.border} ${tab.shadow} hover:bg-black/5 dark:hover:bg-white/5`
            }`}
          >
            {activeTab === tab.id && (
              <>
                <div className="absolute inset-0 bg-white/20 blur-xl opacity-50 pointer-events-none mix-blend-overlay"></div>
                <div className={`absolute inset-0 rounded-2xl border-2 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.4)] pointer-events-none`}></div>
              </>
            )}
            <div className={`p-2 rounded-xl relative z-10 ${activeTab === tab.id ? 'bg-white/20' : tab.iconBg}`}>
              <tab.icon className="w-4 h-4" />
            </div>
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="glass-panel p-1 rounded-[2.5rem] overflow-hidden shadow-xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 blur-3xl opacity-50 pointer-events-none" />
        <div className="relative bg-card/80 backdrop-blur-3xl p-8 rounded-[2.4rem] border border-white/10 dark:border-white/5">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-black/5 dark:border-white/5">
            <div>
              <h3 className="font-extrabold text-foreground text-lg">Saved Reports - {activeTab}</h3>
              <p className="text-muted-foreground text-xs mt-1">Select and generate your required report</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  <th className="py-4 px-4">Report Name</th>
                  <th className="py-4 px-4 text-center">Format</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm font-semibold">
                {filteredReports.length > 0 ? filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4 text-foreground font-bold">{report.title}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="bg-black/5 dark:bg-white/5 text-muted-foreground px-3 py-1 rounded-full text-xs font-bold inline-block">
                        {report.format}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleGenerateReport(report)}
                        disabled={isGenerating === report.id}
                        className={`px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 active:scale-95 text-white rounded-xl text-xs font-black transition-all inline-flex items-center gap-2 premium-shadow cursor-pointer ${isGenerating === report.id ? 'opacity-70 pointer-events-none' : ''}`}
                      >
                        {isGenerating === report.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {isGenerating === report.id ? 'Generating...' : 'Generate'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-muted-foreground font-bold">
                      No reports found for {activeTab}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
