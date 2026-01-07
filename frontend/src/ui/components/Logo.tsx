interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  textColor?: string;
}

export function Logo({ className = '', showText = true, size = 'md', textColor }: LogoProps) {
  const appName = 'EvalPro';
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const textColorClass = textColor || 'text-white';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon - Food/Quality Checkmark with Shield */}
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield Background */}
        <path
          d="M32 4L12 12V28C12 40 20 50 32 56C44 50 52 40 52 28V12L32 4Z"
          fill="currentColor"
          className="text-blue-600"
        />
        {/* Checkmark */}
        <path
          d="M26 32L30 36L38 28"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Food/Leaf accent */}
        <path
          d="M32 20C32 20 28 16 24 18C20 20 22 24 24 26C26 28 28 26 30 24"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} ${textColorClass}`}>
          {appName}
        </span>
      )}
    </div>
  );
}
