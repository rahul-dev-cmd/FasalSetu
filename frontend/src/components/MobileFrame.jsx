import React from 'react';
import StatusBar from './StatusBar';

export default function MobileFrame({
  children,
  framed = true,
  showStatusBar = true,
  darkStatus = true
}) {
  if (!framed) {
    // Native Full Mobile / Responsive View (No simulated phone border)
    return (
      <div className="w-full min-h-screen bg-farmBg flex flex-col relative mx-auto select-none">
        {showStatusBar && <StatusBar dark={darkStatus} />}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    );
  }

  // Framed Device Simulator View
  return (
    <div className="w-full max-w-[400px] h-[844px] max-h-[92vh] bg-farmBg rounded-[36px] shadow-phone border-[8px] border-slate-800 flex flex-col overflow-hidden relative mx-auto select-none transition-all duration-300">
      {/* Dynamic Island / Speaker cutout */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-end pr-3">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800/80"></div>
      </div>

      {/* Top Status Bar */}
      {showStatusBar && <StatusBar dark={darkStatus} />}

      {/* Screen Body */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
        {children}
      </div>

      {/* Bottom Home Indicator */}
      <div className="w-full py-2 bg-transparent flex justify-center items-center pointer-events-none z-30">
        <div className="w-32 h-1 bg-slate-400/60 rounded-full"></div>
      </div>
    </div>
  );
}
