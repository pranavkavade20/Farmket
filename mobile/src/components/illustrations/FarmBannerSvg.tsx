import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  Polygon,
} from 'react-native-svg';

interface FarmBannerSvgProps {
  width?: number;
  height?: number;
  variant?: 'homeHero' | 'profileHeader';
  style?: StyleProp<ViewStyle>;
}

export const FarmBannerSvg: React.FC<FarmBannerSvgProps> = ({
  width = 340,
  height = 160,
  variant = 'homeHero',
  style,
}) => {
  if (variant === 'homeHero') {
    // Exact match for Screen 2 Hero section illustration inside the deep green card
    return (
      <View style={[styles.container, style]}>
        <Svg width={width} height={height} viewBox="0 0 340 160" fill="none">
          <Defs>
            <LinearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#1B663E" />
              <Stop offset="100%" stopColor="#14532D" />
            </LinearGradient>
          </Defs>

          {/* Background card fill */}
          <Rect width="340" height="160" fill="url(#heroSky)" rx="24" />

          {/* Glowing Sun */}
          <Circle cx="265" cy="50" r="16" fill="#FDE047" />
          <Circle cx="265" cy="50" r="24" fill="#FDE047" opacity="0.25" />

          {/* Distant Hills */}
          <Path
            d="M140 160 Q200 90 280 105 T350 95 V160 Z"
            fill="#1E7A4A"
          />

          {/* Midground Hills */}
          <Path
            d="M170 160 Q230 110 300 120 T350 115 V160 Z"
            fill="#27965B"
          />

          {/* Foreground Hill with Field Curves */}
          <Path
            d="M190 160 Q250 125 340 135 V160 Z"
            fill="#34A86A"
          />
          <Path
            d="M205 160 Q265 135 340 145"
            stroke="#21784A"
            strokeWidth="2.5"
            fill="none"
          />
          <Path
            d="M225 160 Q285 145 340 152"
            stroke="#21784A"
            strokeWidth="2.5"
            fill="none"
          />

          {/* Red Barn / Farmhouse */}
          <G id="Barn">
            {/* Barn Walls */}
            <Rect x="255" y="105" width="36" height="25" fill="#DC2626" rx="1.5" />
            {/* White Barn Door */}
            <Path d="M268 115 H278 V130 H268 Z" fill="#FFFFFF" />
            <Path d="M268 115 L278 130" stroke="#DC2626" strokeWidth="1" />
            <Path d="M278 115 L268 130" stroke="#DC2626" strokeWidth="1" />
            {/* White Window */}
            <Rect x="270" y="107" width="6" height="5" fill="#FFFFFF" rx="0.5" />

            {/* Roof - Warm Orange/Yellow Terracotta */}
            <Polygon points="250,105 273,88 296,105" fill="#F97316" />
            <Polygon points="253,105 273,90 293,105" fill="#EA580C" />

            {/* Silo or Small Tree */}
            <Circle cx="248" cy="115" r="9" fill="#15803D" />
            <Circle cx="298" cy="118" r="8" fill="#166534" />
          </G>
        </Svg>
      </View>
    );
  }

  // variant === 'profileHeader' for Screen 4 Farmer Profile Banner
  return (
    <View style={[styles.container, style]}>
      <Svg width={width} height={height} viewBox="0 0 400 180" fill="none">
        <Defs>
          <LinearGradient id="profileSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#BAE6FD" />
            <Stop offset="80%" stopColor="#E0F2FE" />
            <Stop offset="100%" stopColor="#DCFCE7" />
          </LinearGradient>
        </Defs>

        {/* Sky */}
        <Rect width="400" height="180" fill="url(#profileSky)" />

        {/* Warm Golden Sun */}
        <Circle cx="320" cy="50" r="22" fill="#FDE047" />
        <Circle cx="320" cy="50" r="32" fill="#FEF08A" opacity="0.4" />

        {/* Soft Fluffy Clouds */}
        <Path
          d="M60 45 C60 38 68 35 76 38 C80 32 92 32 98 38 C105 35 114 40 112 48 C118 51 117 60 110 61 H64 C58 59 55 52 60 45 Z"
          fill="#FFFFFF"
          opacity="0.85"
        />
        <Path
          d="M200 35 C200 30 206 28 212 30 C216 26 224 26 229 30 C234 28 241 31 239 37 C244 40 243 46 238 47 H203 C198 46 196 40 200 35 Z"
          fill="#FFFFFF"
          opacity="0.7"
        />

        {/* Far Mountains / Blue-Green Hills */}
        <Path
          d="M-20 120 Q80 70 190 100 T420 90 V180 H-20 Z"
          fill="#86EFAC"
        />

        {/* Midground Rolling Hills */}
        <Path
          d="M-20 135 Q100 95 240 120 T420 110 V180 H-20 Z"
          fill="#4ADE80"
        />

        {/* Foreground Crop Fields */}
        <Path
          d="M-20 155 Q130 125 280 140 T420 130 V180 H-20 Z"
          fill="#22C55E"
        />
        {/* Farm Field Grooves */}
        <Path
          d="M0 168 Q140 138 300 152 T420 145"
          stroke="#16A34A"
          strokeWidth="3.5"
          fill="none"
        />

        {/* Farm Cottage / Red Barn in Distance */}
        <G id="ProfileBarn">
          <Rect x="280" y="95" width="42" height="28" fill="#DC2626" rx="2" />
          {/* Barn Door */}
          <Rect x="295" y="107" width="12" height="16" fill="#FEF3C7" rx="1" />
          <Path d="M295 107 L307 123" stroke="#B45309" strokeWidth="1" />
          <Path d="M307 107 L295 123" stroke="#B45309" strokeWidth="1" />
          {/* Roof */}
          <Polygon points="274,95 301,76 328,95" fill="#F97316" />
          {/* Trees surrounding farmhouse */}
          <Circle cx="265" cy="108" r="14" fill="#15803D" />
          <Circle cx="272" cy="112" r="10" fill="#166534" />
          <Circle cx="335" cy="106" r="13" fill="#15803D" />
          <Circle cx="344" cy="110" r="9" fill="#166534" />
        </G>

        {/* Left Side Tree Grove */}
        <Circle cx="40" cy="125" r="18" fill="#15803D" />
        <Circle cx="55" cy="130" r="14" fill="#166534" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
