import React from "react";

interface EyeIconProps {
  className?: string;
  size?: number | "large" | "small";
  closed?: boolean;
}

export const EyeIcon: React.FC<EyeIconProps> = ({
  className,
  size = 16,
  closed = false,
}) => {
  const getSize = () => {
    if (typeof size === "number") return size;
    if (size === "large") return 24;
    if (size === "small") return 12;
    return 16;
  };

  const actualSize = getSize();
  return (
    <svg
      className={className}
      width={actualSize}
      height={actualSize}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {closed ? (
        <>
          <path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A10.07 10.07 0 0 1 6.06 6.06L17.94 17.94Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1 1L23 23"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
};
