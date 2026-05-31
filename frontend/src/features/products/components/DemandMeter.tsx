import { Flame, TrendingUp } from 'lucide-react';

interface Props {
  reservationCount: number;
  className?: string;
}

export const DemandMeter = ({ reservationCount, className = '' }: Props) => {
  let demandLevel = 'Low';
  let colorClass = 'text-green-600 bg-green-50';
  let Icon = TrendingUp;

  if (reservationCount > 50) {
    demandLevel = 'High';
    colorClass = 'text-red-600 bg-red-50';
    Icon = Flame;
  } else if (reservationCount > 10) {
    demandLevel = 'Medium';
    colorClass = 'text-orange-600 bg-orange-50';
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${colorClass} ${className}`}>
      <Icon className="w-4 h-4" />
      <span>{demandLevel} Demand</span>
      <span className="text-xs opacity-75 ml-1">({reservationCount} reserved)</span>
    </div>
  );
};
