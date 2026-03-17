interface GenderAvatarProps {
  gender: string;
  size?: number;
  className?: string;
}

export default function GenderAvatar({
  gender,
  size = 96,
  className,
}: GenderAvatarProps) {
  if (gender === "male") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="Male avatar"
      >
        {/* Background */}
        <circle cx="50" cy="50" r="50" fill="oklch(0.15 0.06 220)" />
        {/* Short cropped hair */}
        <ellipse cx="50" cy="26" rx="15" ry="7" fill="#38bdf8" />
        {/* Head - slightly angular/square for masculinity */}
        <rect x="35" y="24" width="30" height="28" rx="10" fill="#7dd3fc" />
        {/* Jaw line - more square */}
        <rect x="36" y="42" width="28" height="10" rx="5" fill="#7dd3fc" />
        {/* Neck */}
        <rect x="43" y="51" width="14" height="10" rx="3" fill="#7dd3fc" />
        {/* Broad shoulders / body */}
        <path
          d="M10 92 C10 68 38 62 50 62 C62 62 90 68 90 92Z"
          fill="#38bdf8"
        />
        {/* Chest muscle hint */}
        <ellipse cx="40" cy="73" rx="8" ry="5" fill="#7dd3fc" opacity="0.4" />
        <ellipse cx="60" cy="73" rx="8" ry="5" fill="#7dd3fc" opacity="0.4" />
      </svg>
    );
  }

  if (gender === "female") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="Female avatar"
      >
        {/* Background */}
        <circle cx="50" cy="50" r="50" fill="oklch(0.15 0.05 200)" />
        {/* Long hair back layer */}
        <path
          d="M30 30 Q28 58 32 70 Q50 78 68 70 Q72 58 70 30 Q60 18 50 18 Q40 18 30 30Z"
          fill="#06b6d4"
        />
        {/* Head - softer/rounder */}
        <ellipse cx="50" cy="36" rx="15" ry="17" fill="#a5f3fc" />
        {/* Hair top/fringe */}
        <path
          d="M35 28 Q38 18 50 17 Q62 18 65 28 Q58 22 50 22 Q42 22 35 28Z"
          fill="#0891b2"
        />
        {/* Neck - slender */}
        <rect x="45" y="52" width="10" height="10" rx="5" fill="#a5f3fc" />
        {/* Feminine body / dress */}
        <path d="M33 92 Q34 68 50 63 Q66 68 67 92Z" fill="#67e8f9" />
        {/* Shoulder curves */}
        <ellipse cx="36" cy="65" rx="8" ry="5" fill="#22d3ee" opacity="0.5" />
        <ellipse cx="64" cy="65" rx="8" ry="5" fill="#22d3ee" opacity="0.5" />
        {/* Hair side strands */}
        <path
          d="M32 30 Q26 50 30 68"
          stroke="#0891b2"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M68 30 Q74 50 70 68"
          stroke="#0891b2"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    );
  }

  // Other — full black silhouette
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Profile avatar"
    >
      {/* Background */}
      <circle cx="50" cy="50" r="50" fill="#000000" />
      {/* Head */}
      <circle cx="50" cy="35" r="16" fill="#111111" />
      {/* Neck */}
      <rect x="43" y="50" width="14" height="10" rx="4" fill="#111111" />
      {/* Body */}
      <path d="M18 92 C18 68 82 68 82 92Z" fill="#111111" />
    </svg>
  );
}
