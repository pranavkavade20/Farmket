import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image, ImageStyle } from 'expo-image';
import { AppText } from '../ui/AppText';
import { colors } from '../../theme';

interface FarmketLogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkSize?: 'sm' | 'md' | 'lg' | 'xl';
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}

export const FarmketLogoIcon: React.FC<{ size?: number; style?: StyleProp<ImageStyle> }> = ({
  size = 32,
  style,
}) => {
  return (
    <Image
      source={require('../../../assets/images/logo.png')}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
      accessibilityLabel="Farmket Logo"
    />
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
