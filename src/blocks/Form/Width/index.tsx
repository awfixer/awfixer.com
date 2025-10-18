import * as React from 'react'
import { cn } from '@/utilities/ui'

export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className, width }) => {
  // Map common width percentages to Tailwind classes
  const widthClass = width
    ? {
        '25': 'max-w-[25%]',
        '33': 'max-w-[33.333333%]',
        '50': 'max-w-[50%]',
        '66': 'max-w-[66.666667%]',
        '75': 'max-w-[75%]',
        '100': 'max-w-full',
      }[String(width)] || `max-w-[${width}%]`
    : undefined

  return <div className={cn(widthClass, className)}>{children}</div>
}
