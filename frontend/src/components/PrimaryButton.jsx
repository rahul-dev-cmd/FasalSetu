import React from 'react';

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button'
}) {
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`w-full h-[52px] rounded-xl font-semibold text-base flex items-center justify-center transition-all duration-200 select-none ${
        disabled
          ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed shadow-none'
          : 'bg-primary hover:bg-primary-dark text-white active:scale-[0.99] shadow-md shadow-primary/25 cursor-pointer'
      } ${className}`}
    >
      {children}
    </button>
  );
}
