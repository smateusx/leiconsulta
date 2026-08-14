export default function Logo({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" fill="#1f4338" />
      <path fill="#f7f6f1" d="M5.2 8h3.15v12.15H13.8V23.2H5.2z" />
      <path
        d="M26.4 10.55c-1.45-1.55-3.55-2.5-5.9-2.5-4.45 0-7.55 3.15-7.55 7.95s3.1 7.95 7.55 7.95c2.35 0 4.45-.95 5.9-2.5"
        fill="none"
        stroke="#f7f6f1"
        strokeWidth="2.85"
        strokeLinecap="round"
      />
    </svg>
  );
}
