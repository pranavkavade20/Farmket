import type { CropGrowth, CropStage } from '@/types/crops';

export interface HarvestTiming {
  label: string;
  badgeClass: string;
  daysRemaining: number;
  isOverdue: boolean;
  isToday: boolean;
  isHarvested: boolean;
  formattedDate: string;
}

/**
 * Calculates human-friendly contextual harvest timing
 */
export function getHarvestTiming(
  expectedDateStr?: string | null,
  stage?: CropStage | string,
  actualDateStr?: string | null
): HarvestTiming {
  if (stage === 'HARVESTED') {
    const dateFormatted = actualDateStr
      ? new Date(actualDateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : expectedDateStr
      ? new Date(expectedDateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Harvested';
    return {
      label: `Harvested on ${dateFormatted}`,
      badgeClass: 'text-success bg-success-muted border-success/20',
      daysRemaining: 0,
      isOverdue: false,
      isToday: false,
      isHarvested: true,
      formattedDate: dateFormatted,
    };
  }

  if (!expectedDateStr) {
    return {
      label: 'Date not set',
      badgeClass: 'text-muted bg-surface-elevated border-border-subtle',
      daysRemaining: 999,
      isOverdue: false,
      isToday: false,
      isHarvested: false,
      formattedDate: 'TBD',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const harvestDate = new Date(expectedDateStr);
  harvestDate.setHours(0, 0, 0, 0);

  const diffMs = harvestDate.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const formattedDate = harvestDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: harvestDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });

  if (diffDays === 0) {
    return {
      label: 'Harvest today',
      badgeClass: 'text-warning bg-warning-muted border-warning/30 font-semibold animate-pulse',
      daysRemaining: 0,
      isOverdue: false,
      isToday: true,
      isHarvested: false,
      formattedDate,
    };
  }

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      label: `Harvest overdue by ${overdueDays} ${overdueDays === 1 ? 'day' : 'days'}`,
      badgeClass: 'text-danger bg-danger-muted border-danger/30 font-semibold',
      daysRemaining: diffDays,
      isOverdue: true,
      isToday: false,
      isHarvested: false,
      formattedDate,
    };
  }

  if (diffDays <= 7) {
    return {
      label: `${diffDays} ${diffDays === 1 ? 'day' : 'days'} remaining`,
      badgeClass: 'text-warning bg-warning-muted border-warning/30 font-semibold',
      daysRemaining: diffDays,
      isOverdue: false,
      isToday: false,
      isHarvested: false,
      formattedDate,
    };
  }

  return {
    label: `${diffDays} days remaining`,
    badgeClass: 'text-foreground-secondary bg-surface-elevated border-border-subtle',
    daysRemaining: diffDays,
    isOverdue: false,
    isToday: false,
    isHarvested: false,
    formattedDate,
  };
}

/**
 * Cleanly formats quantities with comma separators and fallback unit
 */
export function formatCropQuantity(quantity?: string | number | null, unit?: string | null): string {
  if (quantity === undefined || quantity === null || quantity === '') {
    return 'Quantity not added';
  }

  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (isNaN(num)) {
    return `${quantity} ${unit || 'units'}`.trim();
  }

  const formattedNum = num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return `${formattedNum} ${unit || 'units'}`.trim();
}

export interface AttentionItem {
  id: number;
  crop: CropGrowth;
  type: 'OVERDUE' | 'NEAR_HARVEST' | 'PENDING_RESERVATIONS' | 'LOW_STOCK';
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeClass: string;
  actionType: 'UPDATE_STAGE' | 'VIEW_RESERVATIONS' | 'VIEW_DETAILS';
}

/**
 * Surfaces actionable crops requiring immediate farmer attention
 */
export function getCropAttentionItems(crops: CropGrowth[] = []): AttentionItem[] {
  const items: AttentionItem[] = [];

  crops.forEach((crop) => {
    if (crop.stage === 'HARVESTED') return;

    const timing = getHarvestTiming(crop.expected_harvest_date, crop.stage);
    const pendingReservations = crop.reservations?.filter((r) => r.reservation_status === 'PENDING') || [];
    const cropName = crop.product_details?.name || crop.crop_name || 'Crop';

    // 1. Pending buyer reservations waiting for farmer confirmation
    if (pendingReservations.length > 0) {
      items.push({
        id: crop.id,
        crop,
        type: 'PENDING_RESERVATIONS',
        title: cropName,
        subtitle: `${pendingReservations.length} buyer ${pendingReservations.length === 1 ? 'reservation' : 'reservations'} waiting for your approval`,
        badgeLabel: `${pendingReservations.length} Pending`,
        badgeClass: 'text-warning bg-warning-muted border-warning/30',
        actionType: 'VIEW_RESERVATIONS',
      });
      return;
    }

    // 2. Harvest Overdue
    if (timing.isOverdue) {
      items.push({
        id: crop.id,
        crop,
        type: 'OVERDUE',
        title: cropName,
        subtitle: `Expected harvest date passed (${timing.formattedDate}). Advance stage or update harvest date.`,
        badgeLabel: timing.label,
        badgeClass: 'text-danger bg-danger-muted border-danger/30',
        actionType: 'UPDATE_STAGE',
      });
      return;
    }

    // 3. Harvest today or within 7 days
    if (timing.isToday || (timing.daysRemaining <= 7 && timing.daysRemaining >= 0)) {
      items.push({
        id: crop.id,
        crop,
        type: 'NEAR_HARVEST',
        title: cropName,
        subtitle: timing.isToday
          ? 'Harvest expected today! Update stage when harvest begins.'
          : `Harvest expected in ${timing.daysRemaining} days (${timing.formattedDate}).`,
        badgeLabel: timing.label,
        badgeClass: 'text-warning bg-warning-muted border-warning/30',
        actionType: 'UPDATE_STAGE',
      });
      return;
    }

    // 4. Crop in NEAR_HARVEST stage
    if (crop.stage === 'NEAR_HARVEST') {
      items.push({
        id: crop.id,
        crop,
        type: 'NEAR_HARVEST',
        title: cropName,
        subtitle: 'Crop is near harvest. Prepare packing and update stage once harvested.',
        badgeLabel: 'Harvest Ready',
        badgeClass: 'text-warning bg-warning-muted border-warning/30',
        actionType: 'UPDATE_STAGE',
      });
    }
  });

  return items;
}
