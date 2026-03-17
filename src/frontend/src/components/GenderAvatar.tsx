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
        <circle cx="50" cy="50" r="50" fill="oklch(0.15 0.05 220)" />
        {/* Head */}
        <circle cx="50" cy="34" r="16" fill="#7dd3fc" />
        {/* Shoulders / Body */}
        <path d="M18 88 C18 68 82 68 82 88" fill="#7dd3fc" />
        {/* Neck */}
        <rect x="44" y="49" width="12" height="10" rx="4" fill="#7dd3fc" />
        {/* Jaw highlight */}
        <ellipse cx="50" cy="44" rx="10" ry="5" fill="#93c5fd" opacity="0.4" />
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
        {/* Head */}
        <circle cx="50" cy="33" r="15" fill="#67e8f9" />
        {/* Hair */}
        <path
          d="M35 33 Q35 14 50 14 Q65 14 65 33 Q65 26 58 24 Q50 22 42 24 Q35 26 35 33Z"
          fill="#22d3ee"
        />
        {/* Neck */}
        <rect x="45" y="47" width="10" height="9" rx="4" fill="#67e8f9" />
        {/* Dress / Body */}
        <path d="M26 90 Q30 68 50 64 Q70 68 74 90Z" fill="#67e8f9" />
        {/* Shoulders */}
        <path
          d="M30 58 Q38 54 50 56 Q62 54 70 58 Q74 68 74 90 L26 90 Q26 68 30 58Z"
          fill="#22d3ee"
          opacity="0.5"
        />
      </svg>
    );
  }

  // Other / blank
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
      <circle cx="50" cy="50" r="50" fill="oklch(0.2 0 0)" />
      {/* Head */}
      <circle cx="50" cy="35" r="15" fill="#6b7280" />
      {/* Body */}
      <path d="M20 90 C20 68 80 68 80 90" fill="#6b7280" />
      {/* Neck */}
      <rect x="44" y="49" width="12" height="9" rx="4" fill="#6b7280" />
    </svg>
  );
}
