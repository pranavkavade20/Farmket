interface Props {
  progress: number;
  stage: string | null;
  className?: string;
}

export const CropProgressBar = ({ progress, stage, className = '' }: Props) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-gray-700 capitalize">
          {stage ? stage.replace(/_/g, ' ').toLowerCase() : 'Planned'}
        </span>
        <span className="text-gray-500">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-500 ease-out" 
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};
