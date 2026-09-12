import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Handshake,
  Tag,
  IndianRupee,
  ChevronRight,
  Sparkles,
  CheckCheck,
  Inbox,
  Filter,
} from 'lucide-react';
import { BuyerLayout } from '../components/BuyerLayout';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & DATA STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

export type AlertCategory = 'all' | 'offers' | 'price' | 'deals' | 'quality';

export interface BuyerAlertItem {
  id: string;
  type: 'offer' | 'price' | 'deal_payment' | 'quality';
  category: 'offers' | 'price' | 'deals' | 'quality';
  dateGroup: 'Today' | 'Yesterday' | 'This Week';
  title: string;
  description: string;
  timestamp: string;
  isUnread: boolean;
  targetRoute: string;
  crop?: string;
  amount?: string;
}

const INITIAL_ALERTS: BuyerAlertItem[] = [
  // ── TODAY ──
  {
    id: 'ALT-01',
    type: 'offer',
    category: 'offers',
    dateGroup: 'Today',
    title: 'Your offer on Rice lot (50 Qtl) was accepted',
    description: 'Farmer Ramesh Ji accepted your counter of ₹1,980/qtl. Electronic weighment scheduled.',
    timestamp: '12 min ago',
    isUnread: true,
    targetRoute: '/buyer/deals',
    crop: 'Rice',
  },
  {
    id: 'ALT-02',
    type: 'offer',
    category: 'offers',
    dateGroup: 'Today',
    title: 'New lot matched your preferences: Cotton',
    description: 'Fresh harvest lot from Warangal district with Grade A certified quality report.',
    timestamp: '1 hour ago',
    isUnread: true,
    targetRoute: '/buyer/browse',
    crop: 'Cotton',
  },
  {
    id: 'ALT-03',
    type: 'price',
    category: 'price',
    dateGroup: 'Today',
    title: 'Rice hit your target price of ₹1,900/quintal',
    description: 'Suryapet APMC — consider placing an offer now.',
    timestamp: '3 hours ago',
    isUnread: true,
    targetRoute: '/buyer/insights',
    crop: 'Rice',
  },

  // ── YESTERDAY ──
  {
    id: 'ALT-04',
    type: 'deal_payment',
    category: 'deals',
    dateGroup: 'Yesterday',
    title: 'Payment of ₹92,500 processed to Shree Balaji Agro Foods',
    description: 'Automated bank payout released following warehouse delivery receipt #REC-819.',
    timestamp: '1 day ago',
    isUnread: false,
    targetRoute: '/buyer/deals',
    amount: '₹92,500',
  },
  {
    id: 'ALT-05',
    type: 'quality',
    category: 'quality',
    dateGroup: 'Yesterday',
    title: 'Quality inspection certified for Nizamabad lot',
    description: 'AI and physical lab grading confirmed Grade A purity with 12.2% moisture content.',
    timestamp: '1 day ago',
    isUnread: false,
    targetRoute: '/buyer/browse',
    crop: 'Maize',
  },

  // ── THIS WEEK ──
  {
    id: 'ALT-06',
    type: 'offer',
    category: 'offers',
    dateGroup: 'This Week',
    title: 'Your offer on Maize lot was declined',
    description: 'Farmer accepted a higher competing offer.',
    timestamp: '3 days ago',
    isUnread: false,
    targetRoute: '/buyer/offers',
    crop: 'Maize',
  },
  {
    id: 'ALT-07',
    type: 'price',
    category: 'price',
    dateGroup: 'This Week',
    title: 'Cotton prices dropped 3.2% this week',
    description: 'Warangal Mandi — potential buying opportunity.',
    timestamp: '4 days ago',
    isUnread: false,
    targetRoute: '/buyer/insights',
    crop: 'Cotton',
  },
  {
    id: 'ALT-08',
    type: 'deal_payment',
    category: 'deals',
    dateGroup: 'This Week',
    title: 'New deal added to Active Deals: Chilli, 25 Quintals',
    description: 'Contract finalized with AgriFresh Retail.',
    timestamp: '6 days ago',
    isUnread: false,
    targetRoute: '/buyer/deals',
    crop: 'Chilli',
  },
];

export const BuyerAlertsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<BuyerAlertItem[]>(INITIAL_ALERTS);
  const [activeTab, setActiveTab] = useState<AlertCategory>('all');

  // Count unread alerts dynamically
  const unreadCount = useMemo(() => {
    return alerts.filter((a) => a.isUnread).length;
  }, [alerts]);

  // Tab counters
  const tabCounts = useMemo(() => {
    return {
      all: alerts.length,
      offers: alerts.filter((a) => a.category === 'offers').length,
      price: alerts.filter((a) => a.category === 'price').length,
      deals: alerts.filter((a) => a.category === 'deals').length,
      quality: alerts.filter((a) => a.category === 'quality').length,
    };
  }, [alerts]);

  // Filter alerts by category
  const filteredAlerts = useMemo(() => {
    if (activeTab === 'all') return alerts;
    return alerts.filter((a) => a.category === activeTab);
  }, [alerts, activeTab]);

  // Group filtered alerts by date headers (Today, Yesterday, This Week)
  const groupedAlerts = useMemo(() => {
    const groups: { group: 'Today' | 'Yesterday' | 'This Week'; items: BuyerAlertItem[] }[] = [];
    const dateHeaders: ('Today' | 'Yesterday' | 'This Week')[] = ['Today', 'Yesterday', 'This Week'];

    dateHeaders.forEach((dh) => {
      const matched = filteredAlerts.filter((a) => a.dateGroup === dh);
      if (matched.length > 0) {
        groups.push({ group: dh, items: matched });
      }
    });

    return groups;
  }, [filteredAlerts]);

  // Mark all alerts as read
  const handleMarkAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isUnread: false })));
  };

  // Mark single alert as read and navigate
  const handleAlertClick = (alert: BuyerAlertItem) => {
    if (alert.isUnread) {
      setAlerts((prev) =>
        prev.map((item) => (item.id === alert.id ? { ...item, isUnread: false } : item))
      );
    }
    navigate(alert.targetRoute);
  };

  // Render Left Badge Icon
  const renderAlertIcon = (type: BuyerAlertItem['type']) => {
    switch (type) {
      case 'offer':
        return (
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#0D9488] flex items-center justify-center shrink-0 shadow-xs">
            <Handshake className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'price':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <TrendingUp className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'deal_payment':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'quality':
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 stroke-[2]" />
          </div>
        );
    }
  };

  return (
    <BuyerLayout activeTab="alerts" unreadAlertsCount={unreadCount}>
      <div className="space-y-6 pb-12">
        {/* ========================================================
            HEADER ROW
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Alerts
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0D9488] text-white shadow-xs">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-sm md:text-base text-slate-500 mt-1">
              Stay updated on offers, price movements, and deal activity
            </p>
          </div>

          {/* Top-Right: Mark all as read */}
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-slate-600 hover:text-[#0D9488] transition-colors cursor-pointer self-start sm:self-auto hover:underline"
            >
              <CheckCheck className="w-4 h-4 text-[#0D9488]" />
              <span>Mark all as read</span>
            </button>
          ) : (
            <span className="text-xs md:text-sm text-slate-400 font-medium self-start sm:self-auto flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>All alerts caught up</span>
            </span>
          )}
        </div>

        {/* ========================================================
            TAB ROW (Pill-Style Tabs)
           ======================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>All</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tabCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'offers'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Offers</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === 'offers' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
              }`}
            >
              {tabCounts.offers}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('price')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'price'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Price Alerts</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === 'price' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {tabCounts.price}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deals')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'deals'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Deals & Payments</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === 'deals' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {tabCounts.deals}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quality')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'quality'
                ? 'bg-[#0D9488] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Quality Reports</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === 'quality' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {tabCounts.quality}
            </span>
          </button>
        </div>

        {/* ========================================================
            MAIN CONTENT — VERTICAL LIST OF ALERTS
           ======================================================== */}
        <div className="space-y-6">
          {groupedAlerts.length > 0 ? (
            groupedAlerts.map(({ group, items }) => (
              <div key={group} className="space-y-3">
                {/* Date Group Header */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {group}
                  </span>
                  <div className="flex-1 h-px bg-slate-200/80" />
                </div>

                {/* Stack of Alert Cards for this Date Group */}
                <div className="space-y-3">
                  {items.map((alert) => {
                    const isUnread = alert.isUnread;

                    return (
                      <div
                        key={alert.id}
                        onClick={() => handleAlertClick(alert)}
                        className={`rounded-xl border transition-all cursor-pointer p-4 md:p-5 flex items-start justify-between gap-4 group shadow-2xs hover:shadow-md ${
                          isUnread
                            ? 'bg-teal-50/40 border-teal-200/80 hover:bg-teal-50/70'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        {/* Left Icon Badge */}
                        <div className="shrink-0">{renderAlertIcon(alert.type)}</div>

                        {/* Middle: Title, Description, Timestamp */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3
                              className={`text-sm md:text-base font-bold transition-colors ${
                                isUnread ? 'text-slate-900' : 'text-slate-800'
                              } group-hover:text-[#0D9488]`}
                            >
                              {alert.title}
                            </h3>
                          </div>

                          <p className="text-xs md:text-sm text-slate-500 mt-1 leading-relaxed">
                            {alert.description}
                          </p>

                          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-400 font-medium">
                            <span>{alert.timestamp}</span>
                            {alert.crop && (
                              <>
                                <span>•</span>
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">
                                  {alert.crop}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Right: Unread Teal Dot & Chevron */}
                        <div className="flex items-center gap-2.5 shrink-0 self-center">
                          {isUnread && (
                            <span
                              className="w-2.5 h-2.5 rounded-full bg-[#0D9488] ring-4 ring-teal-100"
                              title="Unread alert"
                            />
                          )}
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0D9488] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            /* ========================================================
               EMPTY STATE
               ======================================================== */
            <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-4">
                <Inbox className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No alerts here
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                You're all caught up! There are no notifications in this category.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-5 py-2.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs md:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                View All Alerts
              </button>
            </div>
          )}
        </div>
      </div>
    </BuyerLayout>
  );
};

export default BuyerAlertsScreen;
