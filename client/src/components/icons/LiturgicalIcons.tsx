import React from 'react'

type IconProps = { className?: string }

/** Simple line chalice — Eucharistic cup */
export const ChaliceIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M8 4h8v2.5c0 2.5-1.5 4.5-4 5.5v3M12 15.5V20M9 21h6"
      stroke="currentColor"
      strokeWidth={1.35}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 4c0 1.5 1 2.5 2.5 2.5h5C16 6.5 17 5.5 17 4"
      stroke="currentColor"
      strokeWidth={1.35}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M6 8h12" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
  </svg>
)

/** Host with cross — Holy Eucharist / sacrament */
export const SacramentHostIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth={1.35} />
    <path
      d="M12 7.5v9M8.25 12h7.5"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
    />
  </svg>
)
