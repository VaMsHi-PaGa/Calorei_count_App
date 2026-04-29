import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base: IconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const DashboardIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const FoodIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 11h18" />
    <path d="M5 11a7 7 0 0 1 14 0" />
    <path d="M4 15h16" />
    <path d="M6 19h12" />
  </svg>
);

export const WaterIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 2.5C8 7 5.5 10.5 5.5 14a6.5 6.5 0 0 0 13 0c0-3.5-2.5-7-6.5-11.5z" />
  </svg>
);

export const WeightIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 8h14l-1.5 12h-11z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
    <path d="M10 13h4" />
  </svg>
);

export const AnalyticsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 14l3-3 3 3 5-6" />
  </svg>
);

export const InsightIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2v.3h6v-.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z" />
  </svg>
);

export const GoalIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);

export const ReportIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h5" />
  </svg>
);

export const SettingsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const FlameIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 2c1 4-3 6-3 10a3 3 0 0 0 6 0c0-1.5-.5-2.5-1-3 .5 1 1 4-1 5 .5-2 0-4-2-5 1 3-1 4-1 6a4 4 0 0 0 8 0c0-5-3-7-6-13z" />
  </svg>
);

export const ProteinIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 12L12 4l6 8-6 8z" />
    <path d="M12 4v16" />
  </svg>
);

export const StepsIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <ellipse cx="8" cy="6" rx="3" ry="4" />
    <ellipse cx="16" cy="11" rx="3" ry="4" />
    <ellipse cx="9" cy="17" rx="3" ry="4" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const LogoutIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const SparkleIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4z" />
    <path d="M19 14l.7 1.8L21 16.5l-1.3.7L19 19l-.7-1.8L17 16.5l1.3-.7z" />
  </svg>
);

export const TrendingUpIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
);

export const TrendingDownIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 7l6 6 4-4 8 8" />
    <path d="M14 17h7v-7" />
  </svg>
);

export const LightBulbIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 18a3 3 0 0 1 6 0" />
    <path d="M12 2c-3.314 0-6 2.686-6 6v2a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2c0-3.314-2.686-6-6-6z" />
    <path d="M10 21h4" />
  </svg>
);

export const AlertIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3.05h16.94a2 2 0 0 0 1.71-3.05l-8.47-14.14a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v6" />
    <path d="M12 18h.01" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const DownloadIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="M7 10l5 5 5-5" />
    <path d="M12 15V3" />
  </svg>
);

export const SendIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.40564168,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.9702544,11.6889879 22.9702544,11.6889879 22.9702544,11.6889879 L4.13399899,2.89337606 C3.34915502,2.5389544 2.40564168,2.65 1.77946707,3.17788662 C0.994623095,3.81103738 0.837654326,4.89968836 1.15159189,5.68518034 L3.03521743,12.1261733 C3.03521743,12.2832707 3.19218622,12.4403681 3.50612381,12.4403681 L16.6915026,13.2258551 C16.6915026,13.2258551 17.1624089,13.2258551 17.1624089,12.8714334 L17.1624089,12.0859465 C17.1624089,11.7315248 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 9h18V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4z" />
    <path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
    <path d="M16 5v-2" />
    <path d="M8 5v-2" />
    <path d="M3 13h18" />
  </svg>
);

export const AppleIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3c-1.2 0-2.4.6-3 1.5C8.4 3.6 7.2 3 6 3a4 4 0 0 0-4 4c0 3 2 5.5 4 7.5S9 18 12 21c3-3 5-4.5 6-6.5s2-4.5 2-7.5a4 4 0 0 0-4-4c-1.2 0-2.4.6-3 1.5z" />
    <path d="M12 3V1" />
    <path d="M12 1c1 0 2 .5 2 1.5" />
  </svg>
);

export const DumbbellIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 5v14" />
    <path d="M18 5v14" />
    <path d="M4 7h4" />
    <path d="M16 7h4" />
    <path d="M4 17h4" />
    <path d="M16 17h4" />
    <path d="M8 12h8" />
  </svg>
);

export const HeartIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const LeafIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

export const RunningIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="13" cy="4" r="1.5" />
    <path d="M7 21l3-6 2 2 3-3" />
    <path d="M16 17l-3-6-2 3H7" />
    <path d="M15 8l-2 4" />
    <path d="M10 9l5-3" />
  </svg>
);

export const SaladIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 21h10" />
    <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z" />
    <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-3.19 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.5H11.38z" />
    <path d="M13 12a4 4 0 0 0-4-4" />
    <path d="M8.5 9.5 5 14" />
  </svg>
);

export const ScaleIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3a1 1 0 0 1 1 1v1h5a1 1 0 0 1 1 1v2a6 6 0 0 1-6 6H11a6 6 0 0 1-6-6V6a1 1 0 0 1 1-1h5V4a1 1 0 0 1 1-1z" />
    <path d="M12 16v5" />
    <path d="M8 21h8" />
  </svg>
);
