import React from 'react';

interface Props {
  expectedDate: string;
}

export default function HarvestCountdownCard({ expectedDate }: Props) {
  const harvestDate = new Date(expectedDate);
  const today = new Date();
  const diffTime = harvestDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isPast = diffDays < 0;

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-6 text-white shadow-lg overflow-hidden relative group">
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h4 className="text-emerald-50 font-medium mb-1">Expected Harvest</h4>
          <p className="text-3xl font-bold">
            {isPast ? 'Harvest Ready' : `${diffDays} Days`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-emerald-100 text-sm">Target Date</p>
          <p className="font-semibold">{harvestDate.toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
