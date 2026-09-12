import React from 'react';
import {
  Map,
  Flame,
  FileBarChart,
  ShieldAlert,
  Settings,
  Sprout,
  Building2,
  ChevronRight,
} from 'lucide-react';

export interface CommandCenterLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
  onNavChange?: (navId: string) => void;
}

const navItems = [
  { id: 'risk-map',       label: 'Risk Map',       icon: Map },
  { id: 'hotspots',       label: 'Hotspots',       icon: Flame },
  { id: 'reports',        label: 'Reports',         icon: FileBarChart },
  { id: 'interventions',  label: 'Interventions',   icon: ShieldAlert },
  { id: 'settings',       label: 'Settings',        icon: Settings },
];

export const CommandCenterLayout: React.FC<CommandCenterLayoutProps> = ({
  children,
  activeNav = 'risk-map',
  onNavChange,
}) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-farmBg font-sans antialiased">
      {/* ═══════════════════════════════════════════════════════════
          DARK SIDEBAR — #0F172A navy, fixed left, 240px
         ═══════════════════════════════════════════════════════════ */}
      <aside
        className="w-[240px] shrink-0 flex flex-col justify-between select-none"
        style={{ backgroundColor: '#0F172A' }}
      >
        <div>
          {/* ── Logo & Brand ── */}
          <div className="px-5 pt-6 pb-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5 text-primary stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[15px] font-bold text-white tracking-tight block leading-tight">
                FasalSetu
              </span>
              <span className="text-[10px] text-slate-400 font-medium block tracking-wider uppercase">
                Command Center
              </span>
            </div>
          </div>

          {/* ── Separator ── */}
          <div className="mx-4 mb-2 border-t border-slate-700/60" />

          {/* ── Navigation Items ── */}
          <nav className="px-3 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavChange?.(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[13px] font-semibold
                    transition-all duration-200 cursor-pointer relative
                    ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }
                  `}
                >
                  {/* Green left accent bar for active item */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                    />
                  )}
                  <Icon className={`w-[18px] h-[18px] ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Sidebar Footer ── */}
        <div className="px-4 py-4">
          <div className="bg-slate-800/60 rounded-xl p-3 flex items-center gap-2.5 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-emerald-400 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-200 truncate">Agri Department</div>
              <div className="text-[10px] text-slate-400 truncate">Telangana State</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════
          MAIN AREA — Header + Scrollable Content
         ═══════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── White Top Header Bar ── */}
        <header className="h-[60px] bg-white border-b border-farmBorder px-6 flex items-center justify-between shrink-0 z-20">
          <h1 className="text-[17px] font-bold text-farmText-dark tracking-tight">
            Government Command Center
          </h1>
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-slate-400 stroke-[1.8]" />
            <span className="text-farmText-gray font-medium text-[13px]">
              Agri Dept · Telangana
            </span>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center ml-1">
              <span className="text-xs font-bold text-slate-600">TS</span>
            </div>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('fasalsetu_auth');
                  window.location.href = '/';
                } catch {
                  window.location.href = '/';
                }
              }}
              className="ml-2 flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Log Out of Command Center"
            >
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* ── Scrollable Content ── */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CommandCenterLayout;
