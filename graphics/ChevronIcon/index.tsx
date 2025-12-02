import React from 'react'

interface ChevronIconProps {
  className?: string
  size?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export const ChevronIcon: React.FC<ChevronIconProps> = ({
  className,
  size = 16,
  direction = 'down',
}) => {
  const getRotation = () => {
    switch (direction) {
      case 'up':
        return 'rotate-180'
      case 'left':
        return 'rotate-90'
      case 'right':
        return '-rotate-90'
      case 'down':
      default:
        return ''
    }
  }

  return (
    <svg
      className={`${className} ${getRotation()}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
