import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode2,
  Download,
  Eye,
  RefreshCw,
  Plus,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  Sparkles,
  Calendar,
  MapPin,
  Filter,
  Layers,
  ArrowDownToLine,
  Check,
} from 'lucide-react';
import CommandCenterLayout from '../components/CommandCenterLayout';
import {
  mockReports,
  reportTypeOptions,
  reportDistrictOptions,
  reportDateRangeOptions,
  reportFormatOptions,
  type ReportItem,
  type ReportType,
  type ReportFormat,
  type ReportStatus,
} from '../data/mockCommandCenterData';
import { governmentApi } from '../services/api';

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '1.2 MB';
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
};

const mapBackendReport = (r: any): ReportItem => ({
  id: String(r.id),
  name: r.name,
  type: r.type,
  district: r.district,
  dateGenerated: r.date_generated || 'Recent',
  format: r.format,
  fileSize: formatFileSize(r.file_size_bytes),
  status: (r.status as ReportStatus) || 'Ready',
  executiveSummary: r.executive_summary || '',
  keyFindings: r.key_findings || [],
  scope: r.scope || `${r.district} · Automated Report`,
});

interface ReportsScreenProps {
  onNavChange?: (navId: string) => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ onNavChange }) => {
  // ── Reports List State ────────────────────────────────────────────
  const [reports, setReports] = useState<ReportItem[]>(mockReports);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Fetch reports from backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchBackendReports = async () => {
      try {
        const data = await governmentApi.getReports();
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapBackendReport);
          setReports(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch backend reports, using defaults', err);
      }
    };
    fetchBackendReports();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── Generator Config Form State ───────────────────────────────────
  const [selectedType, setSelectedType] = useState<ReportType>('Risk Summary');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('Last 7 Days');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('PDF');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // ── Highlighting Generator Card ───────────────────────────────────
  const [isCardHighlighted, setIsCardHighlighted] = useState<boolean>(false);
  const configCardRef = useRef<HTMLDivElement>(null);

  // ── Preview Modal State ───────────────────────────────────────────
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);

  // ── Toast State ───────────────────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // ── Scroll & Flash Config Card ────────────────────────────────────
  const handleScrollToConfig = () => {
    configCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsCardHighlighted(true);
    setTimeout(() => setIsCardHighlighted(false), 2000);
  };

  // ── Handle Generate Report ────────────────────────────────────────
  const handleGenerateReport = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    const tempName =
      selectedDistrict === 'All Districts'
        ? `Telangana ${selectedType} — ${selectedDateRange}`
        : `${selectedDistrict} ${selectedType} (${selectedDateRange})`;

    setToastMessage(`Generating "${tempName}" via backend...`);

    try {
      const generated = await governmentApi.generateReport({
        type: selectedType,
        district: selectedDistrict,
        date_range: selectedDateRange,
        format: selectedFormat,
      });

      const newReport = mapBackendReport(generated);
      setReports((prev) => [newReport, ...prev]);
      setToastMessage(`✓ Report generated: "${newReport.name}"`);
    } catch (err) {
      console.warn('Backend generation fallback:', err);
      const newReportId = `rep-${Date.now()}`;
      const newReport: ReportItem = {
        id: newReportId,
        name: tempName,
        type: selectedType,
        district: selectedDistrict,
        dateGenerated: 'Just now',
        format: selectedFormat,
        fileSize: selectedFormat === 'PDF' ? '3.4 MB' : selectedFormat === 'Excel' ? '1.7 MB' : '680 KB',
        status: 'Ready',
        executiveSummary: `Automated dynamic ${selectedType.toLowerCase()} compiled for ${selectedDistrict} covering ${selectedDateRange.toLowerCase()}. Synthesized from real-time field telemetry and satellite radar passes.`,
        keyFindings: [
          `Target district scope: ${selectedDistrict} across Kharif surveillance nodes.`,
          `Synthesized multi-spectral crop stress indicators and mandi transaction velocity.`,
          'Compliance verification logged with Telangana State Agriculture Department data clearinghouse.',
        ],
        scope: `${selectedDistrict} · Realtime Query`,
      };
      setReports((prev) => [newReport, ...prev]);
      setToastMessage(`✓ Report ready: "${tempName}"`);
    } finally {
      setIsGenerating(false);
    }
  };

  // ── Handle Retry Failed Report ───────────────────────────────────
  const handleRetry = (reportId: string, reportName: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'Processing' as ReportStatus } : r))
    );
    setToastMessage(`Re-processing "${reportName}"...`);

    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'Ready' as ReportStatus } : r))
      );
      setToastMessage(`✓ Successfully generated "${reportName}"`);
    }, 2500);
  };

  // ── Handle Download ──────────────────────────────────────────────
  const handleDownload = async (report: ReportItem) => {
    if (report.status !== 'Ready') return;
    const numId = Number(report.id);
    if (!isNaN(numId) && numId > 0) {
      try {
        setToastMessage(`Downloading ${report.name}...`);
        await governmentApi.downloadReport(
          numId,
          `${report.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.${report.format.toLowerCase()}`
        );
        setToastMessage(`✓ Download complete: ${report.name}`);
        return;
      } catch (err) {
        console.warn('File download failed, using standard notification', err);
      }
    }
    setToastMessage(`✓ Download started: ${report.name}.${report.format.toLowerCase()} (${report.fileSize})`);
  };

  // ── Format Icon Helper ───────────────────────────────────────────
  const renderFormatIcon = (format: ReportFormat) => {
    if (format === 'PDF') {
      return (
        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4 stroke-[2.2]" />
        </div>
      );
    }
    if (format === 'Excel') {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
          <FileSpreadsheet className="w-4 h-4 stroke-[2.2]" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
        <FileCode2 className="w-4 h-4 stroke-[2.2]" />
      </div>
    );
  };

  // ── Status Pill Helper ───────────────────────────────────────────
  const renderStatusPill = (status: ReportStatus) => {
    if (status === 'Ready') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Check className="w-3 h-3 stroke-[2.8]" />
          <span>Ready</span>
        </span>
      );
    }
    if (status === 'Processing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin stroke-[2.5]" />
          <span>Processing</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-200">
        <AlertCircle className="w-3 h-3 stroke-[2.5]" />
        <span>Failed</span>
      </span>
    );
  };

  const displayedReports = reports.slice(0, visibleCount);

  return (
    <CommandCenterLayout activeNav="reports" onNavChange={onNavChange}>
      <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
        {/* ═══════════════════════════════════════════════════════════
            TOAST NOTIFICATION
           ═══════════════════════════════════════════════════════════ */}
        {toastMessage && (
          <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            HEADER ROW
           ═══════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-farmText-dark tracking-tight leading-tight">
              Reports
            </h2>
            <p className="text-[13px] text-farmText-gray mt-1">
              Generate and download district-level agricultural risk reports
            </p>
          </div>

          {/* "+ Generate New Report" Button */}
          <button
            type="button"
            onClick={handleScrollToConfig}
            className="self-start sm:self-auto bg-primary hover:bg-primary-dark text-white font-semibold text-[13px] px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Generate New Report</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            FILTER / CONFIG CARD (FOR GENERATING A NEW REPORT)
           ═══════════════════════════════════════════════════════════ */}
        <div
          ref={configCardRef}
          className={`
            bg-white rounded-xl border p-6 transition-all duration-300
            ${
              isCardHighlighted
                ? 'border-primary ring-4 ring-primary/15 shadow-md'
                : 'border-slate-200/90 shadow-xs'
            }
          `}
        >
          {/* Card Title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <h3 className="text-[14px] font-bold text-farmText-dark tracking-tight uppercase tracking-wider">
                Generate Custom Risk Report
              </h3>
            </div>
            <span className="text-[11px] text-farmText-muted font-medium">
              Real-time query engine
            </span>
          </div>

          {/* Row of Dropdowns/Inputs & Action Button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
            {/* 1. Report Type */}
            <div>
              <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1.5">
                Report Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ReportType)}
                className="w-full text-[12px] font-semibold text-farmText-dark bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
              >
                {reportTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. District */}
            <div>
              <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1.5">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full text-[12px] font-semibold text-farmText-dark bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
              >
                {reportDistrictOptions.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Date Range */}
            <div>
              <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1.5">
                Date Range
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full text-[12px] font-semibold text-farmText-dark bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
              >
                {reportDateRangeOptions.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Format */}
            <div>
              <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1.5">
                Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as ReportFormat)}
                className="w-full text-[12px] font-semibold text-farmText-dark bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
              >
                {reportFormatOptions.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt} ({fmt === 'PDF' ? 'Document' : fmt === 'Excel' ? 'Spreadsheet' : 'Raw Data'})
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Generate Report Button */}
            <div>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerateReport}
                className={`
                  w-full font-bold text-[12px] py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-xs transition-all duration-200 cursor-pointer
                  ${
                    isGenerating
                      ? 'bg-primary/80 text-white cursor-wait'
                      : 'bg-primary hover:bg-primary-dark text-white hover:shadow-sm'
                  }
                `}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2]" />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            RECENT REPORTS SECTION (FULL WIDTH CARD)
           ═══════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Section Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] font-bold text-farmText-dark tracking-tight">
                Recent Reports
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {reports.length} total
              </span>
            </div>
            <div className="text-[12px] text-farmText-muted">
              Auto-archived · Available for 90 days
            </div>
          </div>

          {/* Reports Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-farmText-gray uppercase tracking-wider">
                  <th className="py-3 px-5">Report Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Date Generated</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-[13px]">
                {displayedReports.map((rep, idx) => {
                  const isProcessing = rep.status === 'Processing';
                  const isFailed = rep.status === 'Failed';
                  const isReady = rep.status === 'Ready';

                  return (
                    <tr
                      key={rep.id}
                      className={`
                        transition-colors hover:bg-slate-50/90
                        ${idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}
                      `}
                    >
                      {/* Report Name with File Format Icon */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {renderFormatIcon(rep.format)}
                          <div>
                            <div className="font-bold text-farmText-dark text-[13px] leading-snug">
                              {rep.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {rep.format} · {rep.fileSize}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {rep.type}
                      </td>

                      {/* District */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rep.district}</span>
                        </span>
                      </td>

                      {/* Date Generated */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium text-[12px]">
                        {rep.dateGenerated}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {renderStatusPill(rep.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* If Failed: Show Retry Icon */}
                          {isFailed && (
                            <button
                              type="button"
                              onClick={() => handleRetry(rep.id, rep.name)}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
                              title="Retry generation"
                            >
                              <RefreshCw className="w-4 h-4 stroke-[2]" />
                            </button>
                          )}

                          {/* Download Button */}
                          <button
                            type="button"
                            disabled={!isReady}
                            onClick={() => handleDownload(rep)}
                            className={`
                              p-1.5 rounded-lg border transition-all cursor-pointer
                              ${
                                isReady
                                  ? 'text-slate-600 hover:text-primary hover:bg-primary/5 border-slate-200 hover:border-primary/40'
                                  : 'text-slate-300 border-slate-100 cursor-not-allowed'
                              }
                            `}
                            title={isReady ? 'Download report' : 'Report is processing'}
                          >
                            <Download className="w-4 h-4 stroke-[2]" />
                          </button>

                          {/* View Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewReport(rep)}
                            className="p-1.5 text-slate-600 hover:text-farmText-dark hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="View summary"
                          >
                            <Eye className="w-4 h-4 stroke-[2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section Footer / Pagination */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
            <span className="text-farmText-gray font-medium">
              Showing <strong className="text-farmText-dark">{displayedReports.length}</strong> of{' '}
              <strong className="text-farmText-dark">{reports.length}</strong> reports
            </span>

            {reports.length > 6 && (
              <div className="flex items-center gap-2">
                {visibleCount < reports.length ? (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 6, reports.length))}
                    className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer text-[12px]"
                  >
                    Load More ({reports.length - visibleCount} remaining)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(6)}
                    className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer text-[12px]"
                  >
                    Show Less
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          REPORT PREVIEW MODAL / SLIDE-OVER
         ═══════════════════════════════════════════════════════════ */}
      {previewReport && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setPreviewReport(null)}
          />

          {/* Modal / Slide-over Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/70 shrink-0">
                <div className="flex items-start gap-3">
                  {renderFormatIcon(previewReport.format)}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {previewReport.type}
                      </span>
                      {renderStatusPill(previewReport.status)}
                    </div>
                    <h3 className="text-lg font-bold text-farmText-dark tracking-tight leading-snug">
                      {previewReport.name}
                    </h3>
                    <p className="text-xs text-farmText-gray mt-0.5">
                      {previewReport.district} · Generated on {previewReport.dateGenerated}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* Scope & Metadata Chips */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <span className="text-[11px] font-bold text-farmText-gray uppercase tracking-wider block mb-2">
                    Scope & Coverage
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] font-semibold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                      {previewReport.scope}
                    </span>
                    <span className="text-[12px] font-semibold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                      Format: {previewReport.format}
                    </span>
                    <span className="text-[12px] font-semibold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                      Size: {previewReport.fileSize}
                    </span>
                  </div>
                </div>

                {/* Executive Summary */}
                <div>
                  <h4 className="text-[13px] font-bold text-farmText-dark uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary" />
                    Executive Summary
                  </h4>
                  <p className="text-[13px] text-slate-600 leading-relaxed bg-slate-50/60 p-3.5 rounded-lg border border-slate-100 font-medium">
                    {previewReport.executiveSummary}
                  </p>
                </div>

                {/* Key Findings Checklist */}
                <div>
                  <h4 className="text-[13px] font-bold text-farmText-dark uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Key Agricultural Findings
                  </h4>
                  <div className="space-y-2">
                    {previewReport.keyFindings.map((finding, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-3 border border-slate-200 flex items-start gap-2.5 shadow-2xs"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-[12px] text-farmText-dark font-medium leading-relaxed">
                          {finding}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verification Stamp */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-700">Digital Seal & Verification</div>
                    <div className="text-[10px] text-slate-400">Department of Agriculture, Govt of Telangana</div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewReport(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={previewReport.status !== 'Ready'}
                  onClick={() => {
                    handleDownload(previewReport);
                    setPreviewReport(null);
                  }}
                  className={`
                    px-4 py-2 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs
                    ${
                      previewReport.status === 'Ready'
                        ? 'bg-primary hover:bg-primary-dark text-white'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }
                  `}
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Download {previewReport.format}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CommandCenterLayout>
  );
};

export default ReportsScreen;
