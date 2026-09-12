import React, { useState, useMemo } from 'react';
import {
  Tag,
  Sprout,
  AlertTriangle,
  CloudRain,
  CheckCircle2,
  CheckCheck,
  ChevronRight,
  Clock,
  BellOff,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { initialMockAlerts, AlertItem, AlertType, AlertDateGroup } from '../data/mockAlertsData';

export interface AlertsScreenProps {
  forceMobile?: boolean;
  onNavigateHome?: () => void;
  onNavigateMarket?: () => void;
  onNavigateLots?: () => void;
  onNavigateOffers?: (alert: AlertItem) => void;
  onNavigateNegotiation?: (alert: AlertItem) => void;
  onNavigateCropHealthResult?: (alert: AlertItem) => void;
  onNavigateWeather?: (alert: AlertItem) => void;
  onNavigateTransaction?: (alert: AlertItem) => void;
  onNavigateProfile?: () => void;
  alerts?: AlertItem[];
  onAlertsChange?: (updatedAlerts: AlertItem[]) => void;
}

type TabFilter = 'All' | 'Offers' | 'Crop Health' | 'Weather' | 'Payments';

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  forceMobile = false,
  onNavigateHome,
  onNavigateMarket,
  onNavigateLots,
  onNavigateOffers,
  onNavigateNegotiation,
  onNavigateCropHealthResult,
  onNavigateWeather,
  onNavigateTransaction,
  onNavigateProfile,
  alerts: propAlerts,
  onAlertsChange,
}) => {
  // ── State for Alerts ───────────────────────────────────────────────
  const [alerts, setAlerts] = useState<AlertItem[]>(propAlerts || initialMockAlerts);
  const [selectedTab, setSelectedTab] = useState<TabFilter>('All');

  // Keep parent in sync if provided
  const updateAlerts = (newAlerts: AlertItem[]) => {
    setAlerts(newAlerts);
    if (onAlertsChange) {
      onAlertsChange(newAlerts);
    }
  };

  // ── Unread Count ───────────────────────────────────────────────────
  const unreadCount = useMemo(() => alerts.filter((a) => !a.isRead).length, [alerts]);

  // ── Mark All As Read ───────────────────────────────────────────────
  const handleMarkAllAsRead = () => {
    const updated = alerts.map((a) => ({ ...a, isRead: true }));
    updateAlerts(updated);
  };

  // ── Handle Alert Card Click ────────────────────────────────────────
  const handleAlertClick = (alert: AlertItem) => {
    // 1. Mark as read
    if (!alert.isRead) {
      const updated = alerts.map((a) => (a.id === alert.id ? { ...a, isRead: true } : a));
      updateAlerts(updated);
    }

    // 2. Navigate based on targetAction
    if (alert.targetAction === 'matched-buyers' && onNavigateOffers) {
      onNavigateOffers(alert);
    } else if (alert.targetAction === 'negotiation' && onNavigateNegotiation) {
      onNavigateNegotiation(alert);
    } else if (alert.targetAction === 'crop-health-result' && onNavigateCropHealthResult) {
      onNavigateCropHealthResult(alert);
    } else if (alert.targetAction === 'weather-irrigation' && onNavigateWeather) {
      onNavigateWeather(alert);
    } else if (alert.targetAction === 'transaction-status' && onNavigateTransaction) {
      onNavigateTransaction(alert);
    }
  };

  // ── Filtered Alerts ────────────────────────────────────────────────
  const filteredAlerts = useMemo(() => {
    if (selectedTab === 'All') return alerts;
    if (selectedTab === 'Offers') return alerts.filter((a) => a.type === 'offer');
    if (selectedTab === 'Crop Health') return alerts.filter((a) => a.type === 'crop-health');
    if (selectedTab === 'Weather') return alerts.filter((a) => a.type === 'weather');
    if (selectedTab === 'Payments') return alerts.filter((a) => a.type === 'payment');
    return alerts;
  }, [alerts, selectedTab]);

  // ── Group by Date ──────────────────────────────────────────────────
  const groupedAlerts = useMemo(() => {
    const groups: { key: AlertDateGroup; label: string; items: AlertItem[] }[] = [
      { key: 'today', label: 'TODAY', items: [] },
      { key: 'yesterday', label: 'YESTERDAY', items: [] },
      { key: 'this_week', label: 'THIS WEEK', items: [] },
    ];

    filteredAlerts.forEach((item) => {
      const g = groups.find((grp) => grp.key === item.dateGroup);
      if (g) {
        g.items.push(item);
      }
    });

    // Only return groups that have items
    return groups.filter((g) => g.items.length > 0);
  }, [filteredAlerts]);

  // ── Tab Counts ─────────────────────────────────────────────────────
  const tabCounts = useMemo(() => {
    return {
      All: alerts.length,
      Offers: alerts.filter((a) => a.type === 'offer').length,
      'Crop Health': alerts.filter((a) => a.type === 'crop-health').length,
      Weather: alerts.filter((a) => a.type === 'weather').length,
      Payments: alerts.filter((a) => a.type === 'payment').length,
    };
  }, [alerts]);

  // ── Icon & Badge Style Helper ──────────────────────────────────────
  const renderAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'offer':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-primary flex items-center justify-center shadow-xs shrink-0">
            <Tag className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case 'crop-health':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-100/90 text-rose-600 flex items-center justify-center shadow-xs shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case 'weather':
        return (
          <div className="w-10 h-10 rounded-xl bg-sky-100/90 text-sky-600 flex items-center justify-center shadow-xs shrink-0">
            <CloudRain className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
      case 'payment':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
          </div>
        );
    }
  };

  const tabs: TabFilter[] = ['All', 'Offers', 'Crop Health', 'Weather', 'Payments'];

  return (
    <DashboardLayout
      activeTab="alerts"
      unreadAlertsCount={0}
      forceMobile={forceMobile}
      onTabChange={(tab) => {
        if (tab === 'home' && onNavigateHome) onNavigateHome();
        if (tab === 'market' && onNavigateMarket) onNavigateMarket();
        if (tab === 'my-lots' && onNavigateLots) onNavigateLots();
        if (tab === 'profile' && onNavigateProfile) onNavigateProfile();
      }}
    >
      <div className="space-y-4 sm:space-y-5 pb-8 max-w-4xl mx-auto">
        {/* ========================================================
            HEADER ROW
            Title + Subtitle + "Mark all as read" link
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-farmBorder shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-farmText-dark tracking-tight leading-tight">
                Alerts
              </h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-urgent/10 text-urgent border border-urgent/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-urgent animate-pulse" />
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-farmText-gray font-normal mt-0.5">
              Stay updated on your crops, offers, and weather
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 hover:text-primary font-medium hover:underline transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-50"
              >
                <CheckCheck className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                <span>Mark all as read</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium py-1 px-2">
                <CheckCheck className="w-4 h-4 text-emerald-500" />
                <span>All caught up</span>
              </span>
            )}
          </div>
        </div>

        {/* ========================================================
            TAB FILTER ROW (Pill style)
            Active tab green fill, inactive white/outline
           ======================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab;
            const count = tabCounts[tab];
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            MAIN CONTENT — Grouped List of Alert Cards
           ======================================================== */}
        <div className="space-y-4">
          {groupedAlerts.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-farmBorder p-10 sm:p-14 text-center shadow-xs flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary mb-3.5 shadow-2xs">
                <BellOff className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-farmText-dark">
                No alerts here
              </h3>
              <p className="text-xs sm:text-sm text-farmText-gray mt-1 max-w-sm">
                You're all caught up! No notifications currently in the "{selectedTab}" category.
              </p>
              {selectedTab !== 'All' && (
                <button
                  type="button"
                  onClick={() => setSelectedTab('All')}
                  className="mt-4 bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>View All Alerts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            groupedAlerts.map((group) => (
              <div key={group.key} className="space-y-2.5">
                {/* Date Group Header */}
                <div className="flex items-center gap-3 pt-2 pb-1">
                  <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-slate-200/80" />
                </div>

                {/* Stack of Cards in this Date Group */}
                <div className="space-y-2.5">
                  {group.items.map((alert) => {
                    const isUnread = !alert.isRead;
                    return (
                      <div
                        key={alert.id}
                        onClick={() => handleAlertClick(alert)}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer group flex items-start gap-3.5 relative overflow-hidden select-none ${
                          isUnread
                            ? 'bg-emerald-50/40 border-emerald-200/90 shadow-2xs hover:border-primary/50 hover:bg-emerald-50/60'
                            : 'bg-white border-farmBorder shadow-2xs hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Unread Left Border Highlight Indicator */}
                        {isUnread && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                        )}

                        {/* Icon Badge */}
                        <div className="pt-0.5">{renderAlertIcon(alert.type)}</div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm tracking-tight leading-snug truncate ${
                                isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                              }`}
                            >
                              {alert.title}
                            </h4>
                          </div>

                          <p className="text-xs sm:text-[13px] text-slate-600 mt-0.5 leading-relaxed">
                            {alert.description}
                          </p>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>{alert.timestamp}</span>
                          </div>
                        </div>

                        {/* Right: Unread indicator Dot + Chevron */}
                        <div className="flex items-center gap-2 self-center shrink-0">
                          {isUnread && (
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/20 shrink-0"
                              title="Unread alert"
                            />
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlertsScreen;
