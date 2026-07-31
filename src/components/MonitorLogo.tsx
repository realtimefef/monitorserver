/**
 * MonitorLogo - inline SVG brand mark for NodeVigil.
 * A pulse line with an active dot - matches the favicon/logo identity.
 */
export function MonitorLogo({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Monitor frame */}
      <rect x="2" y="4" width="28" height="19" rx="4" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      {/* Pulse line */}
      <polyline
        points="5,16 9,16 12,10 16.5,22 21,8 25,18 29,14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Active dot */}
      <circle cx="29" cy="14" r="2" fill="currentColor" />
      {/* Stand */}
      <rect x="12" y="24" width="8" height="2" rx="1" fill="currentColor" opacity="0.3" />
      <rect x="9" y="27" width="14" height="2" rx="1" fill="currentColor" opacity="0.25" />
    </svg>
  );
}
