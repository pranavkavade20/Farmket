import React from 'react';
import { CropProgressBar as BaseCropProgressBar, type CropProgressBarProps } from '@/features/crops/components/CropProgressBar';

export const CropProgressBar: React.FC<CropProgressBarProps> = (props) => {
  return <BaseCropProgressBar {...props} />;
};

export default CropProgressBar;
