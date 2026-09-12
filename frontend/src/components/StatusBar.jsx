import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export default function StatusBar({ dark = true }) {
  return (
    <div className={`w-full px-6 pt-3 pb-2 flex items-center justify-between text-xs font-semibold select-none z-20 ${dark ? 'text-slate-800' : 'text-white'}`}>
      {/* Time */}
      <span className="tracking-tight text-sm font-bold">9:41</span>
      
      {/* Notch / Dynamic Island pill placeholder */}
      <div className="w-20 h-4 bg-slate-900/90 rounded-full mx-auto -mt-1 hidden sm:block opacity-20"></div>

      {/* System Icons */}
      <div className="flex items-center space-x-2">
        <Signal className="w-3.5 h-3.5 stroke-[2.2]" />
        <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />
        <div className="flex items-center space-x-1">
          <BatteryMedium className="w-4 h-4 stroke-[2.2]" />
        </div>
      </div>
    </div>
  );
}
