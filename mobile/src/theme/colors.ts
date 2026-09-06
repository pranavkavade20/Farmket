export const colors = {
  // Brand (Sophisticated Forest Emerald)
  brand: {
    primary: '#0F766E',
    hover: '#0D9488',
    active: '#115E59',
    muted: '#CCFBF1',
    tint: '#F0FDFA',
    forest: '#042F2E',
    foreground: '#FFFFFF',
  },
  
  // Backgrounds (Clean, warm light surfaces)
  background: {
    main: '#F8FAFC',
    surface: '#FFFFFF',
    elevated: '#F1F5F9',
    subtle: '#F8FAFC',
    card: '#FFFFFF',
    dark: '#0F172A',
  },
  
  // Text (Slate / Zinc Scale for high legibility)
  text: {
    primary: '#09090B',
    secondary: '#52525B',
    muted: '#71717A',
    inverse: '#FFFFFF',
    brand: '#0F766E',
  },
  
  // Borders
  border: {
    subtle: '#E4E4E7',
    strong: '#D4D4D8',
    focus: '#0F766E',
  },
  
  // Statuses
  status: {
    success: '#16A34A',
    successMuted: '#DCFCE7',
    warning: '#D97706',
    warningMuted: '#FEF3C7',
    danger: '#DC2626',
    dangerMuted: '#FEE2E2',
    info: '#2563EB',
    infoMuted: '#DBEAFE',
  },
  
  // Accents (Earth & Harvest)
  accent: {
    amber: '#D97706',
    amberLight: '#FEF3C7',
    sage: '#65A30D',
    sageLight: '#ECFCCB',
    terracotta: '#EA580C',
    terracottaLight: '#FFEDD5',
    yellow: '#D97706',
    orange: '#EA580C',
    purple: '#7C3AED',
    purpleLight: '#EDE9FE',
  },

  // Crop Lifecycle Stages
  cropStage: {
    planted: { color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD', label: 'Planted' },
    growing: { color: '#059669', bg: '#D1FAE5', border: '#A7F3D0', label: 'Growing' },
    nearHarvest: { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', label: 'Near Harvest' },
    harvested: { color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE', label: 'Harvested' },
  },

  // Order Statuses
  orderStatus: {
    pending: { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', label: 'Pending' },
    processing: { color: '#EA580C', bg: '#FFEDD5', border: '#FED7AA', label: 'Processing' },
    shipped: { color: '#2563EB', bg: '#DBEAFE', border: '#BFDBFE', label: 'Shipped' },
    delivered: { color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0', label: 'Delivered' },
    cancelled: { color: '#DC2626', bg: '#FEE2E2', border: '#FECACA', label: 'Cancelled' },
  },

  // Market States
  marketState: {
    availableNow: { color: '#059669', bg: '#D1FAE5', border: '#A7F3D0', label: 'In Stock' },
    readyForPrebooking: { color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD', label: 'Pre-book' },
    readyToHarvest: { color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE', label: 'Harvest Ready' },
    lowStock: { color: '#EA580C', bg: '#FFEDD5', border: '#FED7AA', label: 'Low Stock' },
    soldOut: { color: '#71717A', bg: '#F4F4F5', border: '#E4E4E7', label: 'Sold Out' },
  },

  // Interactive States
  state: {
    hover: 'rgba(9, 9, 11, 0.04)',
    active: 'rgba(9, 9, 11, 0.08)',
    disabled: 'rgba(9, 9, 11, 0.38)',
  }
};

export const darkColors: typeof colors = {
  brand: {
    primary: '#14B8A6',
    hover: '#2DD4BF',
    active: '#5EEAD4',
    muted: '#042F2E',
    tint: '#022120',
    forest: '#0F766E',
    foreground: '#09090B',
  },
  background: {
    main: '#09090B',
    surface: '#121214',
    elevated: '#18181B',
    subtle: '#141416',
    card: '#121214',
    dark: '#000000',
  },
  text: {
    primary: '#FAFAFA',
    secondary: '#A1A1AA',
    muted: '#71717A',
    inverse: '#09090B',
    brand: '#2DD4BF',
  },
  border: {
    subtle: '#27272A',
    strong: '#3F3F46',
    focus: '#14B8A6',
  },
  status: {
    success: '#22C55E',
    successMuted: '#052E16',
    warning: '#F59E0B',
    warningMuted: '#451A03',
    danger: '#EF4444',
    dangerMuted: '#450A0A',
    info: '#3B82F6',
    infoMuted: '#172554',
  },
  accent: {
    amber: '#F59E0B',
    amberLight: '#451A03',
    sage: '#84CC16',
    sageLight: '#1A2E05',
    terracotta: '#F97316',
    terracottaLight: '#431407',
    yellow: '#F59E0B',
    orange: '#F97316',
    purple: '#A855F7',
    purpleLight: '#3B0764',
  },
  cropStage: {
    planted: { color: '#38BDF8', bg: '#082F49', border: '#0369A1', label: 'Planted' },
    growing: { color: '#34D399', bg: '#064E3B', border: '#047857', label: 'Growing' },
    nearHarvest: { color: '#FBBF24', bg: '#78350F', border: '#B45309', label: 'Near Harvest' },
    harvested: { color: '#C084FC', bg: '#581C87', border: '#7E22CE', label: 'Harvested' },
  },
  orderStatus: {
    pending: { color: '#FBBF24', bg: '#78350F', border: '#B45309', label: 'Pending' },
    processing: { color: '#FB923C', bg: '#7C2D12', border: '#C2410C', label: 'Processing' },
    shipped: { color: '#60A5FA', bg: '#1E3A8A', border: '#1D4ED8', label: 'Shipped' },
    delivered: { color: '#34D399', bg: '#064E3B', border: '#047857', label: 'Delivered' },
    cancelled: { color: '#F87171', bg: '#7F1D1D', border: '#B91C1C', label: 'Cancelled' },
  },
  marketState: {
    availableNow: { color: '#34D399', bg: '#064E3B', border: '#047857', label: 'In Stock' },
    readyForPrebooking: { color: '#38BDF8', bg: '#082F49', border: '#0369A1', label: 'Pre-book' },
    readyToHarvest: { color: '#C084FC', bg: '#581C87', border: '#7E22CE', label: 'Harvest Ready' },
    lowStock: { color: '#FB923C', bg: '#7C2D12', border: '#C2410C', label: 'Low Stock' },
    soldOut: { color: '#A1A1AA', bg: '#27272A', border: '#3F3F46', label: 'Sold Out' },
  },
  state: {
    hover: 'rgba(250, 250, 250, 0.06)',
    active: 'rgba(250, 250, 250, 0.10)',
    disabled: 'rgba(250, 250, 250, 0.38)',
  }
};
