type Props = {
  className?: string;
};

/** Çekiç + anahtar — site marka ikonu */
export default function BrandIcon({ className = "h-5 w-5" }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Anahtar */}
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        {/* Çekiç */}
        <path d="M15 12l-8.5 8.5a2.12 2.12 0 0 1-3-3L12 9" />
        <path d="M17.64 15 22 10.64" />
        <path d="M20.91 11.7l-1.25-1.25" />
        <path d="M14.5 7.5l2 2" />
      </g>
    </svg>
  );
}
