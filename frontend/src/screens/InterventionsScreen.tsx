import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  GripVertical,
  Calendar,
  MapPin,
  X,
  Send,
  Phone,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Flame,
  FileText,
  Filter,
} from 'lucide-react';
import CommandCenterLayout from '../components/CommandCenterLayout';
import {
  mockInterventions,
  reportDistrictOptions,
  legendCategories,
  riskLevelStyles,
  fieldTeamOptions,
  type InterventionItem,
  type InterventionStatus,
  type RiskCategory,
  type RiskLevel,
} from '../data/mockCommandCenterData';
import { governmentInterventionsApi } from '../services/api';

interface InterventionsScreenProps {
  onNavChange?: (navId: string) => void;
}

export const InterventionsScreen: React.FC<InterventionsScreenProps> = ({ onNavChange }) => {
  // ── Interventions State ───────────────────────────────────────────
  const [interventions, setInterventions] = useState<InterventionItem[]>(mockInterventions);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadInterventions = async () => {
      try {
        setIsLoading(true);
        const data = await governmentInterventionsApi.getInterventions();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: InterventionItem[] = data.map((item: any) => ({
            id: String(item.id || item.intervention_uid || `int-${item.id}`),
            district: item.district,
            crop: item.crop,
            issueType: item.issueType || item.issue_type || 'Disease',
            riskLevel: item.riskLevel || item.risk_level || 'Medium',
            title: item.title,
            description: item.description,
            status: item.status,
            team: item.team || null,
            teamLead: item.teamLead || item.team_lead,
            teamContact: item.teamContact || item.team_contact,
            teamAvatar: item.teamAvatar || item.team_avatar,
            progressPercent: item.progressPercent ?? item.progress_percent ?? 0,
            startedDate: item.startedDate || item.started_date,
            dueDate: item.dueDate || item.due_date || 'In 3 days',
            completedDate: item.completedDate || item.completed_date,
            resolvedBy: item.resolvedBy || item.resolved_by,
            mandal: item.mandal,
            affectedHectares: item.affectedHectares ?? item.affected_hectares ?? 0,
            farmersCount: item.farmersCount ?? item.farmers_count ?? 0,
            activityLog: item.activityLog || item.activity_log || [],
          }));
          setInterventions(mapped);
        }
      } catch (err) {
        console.warn('Backend interventions API unavailable; retaining demo data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadInterventions();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── Filters State ─────────────────────────────────────────────────
  const [districtFilter, setDistrictFilter] = useState<string>('All Districts');
  const [teamFilter, setTeamFilter] = useState<string>('All Teams');
  const [issueFilter, setIssueFilter] = useState<string>('All Issues');

  // ── Modal & Drawer State ──────────────────────────────────────────
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);

  // ── Drag & Drop State ─────────────────────────────────────────────
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<InterventionStatus | null>(null);

  // ── Toast Notification State ──────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // ── New Intervention Form State ───────────────────────────────────
  const [newDistrict, setNewDistrict] = useState<string>('Nalgonda');
  const [newCrop, setNewCrop] = useState<string>('Rice');
  const [newIssue, setNewIssue] = useState<RiskCategory>('Disease');
  const [newPriority, setNewPriority] = useState<RiskLevel>('High');
  const [newTeam, setNewTeam] = useState<string>('Unassigned');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newMandal, setNewMandal] = useState<string>('Miryalaguda');

  // ── Filtered Interventions ────────────────────────────────────────
  const filteredInterventions = useMemo(() => {
    return interventions.filter((item) => {
      if (districtFilter !== 'All Districts' && item.district !== districtFilter) return false;
      if (teamFilter !== 'All Teams') {
        if (teamFilter === 'Unassigned' && item.team !== null) return false;
        if (teamFilter !== 'Unassigned' && !item.team?.includes(teamFilter.split(' ')[2] || '')) return false;
      }
      if (issueFilter !== 'All Issues' && item.issueType !== issueFilter) return false;
      return true;
    });
  }, [interventions, districtFilter, teamFilter, issueFilter]);

  // ── Column Buckets ────────────────────────────────────────────────
  const pendingItems = useMemo(
    () => filteredInterventions.filter((i) => i.status === 'Pending'),
    [filteredInterventions]
  );
  const inProgressItems = useMemo(
    () => filteredInterventions.filter((i) => i.status === 'In Progress'),
    [filteredInterventions]
  );
  const completedItems = useMemo(
    () => filteredInterventions.filter((i) => i.status === 'Completed'),
    [filteredInterventions]
  );

  // ── Drag & Drop Handlers ──────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnStatus: InterventionStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnStatus) {
      setDragOverColumn(columnStatus);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: InterventionStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const id = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (!id) return;

    setInterventions((prev) =>
      prev.map((item) => {
        if (item.id === id && item.status !== targetStatus) {
          const updated: InterventionItem = {
            ...item,
            status: targetStatus,
            startedDate: targetStatus === 'In Progress' && !item.startedDate ? 'Started just now' : item.startedDate,
            completedDate: targetStatus === 'Completed' ? 'Just now' : item.completedDate,
            resolvedBy: targetStatus === 'Completed' ? item.team || 'Field Response Team' : item.resolvedBy,
            progressPercent: targetStatus === 'Completed' ? 100 : targetStatus === 'In Progress' && !item.progressPercent ? 25 : item.progressPercent,
            activityLog: [
              {
                time: 'Just now',
                text: `Status updated to ${targetStatus}`,
                author: 'Command Officer',
              },
              ...item.activityLog,
            ],
          };
          setToastMessage(`✓ Moved "${item.title}" to ${targetStatus}`);
          // Sync status change to backend API asynchronously
          governmentInterventionsApi
            .updateStatus(id, {
              status: targetStatus,
              resolved_by: targetStatus === 'Completed' ? item.team || 'Field Response Team' : undefined,
              log_message: `Moved to ${targetStatus} via Command Center Board`,
            })
            .catch((err) => {
              console.warn('Failed to update status on backend:', err);
            });
          return updated;
        }
        return item;
      })
    );
    setDraggedItemId(null);
  };

  // ── Create New Intervention Handler ───────────────────────────────
  const handleCreateIntervention = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim() || `Emergency ${newIssue} Response in ${newDistrict}`;
    const assignedTeam = newTeam === 'Unassigned' ? null : newTeam.split(' (')[0];

    const newItem: InterventionItem = {
      id: `int-${Date.now()}`,
      district: newDistrict,
      crop: newCrop,
      issueType: newIssue,
      riskLevel: newPriority,
      title,
      description: newDescription.trim() || `Emergency protocol deployed for ${newCrop} ${newIssue} in ${newDistrict}.`,
      status: assignedTeam ? 'In Progress' : 'Pending',
      team: assignedTeam,
      teamLead: assignedTeam ? 'Assigned Field Officer' : undefined,
      teamAvatar: assignedTeam ? assignedTeam.replace('Field Team ', 'FT') : undefined,
      progressPercent: assignedTeam ? 15 : undefined,
      startedDate: assignedTeam ? 'Dispatched just now' : undefined,
      dueDate: 'In 3 days',
      mandal: newMandal,
      affectedHectares: 3200,
      farmersCount: 2400,
      activityLog: [
        { time: 'Just now', text: 'Intervention order generated from Command Center.', author: 'State Command Officer' },
      ],
    };

    setInterventions((prev) => [newItem, ...prev]);
    setIsNewModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setToastMessage(`✓ New intervention dispatched to ${newDistrict}: "${title}"`);

    // Send to backend API asynchronously
    governmentInterventionsApi
      .createIntervention({
        district: newDistrict,
        mandal: newMandal,
        crop: newCrop,
        issue_type: newIssue,
        risk_level: newPriority,
        title,
        description: newDescription.trim() || `Emergency protocol deployed for ${newCrop} ${newIssue} in ${newDistrict}.`,
        status: assignedTeam ? 'In Progress' : 'Pending',
        team: assignedTeam,
      })
      .then((created) => {
        if (created && created.id) {
          setInterventions((prev) =>
            prev.map((it) => (it.id === newItem.id ? { ...it, id: String(created.id) } : it))
          );
        }
      })
      .catch((err) => {
        console.warn('Failed to persist created intervention to backend:', err);
      });
  };

  // ── Mark Complete or Escalate ─────────────────────────────────────
  const handleUpdateStatus = (id: string, newStatus: InterventionStatus) => {
    setInterventions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated: InterventionItem = {
            ...item,
            status: newStatus,
            completedDate: newStatus === 'Completed' ? 'Today' : item.completedDate,
            progressPercent: newStatus === 'Completed' ? 100 : item.progressPercent,
            activityLog: [
              { time: 'Just now', text: `Action item marked as ${newStatus}`, author: 'Command Center Officer' },
              ...item.activityLog,
            ],
          };
          if (selectedIntervention?.id === id) {
            setSelectedIntervention(updated);
          }
          // Sync with backend API
          governmentInterventionsApi
            .updateStatus(id, {
              status: newStatus,
              resolved_by: newStatus === 'Completed' ? item.team || 'Command Officer' : undefined,
            })
            .catch((err) => {
              console.warn('Failed to update status on backend:', err);
            });
          return updated;
        }
        return item;
      })
    );
    setToastMessage(`✓ Intervention status updated to "${newStatus}"`);
  };

  const handleEscalate = (id: string) => {
    setInterventions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated: InterventionItem = {
            ...item,
            riskLevel: 'High',
            activityLog: [
              { time: 'Just now', text: 'Priority escalated to High. Alert broadcasted to State Taskforce.', author: 'DAO Command Alert' },
              ...item.activityLog,
            ],
          };
          if (selectedIntervention?.id === id) {
            setSelectedIntervention(updated);
          }
          return updated;
        }
        return item;
      })
    );
    setToastMessage(`⚠️ Escalated to State Taskforce: High Priority`);
  };

  // ── Risk Badge Helper ─────────────────────────────────────────────
  const renderRiskBadge = (level: RiskLevel) => {
    const style = riskLevelStyles[level];
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
        {level}
      </span>
    );
  };

  return (
    <CommandCenterLayout activeNav="interventions" onNavChange={onNavChange}>
      <div className="space-y-6 max-w-[1440px] mx-auto pb-12">
        {/* ═══════════════════════════════════════════════════════════
            TOAST ALERT
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
              Interventions
            </h2>
            <p className="text-[13px] text-farmText-gray mt-1">
              Track and manage field response actions across affected districts
            </p>
          </div>

          {/* "+ New Intervention" Primary Button */}
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="self-start sm:self-auto bg-primary hover:bg-primary-dark text-white font-semibold text-[13px] px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Intervention</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SUMMARY STAT CARDS ROW (4 cards, equal width)
           ═══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Active Interventions */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 transition-all duration-200 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-farmText-gray uppercase tracking-wider">
                Active Interventions
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <ShieldAlert className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-[28px] font-extrabold text-farmText-dark tracking-tight leading-none">
                9
              </div>
              <p className="text-[12px] text-farmText-muted font-medium mt-1.5">
                in progress & pending
              </p>
            </div>
          </div>

          {/* Card 2: Completed This Month */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 transition-all duration-200 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-farmText-gray uppercase tracking-wider">
                Completed This Month
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-[28px] font-extrabold text-farmText-dark tracking-tight leading-none">
                14
              </div>
              <p className="text-[12px] text-farmText-muted font-medium mt-1.5">
                resolved cases
              </p>
            </div>
          </div>

          {/* Card 3: Field Teams Deployed */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 transition-all duration-200 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-farmText-gray uppercase tracking-wider">
                Field Teams Deployed
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                <Users className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-[28px] font-extrabold text-farmText-dark tracking-tight leading-none">
                6
              </div>
              <p className="text-[12px] text-farmText-muted font-medium mt-1.5">
                across 4 districts
              </p>
            </div>
          </div>

          {/* Card 4: Avg. Response Time */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 transition-all duration-200 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-farmText-gray uppercase tracking-wider">
                Avg. Response Time
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-[28px] font-extrabold text-farmText-dark tracking-tight leading-none">
                2.3 days
              </div>
              <p className="text-[12px] text-farmText-muted font-medium mt-1.5">
                from alert to dispatch
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            KANBAN BOARD (THREE COLUMNS: PENDING, IN PROGRESS, COMPLETED)
           ═══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* ─────────────────────────────────────────────────────────
              COLUMN 1 — PENDING (AMBER ACCENT)
             ───────────────────────────────────────────────────────── */}
          <div
            onDragOver={(e) => handleDragOver(e, 'Pending')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'Pending')}
            className={`
              bg-slate-50/90 rounded-2xl p-4 border transition-all duration-200 flex flex-col min-h-[540px]
              ${
                dragOverColumn === 'Pending'
                  ? 'border-amber-400 bg-amber-50/40 ring-4 ring-amber-400/10'
                  : 'border-slate-200/80 shadow-2xs'
              }
            `}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs" />
                <h3 className="text-[14px] font-bold text-slate-800 tracking-tight">Pending</h3>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                  {pendingItems.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Awaiting Dispatch</span>
            </div>

            {/* Stacked Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {pendingItems.length === 0 ? (
                <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400 text-[12px]">
                  No pending cases
                </div>
              ) : (
                pendingItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => setSelectedIntervention(item)}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all duration-150 cursor-pointer group select-none relative"
                  >
                    {/* Drag Handle Indicator */}
                    <div className="absolute top-3 right-3 text-slate-300 group-hover:text-slate-500 transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* District & Risk Badge */}
                    <div className="flex items-center gap-2 mb-1.5 pr-5">
                      <span className="font-bold text-[14px] text-farmText-dark tracking-tight">
                        {item.district}
                      </span>
                      {renderRiskBadge(item.riskLevel)}
                    </div>

                    {/* Issue Tag */}
                    <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                      <span className="text-primary font-bold">{item.crop}</span>
                      <span>·</span>
                      <span>{item.issueType}</span>
                    </div>

                    {/* Title & Short Description */}
                    <h4 className="text-[13px] font-bold text-slate-800 leading-snug mb-1">
                      {item.title}
                    </h4>
                    <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-3 font-medium">
                      {item.description}
                    </p>

                    {/* Card Footer: Team + Due Date */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      {item.team ? (
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[9px] font-bold flex items-center justify-center">
                            {item.teamAvatar || 'FT'}
                          </div>
                          <span className="truncate max-w-[100px]">{item.team}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                          Unassigned
                        </span>
                      )}

                      <div className="flex items-center gap-1 text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              COLUMN 2 — IN PROGRESS (BLUE ACCENT)
             ───────────────────────────────────────────────────────── */}
          <div
            onDragOver={(e) => handleDragOver(e, 'In Progress')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'In Progress')}
            className={`
              bg-slate-50/90 rounded-2xl p-4 border transition-all duration-200 flex flex-col min-h-[540px]
              ${
                dragOverColumn === 'In Progress'
                  ? 'border-blue-400 bg-blue-50/40 ring-4 ring-blue-400/10'
                  : 'border-slate-200/80 shadow-2xs'
              }
            `}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs" />
                <h3 className="text-[14px] font-bold text-slate-800 tracking-tight">In Progress</h3>
                <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                  {inProgressItems.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Field Ops Active</span>
            </div>

            {/* Stacked Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {inProgressItems.length === 0 ? (
                <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400 text-[12px]">
                  No active field operations
                </div>
              ) : (
                inProgressItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => setSelectedIntervention(item)}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-150 cursor-pointer group select-none relative"
                  >
                    {/* Drag Handle Indicator */}
                    <div className="absolute top-3 right-3 text-slate-300 group-hover:text-slate-500 transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* District & Risk Badge */}
                    <div className="flex items-center gap-2 mb-1.5 pr-5">
                      <span className="font-bold text-[14px] text-farmText-dark tracking-tight">
                        {item.district}
                      </span>
                      {renderRiskBadge(item.riskLevel)}
                    </div>

                    {/* Issue Tag */}
                    <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                      <span className="text-primary font-bold">{item.crop}</span>
                      <span>·</span>
                      <span>{item.issueType}</span>
                    </div>

                    {/* Title & Short Description */}
                    <h4 className="text-[13px] font-bold text-slate-800 leading-snug mb-1">
                      {item.title}
                    </h4>
                    <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-3 font-medium">
                      {item.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>Progress: {item.progressPercent || 50}%</span>
                        <span className="text-slate-400 font-normal">{item.startedDate}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${item.progressPercent || 50}%` }}
                        />
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                          {item.teamAvatar || 'FT'}
                        </div>
                        <span className="truncate max-w-[120px]">{item.team}</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.dueDate}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              COLUMN 3 — COMPLETED (GREEN ACCENT)
             ───────────────────────────────────────────────────────── */}
          <div
            onDragOver={(e) => handleDragOver(e, 'Completed')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'Completed')}
            className={`
              bg-slate-50/90 rounded-2xl p-4 border transition-all duration-200 flex flex-col min-h-[540px]
              ${
                dragOverColumn === 'Completed'
                  ? 'border-emerald-400 bg-emerald-50/40 ring-4 ring-emerald-400/10'
                  : 'border-slate-200/80 shadow-2xs'
              }
            `}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
                <h3 className="text-[14px] font-bold text-slate-800 tracking-tight">Completed</h3>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {completedItems.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Resolved & Verified</span>
            </div>

            {/* Stacked Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {completedItems.length === 0 ? (
                <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-400 text-[12px]">
                  No completed cases
                </div>
              ) : (
                completedItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => setSelectedIntervention(item)}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-150 cursor-pointer group select-none relative"
                  >
                    {/* Drag Handle Indicator */}
                    <div className="absolute top-3 right-3 text-slate-300 group-hover:text-slate-500 transition-colors">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* District & Success Indicator */}
                    <div className="flex items-center gap-2 mb-1.5 pr-5">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="font-bold text-[14px] text-farmText-dark tracking-tight">
                        {item.district}
                      </span>
                      {renderRiskBadge(item.riskLevel)}
                    </div>

                    {/* Issue Tag */}
                    <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5 pl-6">
                      <span className="text-primary font-bold">{item.crop}</span>
                      <span>·</span>
                      <span>{item.issueType}</span>
                    </div>

                    {/* Title & Short Description */}
                    <h4 className="text-[13px] font-bold text-slate-800 leading-snug mb-1 pl-6">
                      {item.title}
                    </h4>
                    <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2 mb-3 pl-6 font-medium">
                      {item.description}
                    </p>

                    {/* Card Footer: Resolved By + View Report */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 truncate max-w-[160px]">
                        Resolved by {item.resolvedBy || item.team || 'Field Ops'}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavChange?.('reports');
                        }}
                        className="text-[11px] font-semibold text-primary hover:text-primary-dark flex items-center gap-0.5 cursor-pointer hover:underline"
                      >
                        <span>View Report</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            BOTTOM FILTER / LEGEND ROW
           ═══════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-farmText-gray uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-primary" />
              Filter Board By:
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* District Filter */}
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="text-[12px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
            >
              {reportDistrictOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Team Filter */}
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="text-[12px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
            >
              {fieldTeamOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Issue Type Filter */}
            <select
              value={issueFilter}
              onChange={(e) => setIssueFilter(e.target.value)}
              className="text-[12px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
            >
              <option value="All Issues">All Issues</option>
              {legendCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>

            {(districtFilter !== 'All Districts' || teamFilter !== 'All Teams' || issueFilter !== 'All Issues') && (
              <button
                type="button"
                onClick={() => {
                  setDistrictFilter('All Districts');
                  setTeamFilter('All Teams');
                  setIssueFilter('All Issues');
                }}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer ml-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SLIDE-OVER DETAIL DRAWER FOR INTERVENTION
         ═══════════════════════════════════════════════════════════ */}
      {selectedIntervention && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setSelectedIntervention(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-200 flex items-start justify-between bg-slate-50/70 shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`
                        text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                        ${
                          selectedIntervention.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : selectedIntervention.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }
                      `}
                    >
                      {selectedIntervention.status}
                    </span>
                    {renderRiskBadge(selectedIntervention.riskLevel)}
                  </div>
                  <h3 className="text-lg font-bold text-farmText-dark tracking-tight leading-snug">
                    {selectedIntervention.title}
                  </h3>
                  <p className="text-xs text-farmText-gray mt-0.5">
                    {selectedIntervention.district} ({selectedIntervention.mandal}) · {selectedIntervention.crop} · {selectedIntervention.issueType}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedIntervention(null)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 flex-1">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Target Area</span>
                    <div className="text-[15px] font-bold text-farmText-dark mt-0.5">
                      {selectedIntervention.affectedHectares.toLocaleString('en-IN')} ha
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Registered Farmers</span>
                    <div className="text-[15px] font-bold text-farmText-dark mt-0.5">
                      {selectedIntervention.farmersCount.toLocaleString('en-IN')} farmers
                    </div>
                  </div>
                </div>

                {/* Detailed Description */}
                <div>
                  <h4 className="text-[12px] font-bold text-farmText-gray uppercase tracking-wider mb-2">
                    Action Plan & Scope
                  </h4>
                  <p className="text-[13px] text-slate-700 leading-relaxed bg-slate-50/60 p-3.5 rounded-lg border border-slate-200 font-medium">
                    {selectedIntervention.description}
                  </p>
                </div>

                {/* Assigned Field Team Contact Card */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-farmText-gray uppercase tracking-wider">
                      Assigned Field Response Unit
                    </span>
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {selectedIntervention.team || 'Unassigned'}
                    </span>
                  </div>

                  {selectedIntervention.team ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {selectedIntervention.teamAvatar || 'FT'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[13px] text-farmText-dark">
                          {selectedIntervention.teamLead || 'Squad Leader'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{selectedIntervention.teamContact || '+91 98490 00000'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12px] text-amber-700 font-medium">
                      No team assigned yet. Click "Mark In Progress" or assign a field unit.
                    </p>
                  )}
                </div>

                {/* Chronological Activity Log */}
                <div>
                  <h4 className="text-[12px] font-bold text-farmText-gray uppercase tracking-wider mb-3">
                    Operation Activity Log
                  </h4>
                  <div className="space-y-2.5 border-l-2 border-slate-200 ml-2 pl-4">
                    {selectedIntervention.activityLog.map((log, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white" />
                        <div className="text-[12px] font-semibold text-slate-800">{log.text}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {log.time} · {log.author}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleEscalate(selectedIntervention.id)}
                  className="px-3.5 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Escalate Priority</span>
                </button>

                <div className="flex items-center gap-2">
                  {selectedIntervention.status !== 'In Progress' && selectedIntervention.status !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedIntervention.id, 'In Progress')}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      Start Operation
                    </button>
                  )}

                  {selectedIntervention.status !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedIntervention.id, 'Completed')}
                      className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Mark Complete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL: "+ NEW INTERVENTION"
         ═══════════════════════════════════════════════════════════ */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsNewModalOpen(false)}
          />

          {/* Dialog Window */}
          <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-farmText-dark tracking-tight">
                    Deploy New Field Intervention
                  </h3>
                  <p className="text-[11px] text-farmText-gray">
                    Commission an agronomy squad or emergency response team
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIntervention} className="space-y-4">
              {/* Row 1: District & Mandal */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1">
                    District
                  </label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full text-[12px] font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
                  >
                    {reportDistrictOptions.filter((d) => d !== 'All Districts').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1">
                    Key Mandal
                  </label>
                  <input
                    type="text"
                    value={newMandal}
                    onChange={(e) => setNewMandal(e.target.value)}
                    placeholder="e.g. Miryalaguda"
                    className="w-full text-[12px] font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Crop, Issue Type, Priority */}
              <div className="grid grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1">
                    Crop
                  </label>
                  <select
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full text-[12px] font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
                  >
                    {['Rice', 'Cotton', 'Chilli', 'Groundnut', 'Maize', 'Soybean', 'Vegetables', 'Turmeric'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1">
                    Issue Type
                  </label>
                  <select
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value as RiskCategory)}
                    className="w-full text-[12px] font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
                  >
                    {legendCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1">
                    Risk Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as RiskLevel)}
                    className="w-full text-[12px] font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Assign Field Team */}
              <div>
                <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1">
                  Assign Field Team
                </label>
                <select
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  className="w-full text-[12px] font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
                >
                  {fieldTeamOptions.filter((t) => t !== 'All Teams').map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 4: Action Title */}
              <div>
                <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1">
                  Intervention Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Deploy 12 High-Pressure Micro Spray Squads"
                  className="w-full text-[12px] font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>

              {/* Row 5: Action Description */}
              <div>
                <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1">
                  Operational Details & Directives
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Specify pesticide formulations, subsidized input quotas, and target villages..."
                  className="w-full text-[12px] font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  required
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Intervention</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CommandCenterLayout>
  );
};

export default InterventionsScreen;
