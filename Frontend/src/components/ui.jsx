import { Zap } from "lucide-react";

const TONE = {
  green: "bg-greenSoft text-green dark:bg-green/20 dark:text-emerald-400",
  amber: "bg-amberSoft text-amber dark:bg-amber/20 dark:text-amber-400",
  red: "bg-redSoft text-red dark:bg-red/20 dark:text-rose-400",
  blue: "bg-blueSoft text-blue dark:bg-blue/20 dark:text-blue-400",
};

export const Pill = ({ tone = "blue", children, icon: Icon }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium font-body transition-colors ${TONE[tone]}`}
  >
    {Icon && <Icon size={12} strokeWidth={2.5} />}
    {children}
  </span>
);

export const Avatar = ({ initials, src, tone = "bg-blue", size = 34, className = "" }) => {
  if (src) {
    return (
      <img
        src={src}
        alt="Avatar"
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white text-xs font-semibold font-display shrink-0 ${tone} ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
};

export const Logo = ({ light }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center justify-center rounded-lg bg-blue" style={{ width: 30, height: 30 }}>
      <Zap size={16} color="#fff" strokeWidth={2.5} />
    </div>
    <span className={`text-[15px] font-semibold tracking-tight font-display ${light ? "text-white" : "text-ink dark:text-white"}`}>
      SmartFlow <span className="text-blue">AI</span>
    </span>
  </div>
);

export const Card = ({ className = "", children }) => (
  <div className={`rounded-xl border border-border dark:border-navyCard bg-white dark:bg-navy shadow-soft transition-colors ${className}`}>
    {children}
  </div>
);