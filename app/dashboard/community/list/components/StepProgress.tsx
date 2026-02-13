interface StepProgressProps {
  step: number;
  totalSteps?: number;
}

export const StepProgress = ({ step, totalSteps = 3 }: StepProgressProps) => {
  const radius = 24;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  const progress = step / totalSteps;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2}>
        {/* background circle */}
        <circle
          stroke="#E7C8FF"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* progress circle */}
        <circle
          stroke="url(#gradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-300"
          transform={`rotate(-90 ${radius} ${radius})`}
        />

        <defs>
          <linearGradient id="gradient">
            <stop offset="0%" stopColor="#A119F6" />
            
          </linearGradient>
        </defs>
      </svg>

      <span className="absolute text-xs font-semibold text-[#A119F6]">
        {step}/{totalSteps}
      </span>
    </div>
  );
};
