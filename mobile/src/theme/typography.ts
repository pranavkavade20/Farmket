export const typography = {
  // Font Families (Inter for body/UI, Manrope for display/headings)
  family: {
    sans: 'Inter_400Regular',
    sansMedium: 'Inter_500Medium',
    sansSemiBold: 'Inter_600SemiBold',
    sansBold: 'Inter_700Bold',
    displayMedium: 'Manrope_500Medium',
    displaySemiBold: 'Manrope_600SemiBold',
    displayBold: 'Manrope_700Bold',
  },

  // Font Sizes
  size: {
    xs: 11,       // badges / micro labels
    sm: 13,       // captions / secondary
    md: 15,       // standard body
    lg: 18,       // card title / subheading
    xl: 24,       // section heading
    xxl: 32,      // screen hero display
    display: 36,  // large marketing hero
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.6,
  },

  // Presets
  presets: {
    display: {
      fontSize: 32,
      lineHeight: 38,
      fontFamily: 'Manrope_700Bold',
    },
    h1: {
      fontSize: 24,
      lineHeight: 30,
      fontFamily: 'Manrope_700Bold',
    },
    h2: {
      fontSize: 20,
      lineHeight: 26,
      fontFamily: 'Manrope_600SemiBold',
    },
    h3: {
      fontSize: 17,
      lineHeight: 22,
      fontFamily: 'Manrope_600SemiBold',
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontFamily: 'Inter_400Regular',
    },
    bodySmall: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: 'Inter_400Regular',
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'Inter_500Medium',
    },
    label: {
      fontSize: 11,
      lineHeight: 14,
      fontFamily: 'Inter_600SemiBold',
      letterSpacing: 0.5,
    }
  }
};
