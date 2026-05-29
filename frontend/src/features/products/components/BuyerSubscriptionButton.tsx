import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { cropService } from '../services/cropService';
import toast from 'react-hot-toast';

interface Props {
  productSlug: string;
}

export default function BuyerSubscriptionButton({ productSlug }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      await cropService.subscribeInterest(productSlug);
      toast.success('You will be notified when this crop is ready!');
    } catch (error: any) {
      if (error.response?.data?.non_field_errors) {
        toast.error(error.response.data.non_field_errors[0] || 'Already subscribed');
      } else {
        toast.error('Failed to subscribe. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg font-medium transition-colors disabled:opacity-70 group"
    >
      <Bell size={18} className="group-hover:animate-bounce" />
      <span>{isLoading ? 'Subscribing...' : 'Notify Me When Ready'}</span>
    </button>
  );
}
