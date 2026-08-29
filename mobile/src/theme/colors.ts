export const colors = {
  // Brand (Refined Farmket Green)
  brand: {
    primary: '#10B981',
    hover: '#059669',
    active: '#047857',
    muted: '#D1FAE5',
    foreground: '#FFFFFF',
  },
  
  // Backgrounds (Premium Light)
  background: {
    main: '#F9FAFB',
    surface: '#FFFFFF',
    elevated: '#F4F4F5',
  },
  
  // Text (Slate/Zinc Scale)
  text: {
    primary: '#09090B',
    secondary: '#52525B',
    muted: '#71717A',
    inverse: '#FFFFFF',
  },
  
  // Borders
  border: {
    subtle: '#E4E4E7',
    strong: '#D4D4D8',
  },
  
  // Statuses
  status: {
    success: '#10B981',
    successMuted: '#D1FAE5',
    warning: '#F59E0B',
    warningMuted: '#FEF3C7',
    danger: '#EF4444',
    dangerMuted: '#FEE2E2',
    info: '#3B82F6',
    infoMuted: '#DBEAFE',
  },
  
  // Accents
  accent: {
    yellow: '#F59E0B',
    orange: '#F97316',
    purple: '#8B5CF6',
  },

  // Crop Lifecycle Stages
  cropStage: {
    planted: { color: '#3B82F6', bg: '#DBEAFE', label: 'Planted' },
    growing: { color: '#10B981', bg: '#D1FAE5', label: 'Growing' },
    nearHarvest: { color: '#F59E0B', bg: '#FEF3C7', label: 'Near Harvest' },
    harvested: { color: '#8B5CF6', bg: '#EDE9FE', label: 'Harvested' },
  },

  // Order Statuses
  orderStatus: {
    pending: { color: '#F59E0B', bg: '#FEF3C7', label: 'Pending' },
    processing: { color: '#F97316', bg: '#FFEDD5', label: 'Processing' },
    shipped: { color: '#3B82F6', bg: '#DBEAFE', label: 'Shipped' },
    delivered: { color: '#10B981', bg: '#D1FAE5', label: 'Delivered' },
    cancelled: { color: '#EF4444', bg: '#FEE2E2', label: 'Cancelled' },
  },

  // Market States
  marketState: {
    availableNow: { color: '#10B981', bg: '#D1FAE5', label: 'In Stock' },
    readyForPrebooking: { color: '#3B82F6', bg: '#DBEAFE', label: 'Pre-book' },
    readyToHarvest: { color: '#8B5CF6', bg: '#EDE9FE', label: 'Harvest Ready' },
    lowStock: { color: '#F97316', bg: '#FFEDD5', label: 'Low Stock' },
    soldOut: { color: '#71717A', bg: '#F4F4F5', label: 'Sold Out' },
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
    primary: '#10B981',
    hover: '#34D399',
    active: '#6EE7B7',
    muted: '#064E3B',
    foreground: '#09090B',
  },
  background: {
    main: '#09090B',
    surface: '#121214',
    elevated: '#18181B',
  },
  text: {
    primary: '#FAFAFA',
    secondary: '#A1A1AA',
    muted: '#71717A',
    inverse: '#09090B',
  },
  border: {
    subtle: '#27272A',
    strong: '#3F3F46',
  },
  status: {
    success: '#10B981',
    successMuted: '#064E3B',
    warning: '#F59E0B',
    warningMuted: '#78350F',
    danger: '#EF4444',
    dangerMuted: '#7F1D1D',
    info: '#3B82F6',
    infoMuted: '#1E3A8A',
  },
  accent: {
    yellow: '#FBBF24',
    orange: '#FB923C',
    purple: '#A78BFA',
  },
  cropStage: {
    planted: { color: '#60A5FA', bg: '#1E3A8A', label: 'Planted' },
    growing: { color: '#34D399', bg: '#064E3B', label: 'Growing' },
    nearHarvest: { color: '#FBBF24', bg: '#78350F', label: 'Near Harvest' },
    harvested: { color: '#C084FC', bg: '#581C87', label: 'Harvested' },
  },
  orderStatus: {
    pending: { color: '#FBBF24', bg: '#78350F', label: 'Pending' },
    processing: { color: '#FB923C', bg: '#7C2D12', label: 'Processing' },
    shipped: { color: '#60A5FA', bg: '#1E3A8A', label: 'Shipped' },
    delivered: { color: '#34D399', bg: '#064E3B', label: 'Delivered' },
    cancelled: { color: '#F87171', bg: '#7F1D1D', label: 'Cancelled' },
  },
  marketState: {
    availableNow: { color: '#34D399', bg: '#064E3B', label: 'In Stock' },
    readyForPrebooking: { color: '#60A5FA', bg: '#1E3A8A', label: 'Pre-book' },
    readyToHarvest: { color: '#C084FC', bg: '#581C87', label: 'Harvest Ready' },
    lowStock: { color: '#FB923C', bg: '#7C2D12', label: 'Low Stock' },
    soldOut: { color: '#A1A1AA', bg: '#27272A', label: 'Sold Out' },
  },
  state: {
    hover: 'rgba(250, 250, 250, 0.06)',
    active: 'rgba(250, 250, 250, 0.10)',
    disabled: 'rgba(250, 250, 250, 0.38)',
  }
};

