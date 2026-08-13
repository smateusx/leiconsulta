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
      <path d="M11 8h10v3.2H15.2V24H11V8z" fill="#fffcf6" />
    </svg>
  );
}
