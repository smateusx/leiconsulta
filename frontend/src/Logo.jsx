export default function Logo({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="6" fill="#1d4a3a" />
      <path
        fill="#fffcf6"
        d="M6.5 8.5h3.1v11.2h5.2V23H6.5V8.5zM24.6 16c0 4.15-2.7 7.15-6.7 7.15-4.05 0-6.65-3.05-6.65-7.15S13.85 8.85 17.9 8.85c4 0 6.7 3 6.7 7.15zm-3.25 0c0-2.45-1.2-4.35-3.45-4.35s-3.4 1.9-3.4 4.35 1.15 4.35 3.4 4.35 3.45-1.9 3.45-4.35z"
      />
    </svg>
  );
}
