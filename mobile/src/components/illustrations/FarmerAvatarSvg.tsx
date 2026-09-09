import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  ClipPath,
} from 'react-native-svg';

interface FarmerAvatarSvgProps {
  size?: number;
  showVerified?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const FarmerAvatarSvg: React.FC<FarmerAvatarSvgProps> = ({
  size = 40,
  showVerified = false,
  style,
}) => {
  return (
    <View style={[{ width: size, height: size, position: 'relative' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Defs>
          <ClipPath id="avatarCircle">
            <Circle cx="50" cy="50" r="50" />
          </ClipPath>
        </Defs>

        <G clipPath="url(#avatarCircle)">
          {/* Background circle */}
          <Circle cx="50" cy="50" r="50" fill="#DCFCE7" />

          {/* Torso & Green Dungarees */}
          <Path
            d="M20 100 C20 75 32 70 50 70 C68 70 80 75 80 100 Z"
            fill="#15803D"
          />
          {/* Shirt Collar / Undershirt */}
          <Path
            d="M38 70 Q50 82 62 70"
            fill="#FFFFFF"
          />
          {/* Suspenders */}
          <Path d="M34 72 V100" stroke="#14532D" strokeWidth="6" />
          <Path d="M66 72 V100" stroke="#14532D" strokeWidth="6" />
          {/* Yellow Buckles */}
          <Circle cx="34" cy="80" r="3" fill="#FBBF24" />
          <Circle cx="66" cy="80" r="3" fill="#FBBF24" />

          {/* Neck */}
          <Rect x="43" y="52" width="14" height="20" fill="#F0AC84" rx="4" />

          {/* Head */}
          <Circle cx="50" cy="45" r="22" fill="#F0AC84" />

          {/* Friendly Eyes */}
          <Circle cx="42" cy="42" r="2.5" fill="#18241B" />
          <Circle cx="58" cy="42" r="2.5" fill="#18241B" />

          {/* Nose */}
          <Path
            d="M50 43 Q48 48 50 49"
            stroke="#E08354"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Beard & Mustache */}
          <Path
            d="M32 46 C32 68 68 68 68 46 C60 56 40 56 32 46 Z"
            fill="#78350F"
          />
          <Path
            d="M38 48 Q50 56 62 48"
            stroke="#78350F"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Smile inside beard */}
          <Path
            d="M45 54 Q50 58 55 54"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Ears */}
          <Circle cx="28" cy="46" r="4.5" fill="#E08354" />
          <Circle cx="72" cy="46" r="4.5" fill="#E08354" />

          {/* Straw Hat */}
          {/* Wide Brim */}
          <Path
            d="M12 34 C12 34 50 20 88 34 C82 38 50 37 12 34 Z"
            fill="#F59E0B"
          />
          <Path
            d="M10 33 C10 33 50 22 90 33 C80 35 50 36 10 33 Z"
            fill="#D97706"
          />
          {/* Hat Crown */}
          <Path
            d="M30 33 C30 10 70 10 70 33 Z"
            fill="#FBBF24"
          />
          {/* Red Ribbon Band */}
          <Path
            d="M30 30 C42 27 58 27 70 30"
            stroke="#DC2626"
            strokeWidth="4.5"
          />
        </G>
      </Svg>

      {/* Verified Badge Pill */}
      {showVerified && (
        <View style={styles.verifiedBadge}>
          <Svg width={size * 0.3} height={size * 0.3} viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" fill="#15803D" />
            <Path
              d="M7.5 12L10.5 15L16.5 9"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
});
