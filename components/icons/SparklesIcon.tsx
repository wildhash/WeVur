
import React from 'react';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    <path d="M12 3v1" />
    <path d="M21 12h-1" />
    <path d="M12 21v-1" />
    <path d="M3 12H2" />
    <path d="m18.36 5.64-.7.7" />
    <path d="m5.64 18.36-.7-.7" />
    <path d="m18.36 18.36-.7-.7" />
    <path d="m5.64 5.64-.7.7" />
  </svg>
);

export default SparklesIcon;
