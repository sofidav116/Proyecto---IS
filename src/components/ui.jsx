import { Zap } from "lucide-react";

const TONE = {
  green: "bg-greenSoft text-green",
  amber: "bg-amberSoft text-amber",
  red: "bg-redSoft text-red",
  blue: "bg-blueSoft text-blue",
};

export const Pill = ({ tone = "blue", children, icon: Icon }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium font-body ${TONE[tone]}`}
  >
    {Icon && <Icon size={12} strokeWidth={2.5} />}
    {children}
  </span>
);

export const Avatar = ({ initials, tone = "bg-blue" }) => (
  <div
    className={`flex items-center justify-center rounded-full text-white text-xs font-semibold font-display shrink-0 ${tone}`}
    style={{ width: 34, height: 34 }}
  >
    {initials}
  </div>
);

export const Logo = ({ light }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center justify-center rounded-lg bg-blue" style={{ width: 30, height: 30 }}>
      <Zap size={16} color="#fff" strokeWidth={2.5} />
    </div>
    <span className={`text-[15px] font-semibold tracking-tight font-display ${light ? "text-white" : "text-ink"}`}>
      SmartFlow <span className="text-blue">AI</span>
    </span>
  </div>
);

export const Card = ({ className = "", children }) => (
  <div className={`rounded-xl border border-border bg-white shadow-soft ${className}`}>{children}</div>
);
