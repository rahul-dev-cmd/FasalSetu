import React from 'react';
import LeftBrandPanel, { LeftBrandPanelProps } from './LeftBrandPanel';

export interface OnboardingLayoutProps {
  children: React.ReactNode;
  brandPanelProps?: LeftBrandPanelProps;
  forceMobile?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  brandPanelProps,
  forceMobile = false,
}) => {
  if (forceMobile) {
    // Strictly Enforced Phone Mockup Layout (Used when previewing mobile width on wide screens)
    return (
      <div className="w-full flex justify-center items-center py-4 bg-slate-900 min-h-screen">
        <div className="w-full max-w-[400px] min-h-[720px] bg-white rounded-[32px] shadow-2xl border-[6px] border-slate-800 overflow-hidden flex flex-col relative select-none">
          {/* Top Speaker / Camera pill notch */}
          <div className="w-24 h-3.5 bg-slate-900 rounded-full mx-auto mt-2 mb-1 z-30 shrink-0" />

          {/* Top Mobile Hero Banner */}
          <LeftBrandPanel {...brandPanelProps} forceMobile={true} />

          {/* Form Content Body */}
          <div className="w-full flex-1 bg-farmBg p-4 sm:p-5 flex flex-col justify-between overflow-y-auto">
            {children}
          </div>

          {/* Bottom Home Indicator */}
          <div className="w-full py-1.5 bg-farmBg flex justify-center items-center shrink-0">
            <div className="w-28 h-1 bg-slate-400/50 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Standard Responsive Layout (Single column on mobile, Two-column split on desktop >= 768px)
  return (
    <div className="w-full min-h-screen bg-farmBg flex items-center justify-center p-0 md:p-6 lg:p-10 font-sans text-farmText-dark antialiased">
      <div className="w-full min-h-screen md:min-h-[580px] md:max-w-4xl lg:max-w-5xl bg-white md:rounded-2xl md:shadow-lg md:border md:border-farmBorder overflow-hidden flex flex-col md:flex-row">
        {/* Left Panel: Mobile Top Hero (<md) / Desktop Split Left (>=md) */}
        <LeftBrandPanel {...brandPanelProps} forceMobile={false} />

        {/* Right Panel: Form Content Body */}
        <div className="w-full md:w-1/2 lg:w-[52%] flex-1 bg-farmBg md:bg-white p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
