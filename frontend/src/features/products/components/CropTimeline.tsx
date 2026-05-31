import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { CropStageHistory } from '@/types/crops';

const STAGES = [
  'PLANNED',
  'SOWN',
  'GERMINATION',
  'VEGETATIVE',
  'FLOWERING',
  'FRUITING',
  'READY_FOR_HARVEST',
  'HARVESTED',
];

interface Props {
  currentStage: string | null;
  history?: CropStageHistory[];
  className?: string;
}

export default function CropTimeline({ currentStage, history = [], className = '' }: Props) {
  if (!currentStage) return null;

  const currentIndex = STAGES.indexOf(currentStage);

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Crop Journey</h3>
      <div className="relative border-l border-gray-200 ml-3 space-y-6">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;
          
          const historyEntry = history.find(h => h.current_stage === stage);

          return (
            <div key={stage} className="relative pl-6">
              <div className="absolute -left-2.5 top-0.5 bg-white">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : isCurrent ? (
                  <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                  {stage.replace(/_/g, ' ')}
                </span>
                {historyEntry && (
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(historyEntry.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
