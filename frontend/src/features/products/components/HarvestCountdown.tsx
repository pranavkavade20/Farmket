import { Clock } from 'lucide-react';

interface Props {
  days: number;
  className?: string;
}

export const HarvestCountdown = ({ days, className = '' }: Props) => {
  if (days <= 0) return null;

  return (
    <div className={`flex items-center text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full ${className}`}>
      <Clock className="w-4 h-4 mr-2" />
      <span>Harvest in {days} Days</span>
    </div>
  );
};
