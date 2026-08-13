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
        d="M9 8h10.5a4.5 4.5 0 0 1 0 9H13v7H9V8zm4 6h6.2a1.5 1.5 0 0 0 0-3H13v3z"
        fill="#fffcf6"
      />
    </svg>
  );
}
