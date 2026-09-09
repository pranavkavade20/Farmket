import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { AppText } from '../ui/AppText';
import { colors } from '../../theme';

interface FarmketLogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkSize?: 'sm' | 'md' | 'lg' | 'xl';
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}

export const FarmketLogoIcon: React.FC<{ size?: number }> = ({ size = 32 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <G>
        {/* Left / Upper leaf - Harvest Golden Yellow */}
        <Path
          d="M20 7C20 7 13 13 13 22C13 25 15 28 17 30C18 24 22 17 29 13C27 9 24 7 20 7Z"
          fill="#EAB308"
        />
        {/* Top Right leaf - Fresh Vibrant Green */}
        <Path
          d="M27 8C27 8 28 16 23 23C27 23 35 22 37 15C37 11 33 8 27 8Z"
          fill="#22C55E"
        />
        {/* Lower Right leaf - Deep Agricultural Green */}
        <Path
          d="M23 23C21 27 22 33 26 36C30 38 36 36 38 31C39 25 34 23 27 23C25.5 23 24.2 23 23 23Z"
          fill="#15803D"
        />
        {/* Central Stem connecting the leaves */}
        <Path
          d="M17 38C19 32 22 25 24 21"
          stroke="#165534"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
};

export const FarmketLogo: React.FC<FarmketLogoProps> = ({
  size = 32,
  showWordmark = true,
  wordmarkSize = 'md',
  style,
  textColor,
}) => {
  const getFontSize = () => {
    switch (wordmarkSize) {
      case 'sm':
        return 18;
      case 'lg':
        return 26;
      case 'xl':
        return 32;
      case 'md':
      default:
        return 22;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <FarmketLogoIcon size={size} />
      {showWordmark && (
        <AppText
          weight="bold"
          style={[
            styles.wordmark,
            {
              fontSize: getFontSize(),
              color: textColor || colors.text.primary,
              marginLeft: size * 0.25,
            },
          ]}
        >
          Farmket
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmark: {
    letterSpacing: -0.5,
  },
});
