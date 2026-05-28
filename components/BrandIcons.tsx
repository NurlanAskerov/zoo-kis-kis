type IconProps = {
  size?: number;
  className?: string;
};

export function InstagramIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 8.2h2.1V5.1c-.36-.05-1.6-.16-3.04-.16-3 0-5.06 1.83-5.06 5.2v2.93H4.8v3.48H8V24h3.86v-7.45h3.02l.48-3.48h-3.5v-2.59c0-1 .28-1.68 1.74-1.68H14V8.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TikTokIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.4 3c.35 2.25 1.68 3.6 3.9 3.84v3.05a7.3 7.3 0 0 1-3.8-1.18v5.92c0 3.42-2.12 5.37-5.08 5.37C6.75 20 4.8 18.16 4.8 15.63c0-2.64 2.04-4.55 4.82-4.55.39 0 .73.03 1.02.12v3.1a2.94 2.94 0 0 0-1.1-.22c-.94 0-1.68.58-1.68 1.5 0 .9.68 1.48 1.6 1.48 1.02 0 1.72-.6 1.72-1.92V3h3.22Z"
        fill="currentColor"
      />
    </svg>
  );
}
