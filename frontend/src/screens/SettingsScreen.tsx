import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Shield,
  Database,
  Mail,
  CheckCircle2,
  X,
  Plus,
  RotateCcw,
  Camera,
  Building2,
  Smartphone,
  Radio,
  Sliders,
  Check,
  ChevronRight,
  Sparkles,
  Info,
  Lock,
  Globe,
  RadioTower,
} from 'lucide-react';
import CommandCenterLayout from '../components/CommandCenterLayout';

interface SettingsScreenProps {
  onNavChange?: (navId: string) => void;
}

type SettingsTab =
  | 'profile'
  | 'alert-preferences'
  | 'team-access'
  | 'data-integrations'
  | 'notifications';

const initialDistricts = [
  'Nalgonda',
  'Warangal',
  'Khammam',
  'Mahabubnagar',
  'Karimnagar',
];

const availableTelanganaDistricts = [
  'Adilabad',
  'Bhadradri Kothagudem',
  'Hyderabad',
  'Jagtial',
  'Mancherial',
  'Medak',
  'Nagarkurnool',
  'Nizamabad',
  'Rangareddy',
  'Siddipet',
  'Suryapet',
  'Vikarabad',
  'Wanaparthy',
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavChange }) => {
  // ── Active Tab ────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // ── Profile Form State ────────────────────────────────────────────
  const [fullName, setFullName] = useState('T. Sharma');
  const [designation, setDesignation] = useState('Agricultural Officer');
  const [department, setDepartment] = useState('Agri Dept · Telangana');
  const [email, setEmail] = useState('t.sharma@telangana.gov.in');
  const [phone, setPhone] = useState('+91 98490 12345');

  // ── Regional Access State ─────────────────────────────────────────
  const [monitoredDistricts, setMonitoredDistricts] = useState<string[]>(initialDistricts);
  const [isAllDistrictsEnabled, setIsAllDistrictsEnabled] = useState<boolean>(false);
  const [districtToAdd, setDistrictToAdd] = useState<string>('');

  // ── Alert Thresholds State ────────────────────────────────────────
  const [highRiskThreshold, setHighRiskThreshold] = useState<number>(10000);
  const [medRiskThreshold, setMedRiskThreshold] = useState<number>(5000);
  const [escalationDelay, setEscalationDelay] = useState<string>('24 hours');
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState<boolean>(true);
  const [emailDigestEnabled, setEmailDigestEnabled] = useState<boolean>(true);
  const [pushAlertsEnabled, setPushAlertsEnabled] = useState<boolean>(true);

  // ── Toast Notification State ──────────────────────────────────────
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleRemoveDistrict = (districtToRemove: string) => {
    setMonitoredDistricts((prev) => prev.filter((d) => d !== districtToRemove));
    setToastMessage(`Removed ${districtToRemove} from monitored list`);
  };

  const handleAddDistrict = () => {
    if (!districtToAdd) return;
    if (monitoredDistricts.includes(districtToAdd)) {
      setToastMessage(`${districtToAdd} is already in your monitored list`);
      return;
    }
    setMonitoredDistricts((prev) => [...prev, districtToAdd]);
    setToastMessage(`✓ Added ${districtToAdd} to monitored list`);
    setDistrictToAdd('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('✓ Department profile updated successfully');
  };

  const handleSaveAllSettings = () => {
    setToastMessage('✓ All Command Center settings saved successfully');
  };

  const handleResetDefaults = () => {
    setFullName('T. Sharma');
    setDesignation('Agricultural Officer');
    setDepartment('Agri Dept · Telangana');
    setEmail('t.sharma@telangana.gov.in');
    setPhone('+91 98490 12345');
    setMonitoredDistricts(initialDistricts);
    setIsAllDistrictsEnabled(false);
    setHighRiskThreshold(10000);
    setMedRiskThreshold(5000);
    setEscalationDelay('24 hours');
    setSmsAlertsEnabled(true);
    setToastMessage('Settings reset to default values');
  };

  // Remaining districts that can be added
  const remainingDistricts = availableTelanganaDistricts.filter(
    (d) => !monitoredDistricts.includes(d)
  );

  return (
    <CommandCenterLayout activeNav="settings" onNavChange={onNavChange}>
      <div className="space-y-6 max-w-[1300px] mx-auto pb-12">
        {/* ═══════════════════════════════════════════════════════════
            TOAST ALERT BANNER
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
        <div>
          <h2 className="text-[22px] sm:text-[26px] font-bold text-farmText-dark tracking-tight leading-tight">
            Settings
          </h2>
          <p className="text-[13px] text-farmText-gray mt-1">
            Manage department preferences, alerts, and access controls
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            SETTINGS MASTER CONTAINER (WHITE CARD WITH INTERNAL DIVIDER)
           ═══════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[640px]">
          {/* ─────────────────────────────────────────────────────────
              LEFT TAB RAIL (~220px wide)
             ───────────────────────────────────────────────────────── */}
          <aside className="w-full md:w-[230px] border-b md:border-b-0 md:border-r border-slate-100 p-4 bg-slate-50/40 shrink-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              System Settings
            </div>

            <nav className="space-y-1">
              {/* Tab 1: Profile & Department */}
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`
                  w-full text-left px-3.5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2.5 transition-all cursor-pointer
                  ${
                    activeTab === 'profile'
                      ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }
                `}
              >
                <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-primary stroke-[2.3]' : 'text-slate-400'}`} />
                <span>Profile & Dept</span>
              </button>

              {/* Tab 2: Alert Preferences */}
              <button
                type="button"
                onClick={() => setActiveTab('alert-preferences')}
                className={`
                  w-full text-left px-3.5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2.5 transition-all cursor-pointer
                  ${
                    activeTab === 'alert-preferences'
                      ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }
                `}
              >
                <Bell className={`w-4 h-4 ${activeTab === 'alert-preferences' ? 'text-primary stroke-[2.3]' : 'text-slate-400'}`} />
                <span>Alert Preferences</span>
              </button>

              {/* Tab 3: Team & Access */}
              <button
                type="button"
                onClick={() => setActiveTab('team-access')}
                className={`
                  w-full text-left px-3.5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2.5 transition-all cursor-pointer
                  ${
                    activeTab === 'team-access'
                      ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }
                `}
              >
                <Shield className={`w-4 h-4 ${activeTab === 'team-access' ? 'text-primary stroke-[2.3]' : 'text-slate-400'}`} />
                <span>Team & Access</span>
              </button>

              {/* Tab 4: Data & Integrations */}
              <button
                type="button"
                onClick={() => setActiveTab('data-integrations')}
                className={`
                  w-full text-left px-3.5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2.5 transition-all cursor-pointer
                  ${
                    activeTab === 'data-integrations'
                      ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }
                `}
              >
                <Database className={`w-4 h-4 ${activeTab === 'data-integrations' ? 'text-primary stroke-[2.3]' : 'text-slate-400'}`} />
                <span>Data & Feeds</span>
              </button>

              {/* Tab 5: Notifications */}
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`
                  w-full text-left px-3.5 py-2.5 rounded-lg text-[13px] font-semibold flex items-center gap-2.5 transition-all cursor-pointer
                  ${
                    activeTab === 'notifications'
                      ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }
                `}
              >
                <Mail className={`w-4 h-4 ${activeTab === 'notifications' ? 'text-primary stroke-[2.3]' : 'text-slate-400'}`} />
                <span>Notifications</span>
              </button>
            </nav>

            <div className="mt-8 pt-4 border-t border-slate-200/60 px-3">
              <div className="text-[11px] font-bold text-slate-700">Telangana Command</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Version 2.4.0 (Govt Core)</div>
            </div>
          </aside>

          {/* ─────────────────────────────────────────────────────────
              RIGHT CONTENT PANEL
             ───────────────────────────────────────────────────────── */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {/* ═══════════════════════════════════════════════════════
                TAB 1: PROFILE & DEPARTMENT (PRIMARY)
               ═══════════════════════════════════════════════════════ */}
            {activeTab === 'profile' && (
              <div className="space-y-8 max-w-2xl">
                {/* ── Section 1: Department Profile ── */}
                <div>
                  <h3 className="text-[16px] font-bold text-farmText-dark tracking-tight mb-1">
                    Department Profile
                  </h3>
                  <p className="text-[12px] text-farmText-muted mb-4">
                    Personal and official administrative credentials registered with Telangana Agri Dept
                  </p>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {/* Avatar Row */}
                    <div className="flex items-center gap-4 pb-2">
                      <div className="w-14 h-14 rounded-full bg-slate-800 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs border-2 border-slate-100">
                        TS
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => setToastMessage('Photo upload dialog opened')}
                          className="text-[12px] font-semibold text-primary hover:text-primary-dark cursor-pointer flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Change Photo</span>
                        </button>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          JPG, PNG or GIF up to 2MB. Displayed across reports.
                        </p>
                      </div>
                    </div>

                    {/* Full Name & Designation */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full text-[13px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1.5">
                          Designation
                        </label>
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full text-[13px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Department & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1.5">
                          Department
                        </label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full text-[13px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full text-[13px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="max-w-xs">
                      <label className="block text-[11px] font-bold text-farmText-gray uppercase tracking-wider mb-1.5">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-[13px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-2xs"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary-dark text-white font-bold text-[12px] px-4 py-2 rounded-lg transition-all shadow-xs cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>

                <div className="border-t border-slate-100" />

                {/* ── Section 2: Regional Access ── */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[16px] font-bold text-farmText-dark tracking-tight">
                      Regional Access
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAllDistrictsEnabled}
                        onChange={(e) => {
                          setIsAllDistrictsEnabled(e.target.checked);
                          setToastMessage(
                            e.target.checked
                              ? 'Statewide monitoring enabled for all 33 districts'
                              : 'Reverted to district-specific monitoring'
                          );
                        }}
                        className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary/30 accent-primary cursor-pointer"
                      />
                      <span className="text-[12px] font-bold text-slate-700">
                        All Districts (Statewide Command)
                      </span>
                    </label>
                  </div>
                  <p className="text-[12px] text-farmText-muted mb-3.5">
                    Districts under your active surveillance and automated notification routing
                  </p>

                  {/* Multi-select Chip List */}
                  <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 mb-3.5">
                    <div className="flex flex-wrap gap-2 items-center">
                      {isAllDistrictsEnabled ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-primary text-white shadow-2xs">
                          <Globe className="w-3 h-3" />
                          <span>All 33 Telangana Districts (Statewide Scope)</span>
                        </span>
                      ) : (
                        monitoredDistricts.map((district) => (
                          <span
                            key={district}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#DCFCE7] text-emerald-800 border border-emerald-200/70 shadow-2xs group"
                          >
                            <span>{district}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveDistrict(district)}
                              className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-emerald-300/50 text-emerald-900 transition-colors cursor-pointer"
                              title={`Remove ${district}`}
                            >
                              <X className="w-2.5 h-2.5 stroke-[2.5]" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add District Dropdown */}
                  {!isAllDistrictsEnabled && (
                    <div className="flex items-center gap-2 max-w-sm">
                      <select
                        value={districtToAdd}
                        onChange={(e) => setDistrictToAdd(e.target.value)}
                        className="text-[12px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-2 flex-1 shadow-2xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
                      >
                        <option value="">Select district to add...</option>
                        {remainingDistricts.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={!districtToAdd}
                        onClick={handleAddDistrict}
                        className={`
                          px-3.5 py-2 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer
                          ${
                            districtToAdd
                              ? 'bg-primary hover:bg-primary-dark text-white'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          }
                        `}
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add District</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100" />

                {/* ── Section 3: Alert Thresholds ── */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-farmText-dark tracking-tight">
                      Alert Thresholds
                    </h3>
                    <p className="text-[12px] text-farmText-muted mt-0.5">
                      Define automated trigger parameters for high and medium risk zone alarms
                    </p>
                  </div>

                  <div className="space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
                    {/* High Risk Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[12px] font-bold text-slate-800">
                          High Risk Alert Threshold
                        </label>
                        <span className="text-[12px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                          &gt; {highRiskThreshold.toLocaleString('en-IN')} hectares
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5000}
                        max={25000}
                        step={1000}
                        value={highRiskThreshold}
                        onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
                        className="w-full accent-red-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>5,000 ha</span>
                        <span>25,000 ha</span>
                      </div>
                    </div>

                    {/* Medium Risk Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[12px] font-bold text-slate-800">
                          Medium Risk Alert Threshold
                        </label>
                        <span className="text-[12px] font-extrabold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          &gt; {medRiskThreshold.toLocaleString('en-IN')} hectares
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1000}
                        max={10000}
                        step={500}
                        value={medRiskThreshold}
                        onChange={(e) => setMedRiskThreshold(Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>1,000 ha</span>
                        <span>10,000 ha</span>
                      </div>
                    </div>

                    {/* Auto-escalation delay */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <div>
                        <div className="text-[12px] font-bold text-slate-800">Auto-escalation Delay</div>
                        <div className="text-[11px] text-slate-400">Escalate unassigned high risk alarms</div>
                      </div>
                      <select
                        value={escalationDelay}
                        onChange={(e) => setEscalationDelay(e.target.value)}
                        className="text-[12px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
                      >
                        <option value="24 hours">24 hours</option>
                        <option value="48 hours">48 hours</option>
                        <option value="72 hours">72 hours</option>
                      </select>
                    </div>

                    {/* Toggle: SMS Alerts */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <div>
                        <div className="text-[12px] font-bold text-slate-800">
                          Enable SMS alerts for High Risk zones
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Instant emergency dispatch notifications sent to verified mobile
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSmsAlertsEnabled((prev) => !prev);
                          setToastMessage(
                            !smsAlertsEnabled ? 'High risk SMS alerts activated' : 'SMS alerts disabled'
                          );
                        }}
                        className={`
                          relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer
                          ${smsAlertsEnabled ? 'bg-primary' : 'bg-slate-300'}
                        `}
                      >
                        <span
                          className={`
                            absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
                            ${smsAlertsEnabled ? 'translate-x-5.5' : 'translate-x-0.5'}
                          `}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Bottom of Panel Actions ── */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="text-[12px] font-semibold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Defaults</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAllSettings}
                    className="bg-primary hover:bg-primary-dark text-white font-bold text-[13px] px-5 py-2.5 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Save All Settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 2: ALERT PREFERENCES (STUB/RICH PREVIEW)
               ═══════════════════════════════════════════════════════ */}
            {activeTab === 'alert-preferences' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-[16px] font-bold text-farmText-dark tracking-tight">
                    Alert Preferences & Dispatch Channels
                  </h3>
                  <p className="text-[12px] text-farmText-muted mt-0.5">
                    Configure automated communication triggers across emergency squads
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">Critical Disease Outbreaks</div>
                      <div className="text-[11px] text-slate-500">Paddy blast, bacterial blight, and rust alerts</div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Immediate (SMS + Push)
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">Pest Infestation Surge</div>
                      <div className="text-[11px] text-slate-500">Pink Bollworm and Fall Armyworm threshold triggers</div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Immediate (SMS + Push)
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">Waterlogging & Canal Flood Alerts</div>
                      <div className="text-[11px] text-slate-500">Canal inundation sensor warnings from Godavari grid</div>
                    </div>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                      Standard Routing
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setToastMessage('✓ Alert channels synchronized')}
                  className="bg-primary text-white font-bold text-[12px] px-4 py-2 rounded-lg shadow-xs cursor-pointer"
                >
                  Update Alert Rules
                </button>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 3: TEAM & ACCESS (STUB/RICH PREVIEW)
               ═══════════════════════════════════════════════════════ */}
            {activeTab === 'team-access' && (
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-bold text-farmText-dark tracking-tight">
                      Field Command Team & Access Permissions
                    </h3>
                    <p className="text-[12px] text-farmText-muted mt-0.5">
                      Authorized agronomists and DAO field leads across Telangana
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToastMessage('Invite squad leader dialog opened')}
                    className="bg-primary text-white font-semibold text-[12px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Invite Officer</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {[
                    { name: 'Dr. K. Srinivas', role: 'East Command Lead', dist: 'Warangal, Suryapet', status: 'Active' },
                    { name: 'Er. Ramesh V.', role: 'Central Drainage Officer', dist: 'Mahabubnagar', status: 'Active' },
                    { name: 'M. Anitha', role: 'North Command Specialist', dist: 'Nizamabad, Karimnagar', status: 'Active' },
                    { name: 'P. Rajesh', role: 'South Agro Lead', dist: 'Khammam, Medak', status: 'Active' },
                  ].map((lead, i) => (
                    <div
                      key={i}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                          {lead.name.split(' ')[1]?.[0] || 'O'}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-slate-800">{lead.name}</div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {lead.role} · {lead.dist}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {lead.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 4: DATA & INTEGRATIONS (STUB/RICH PREVIEW)
               ═══════════════════════════════════════════════════════ */}
            {activeTab === 'data-integrations' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-[16px] font-bold text-farmText-dark tracking-tight">
                    Satellite Telemetry & Earth Observation Feeds
                  </h3>
                  <p className="text-[12px] text-farmText-muted mt-0.5">
                    Live integrations feeding the FasalSetu AI Command Core
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RadioTower className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-[13px] font-bold text-slate-800">ISRO Bhuvan Geo-Portal</div>
                        <div className="text-[11px] text-slate-500">Multi-spectral vegetation index (5-day cadence)</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Connected · 99.8% Uptime
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-[13px] font-bold text-slate-800">ESA Sentinel-2 Radar Pass</div>
                        <div className="text-[11px] text-slate-500">Synthetic aperture radar for soil moisture scanning</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Active Telemetry
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-[13px] font-bold text-slate-800">Telangana Rythu Vedika Network</div>
                        <div className="text-[11px] text-slate-500">2,604 cluster centers live farmer registry sync</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Synchronized (1.4M Farmers)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 5: NOTIFICATIONS (STUB/RICH PREVIEW)
               ═══════════════════════════════════════════════════════ */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-[16px] font-bold text-farmText-dark tracking-tight">
                    Notification Digest & Briefings
                  </h3>
                  <p className="text-[12px] text-farmText-muted mt-0.5">
                    Schedule automated summaries and critical threshold alarms
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">Daily Morning Briefing</div>
                      <div className="text-[11px] text-slate-500">Comprehensive risk summary emailed at 08:00 AM</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailDigestEnabled((prev) => !prev)}
                      className={`
                        relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer
                        ${emailDigestEnabled ? 'bg-primary' : 'bg-slate-300'}
                      `}
                    >
                      <span
                        className={`
                          absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
                          ${emailDigestEnabled ? 'translate-x-5.5' : 'translate-x-0.5'}
                        `}
                      />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">Mobile Push Alarms</div>
                      <div className="text-[11px] text-slate-500">Real-time alerts for priority zone escalations</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPushAlertsEnabled((prev) => !prev)}
                      className={`
                        relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer
                        ${pushAlertsEnabled ? 'bg-primary' : 'bg-slate-300'}
                      `}
                    >
                      <span
                        className={`
                          absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
                          ${pushAlertsEnabled ? 'translate-x-5.5' : 'translate-x-0.5'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </CommandCenterLayout>
  );
};

export default SettingsScreen;
