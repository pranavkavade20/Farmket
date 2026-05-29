import React from 'react';
import { motion } from 'framer-motion';
import type { CropTracking } from '../services/cropService';

interface Props {
  tracking: CropTracking;
}

const STAGES = ['sown', 'growing', 'ready_for_harvest', 'harvested'];
const STAGE_LABELS: Record<string, string> = {
  sown: 'Sown',
  growing: 'Growing',
  ready_for_harvest: 'Ready for Harvest',
  harvested: 'Harvested'
};

export default function CropTimeline({ tracking }: Props) {
  const currentIndex = STAGES.indexOf(tracking.current_stage);

  return (
    <div className="py-4">
      <h3 className="text-lg font-semibold mb-6">Crop Lifecycle</h3>
      <div className="relative flex justify-between items-center">
        {/* Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-gray-200 rounded">
          <motion.div
            className="h-full bg-green-600 rounded"
            initial={{ width: 0 }}
            animate={{ width: `${(currentIndex / (STAGES.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        {/* Nodes */}
        {STAGES.map((stage, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={stage} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.2 : 1 }}
                className={`w-6 h-6 rounded-full border-4 flex items-center justify-center ${
                  isCompleted ? 'border-green-600 bg-white' : 'border-gray-300 bg-gray-100'
                }`}
              >
                {isCompleted && <div className="w-2 h-2 rounded-full bg-green-600" />}
              </motion.div>
              <span className={`text-xs font-medium ${isCurrent ? 'text-green-700' : 'text-gray-500'}`}>
                {STAGE_LABELS[stage]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
