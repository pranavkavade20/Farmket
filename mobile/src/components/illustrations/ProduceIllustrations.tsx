import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

// ==========================================
// 1. ORGANIC TOMATOES (Cluster + Sliced Half)
// ==========================================
export const TomatoesIllustration: React.FC<{ size?: number; style?: StyleProp<ViewStyle> }> = ({
  size = 120,
  style,
}) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <Defs>
          <LinearGradient id="tomatoGrad1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#EF4444" />
            <Stop offset="100%" stopColor="#DC2626" />
          </LinearGradient>
          <LinearGradient id="tomatoGrad2" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#F87171" />
            <Stop offset="100%" stopColor="#B91C1C" />
          </LinearGradient>
          <LinearGradient id="sliceInterior" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FCA5A5" />
            <Stop offset="100%" stopColor="#EF4444" />
          </LinearGradient>
        </Defs>

        {/* Back Leaves */}
        <Path
          d="M70 65 C45 45 40 85 55 95 C65 100 75 80 70 65 Z"
          fill="#16A34A"
        />
        <Path
          d="M130 55 C155 35 165 75 145 90 C135 95 125 75 130 55 Z"
          fill="#15803D"
        />

        {/* Back Tomato (Top Center) */}
        <Circle cx="125" cy="85" r="38" fill="url(#tomatoGrad2)" />
        <Circle cx="120" cy="78" r="7" fill="#FCA5A5" opacity="0.4" />
        {/* Calyx / Leaves for Back Tomato */}
        <Path
          d="M125 50 L120 40 L128 47 L138 38 L133 49 L144 55 L131 56 Z"
          fill="#15803D"
        />

        {/* Left Tomato */}
        <Circle cx="80" cy="115" r="42" fill="url(#tomatoGrad1)" />
        <Circle cx="72" cy="100" r="10" fill="#FCA5A5" opacity="0.5" />
        {/* Calyx for Left Tomato */}
        <Path
          d="M80 75 L74 65 L81 72 L90 62 L87 74 L98 78 L85 80 L72 82 L77 75 Z"
          fill="#22C55E"
        />

        {/* Right Tomato (Whole) */}
        <Circle cx="145" cy="118" r="39" fill="url(#tomatoGrad1)" />
        <Circle cx="140" cy="105" r="8" fill="#FCA5A5" opacity="0.4" />
        {/* Calyx for Right Tomato */}
        <Path
          d="M145 80 L140 70 L147 78 L157 68 L153 80 L164 84 L150 85 Z"
          fill="#16A34A"
        />

        {/* Front Tomato Slice (Cross section in front) */}
        <G id="TomatoSlice">
          {/* Outer skin ring */}
          <Circle cx="122" cy="138" r="32" fill="#DC2626" />
          {/* Inner pulp circle */}
          <Circle cx="122" cy="138" r="28" fill="url(#sliceInterior)" />
          {/* Central core */}
          <Circle cx="122" cy="138" r="8" fill="#FFFFFF" opacity="0.8" />
          <Circle cx="122" cy="138" r="5" fill="#EF4444" />

          {/* 4 Seed chambers */}
          {/* Top Left Chamber */}
          <Path
            d="M110 124 C112 118 122 118 125 125 C122 129 113 129 110 124 Z"
            fill="#B91C1C"
          />
          <Circle cx="117" cy="123" r="2.2" fill="#FEF08A" />
          <Circle cx="121" cy="124" r="2" fill="#FEF08A" />

          {/* Top Right Chamber */}
          <Path
            d="M129 124 C132 118 141 120 142 127 C138 131 130 130 129 124 Z"
            fill="#B91C1C"
          />
          <Circle cx="134" cy="124" r="2.2" fill="#FEF08A" />
          <Circle cx="138" cy="126" r="2" fill="#FEF08A" />

          {/* Bottom Left Chamber */}
          <Path
            d="M108 138 C106 146 114 153 120 151 C121 146 114 140 108 138 Z"
            fill="#B91C1C"
          />
          <Circle cx="112" cy="144" r="2.2" fill="#FEF08A" />
          <Circle cx="116" cy="147" r="2" fill="#FEF08A" />

          {/* Bottom Right Chamber */}
          <Path
            d="M135 138 C142 140 143 148 137 153 C132 150 131 143 135 138 Z"
            fill="#B91C1C"
          />
          <Circle cx="137" cy="145" r="2.2" fill="#FEF08A" />
          <Circle cx="134" cy="148" r="2" fill="#FEF08A" />
        </G>
      </Svg>
    </View>
  );
};

// ==========================================
// 2. FRESH SPINACH (Leafy Green Bunch)
// ==========================================
export const SpinachIllustration: React.FC<{ size?: number; style?: StyleProp<ViewStyle> }> = ({
  size = 120,
  style,
}) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        {/* Back Leaves */}
        <Path
          d="M70 120 C40 80 50 30 95 40 C125 45 120 90 90 130 Z"
          fill="#15803D"
        />
        <Path
          d="M130 120 C160 80 150 30 105 40 C75 45 80 90 110 130 Z"
          fill="#166534"
        />

        {/* Center Back Leaf */}
        <Path
          d="M100 135 C70 90 70 30 100 20 C130 30 130 90 100 135 Z"
          fill="#16A34A"
        />
        {/* Rib for center back leaf */}
        <Path d="M100 135 V30" stroke="#86EFAC" strokeWidth="2.5" />

        {/* Midground Fluffy Leaves Left */}
        <Path
          d="M60 140 C35 110 35 65 75 60 C105 55 105 105 85 145 Z"
          fill="#22C55E"
        />
        <Path d="M80 142 Q70 100 62 70" stroke="#DCFCE7" strokeWidth="2" fill="none" />

        {/* Midground Fluffy Leaves Right */}
        <Path
          d="M140 140 C165 110 165 65 125 60 C95 55 95 105 115 145 Z"
          fill="#16A34A"
        />
        <Path d="M120 142 Q130 100 138 70" stroke="#DCFCE7" strokeWidth="2" fill="none" />

        {/* Foreground Leaves */}
        <Path
          d="M75 160 C55 130 65 95 100 90 C125 90 125 130 95 165 Z"
          fill="#4ADE80"
        />
        <Path d="M90 160 Q88 125 85 100" stroke="#FFFFFF" strokeWidth="2" fill="none" />

        <Path
          d="M125 160 C145 130 135 95 100 90 C75 90 75 130 105 165 Z"
          fill="#22C55E"
        />
        <Path d="M110 160 Q112 125 115 100" stroke="#DCFCE7" strokeWidth="2" fill="none" />

        {/* Bundled Stem Base */}
        <Path
          d="M90 160 Q100 178 110 160 L106 185 Q100 188 94 185 Z"
          fill="#15803D"
        />
      </Svg>
    </View>
  );
};

// ==========================================
// 3. FRESH CARROTS (Bunch with Greens)
// ==========================================
export const CarrotsIllustration: React.FC<{ size?: number; style?: StyleProp<ViewStyle> }> = ({
  size = 120,
  style,
}) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        {/* Feathery carrot greens */}
        <G id="Greens">
          <Path
            d="M95 90 Q80 40 60 25 Q75 50 85 85"
            stroke="#16A34A"
            strokeWidth="3.5"
            fill="none"
          />
          <Path
            d="M100 85 Q100 30 95 15 Q105 40 103 80"
            stroke="#22C55E"
            strokeWidth="4"
            fill="none"
          />
          <Path
            d="M105 90 Q120 40 140 25 Q125 50 115 85"
            stroke="#15803D"
            strokeWidth="3.5"
            fill="none"
          />
          <Circle cx="60" cy="25" r="5" fill="#22C55E" />
          <Circle cx="95" cy="15" r="6" fill="#16A34A" />
          <Circle cx="140" cy="25" r="5" fill="#22C55E" />
        </G>

        {/* Back Carrot (Left) */}
        <Path
          d="M75 90 Q72 82 88 84 Q100 85 96 92 L80 170 Q77 172 75 168 Z"
          fill="#EA580C"
        />
        {/* Carrot ridges */}
        <Path d="M78 110 H88" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />
        <Path d="M80 135 H86" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />

        {/* Back Carrot (Right) */}
        <Path
          d="M105 92 Q102 84 118 86 Q128 88 125 95 L118 165 Q115 168 113 164 Z"
          fill="#EA580C"
        />
        <Path d="M112 115 H122" stroke="#C2410C" strokeWidth="2" strokeLinecap="round" />

        {/* Front Center Carrot */}
        <Path
          d="M86 92 Q84 84 102 85 Q120 86 116 94 L98 185 Q95 188 93 184 Z"
          fill="#F97316"
        />
        {/* Carrot ridges */}
        <Path d="M92 105 H106" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M93 125 H104" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M94 148 H102" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
        <Path d="M95 168 H99" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
      </Svg>
    </View>
  );
};

// ==========================================
// 4. CATEGORY ICONS (Vegetables, Fruits, Grains, Dairy)
// ==========================================

export const VegetablesCategorySvg: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Clean cabbage/lettuce icon */}
    <Circle cx="16" cy="17" r="11" fill="#DCFCE7" />
    <Path
      d="M16 8 C11 8 7 12 7 17 C7 22 11 26 16 26 C21 26 25 22 25 17 C25 12 21 8 16 8 Z"
      fill="#22C55E"
    />
    <Path
      d="M16 11 C13 11 11 14 11 17 C11 20 13 23 16 23 C19 23 21 20 21 17 C21 14 19 11 16 11 Z"
      fill="#4ADE80"
    />
    <Path d="M16 12 V22" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M13 15 Q16 17 19 15" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

export const FruitsCategorySvg: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Ripe juicy orange/apple fruit icon */}
    <Circle cx="16" cy="17" r="11" fill="#FEF3C7" />
    <Circle cx="16" cy="18" r="10" fill="#F97316" />
    <Circle cx="13" cy="14" r="2.5" fill="#FDBA74" />
    {/* Green leaf on stem */}
    <Path d="M16 8 V11" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
    <Path
      d="M16 9 C19 7 23 9 22 12 C19 12 17 11 16 9 Z"
      fill="#22C55E"
    />
  </Svg>
);

export const GrainsCategorySvg: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Golden wheat stalk icon */}
    <Circle cx="16" cy="16" r="12" fill="#FEF9C3" />
    <Path d="M16 26 V8" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />
    {/* Grain kernels */}
    <Ellipse cx="13" cy="11" rx="2.5" ry="4" transform="rotate(-30 13 11)" fill="#EAB308" />
    <Ellipse cx="19" cy="11" rx="2.5" ry="4" transform="rotate(30 19 11)" fill="#EAB308" />
    <Ellipse cx="12.5" cy="17" rx="2.5" ry="4" transform="rotate(-30 12.5 17)" fill="#EAB308" />
    <Ellipse cx="19.5" cy="17" rx="2.5" ry="4" transform="rotate(30 19.5 17)" fill="#EAB308" />
    <Ellipse cx="16" cy="7" rx="2.2" ry="3.5" fill="#EAB308" />
  </Svg>
);

export const DairyCategorySvg: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Fresh milk bottle */}
    <Circle cx="16" cy="16" r="12" fill="#E0F2FE" />
    <Path
      d="M13 13 C13 11 14 9 14 9 H18 C18 9 19 11 19 13 V23 C19 24.5 18 25 16 25 C14 25 13 24.5 13 23 V13 Z"
      fill="#FFFFFF"
      stroke="#0284C7"
      strokeWidth="1.5"
    />
    <Rect x="14" y="7" width="4" height="2.5" fill="#0284C7" rx="1" />
    {/* Milk label */}
    <Rect x="13.5" y="16" width="5" height="4" fill="#BAE6FD" />
  </Svg>
);
