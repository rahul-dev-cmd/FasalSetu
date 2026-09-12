import React from 'react';
import { Home, TrendingUp, Bell, User } from 'lucide-react';

export default function BottomNav({ activeTab = 'home', onTabChange = () => {} }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'market', label: 'Mandi', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="w-full bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-sm select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors relative ${
              isActive ? 'text-primary font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              {tab.badge && (
                <span className="absolute -top-1 -right-2 bg-danger text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
