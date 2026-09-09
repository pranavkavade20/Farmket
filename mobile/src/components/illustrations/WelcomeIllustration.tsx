import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
} from 'react-native-svg';

interface WelcomeIllustrationProps {
  width?: number;
  height?: number;
}

export const WelcomeIllustration: React.FC<WelcomeIllustrationProps> = ({
  width = Dimensions.get('window').width - 40,
  height = 320,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 380 320" fill="none">
        <Defs>
          <ClipPath id="cardClip">
            <Path
              d="M0 24C0 10.7452 10.7452 0 24 0H356C369.255 0 380 10.7452 380 24V280C380 280 290 320 190 310C90 300 0 320 0 320V24Z"
            />
          </ClipPath>
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#F0FDF4" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        <G clipPath="url(#cardClip)">
          {/* Background Sky */}
          <Rect width="380" height="320" fill="url(#skyGrad)" />

          {/* Sun */}
          <Circle cx="300" cy="90" r="32" fill="#FEF08A" opacity="0.85" />
          <Circle cx="300" cy="90" r="42" fill="#FEF08A" opacity="0.3" />

          {/* Distant Cloud */}
          <Path
            d="M80 60 C80 50 92 45 105 50 C112 40 128 40 138 48 C148 44 160 52 158 64 C166 68 165 80 155 82 H85 C75 80 72 70 80 60 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />

          {/* Far Distant Hills */}
          <Path
            d="M-20 220 Q90 140 220 180 T400 170 V320 H-20 Z"
            fill="#BCE3C8"
          />

          {/* Midground Rolling Hills */}
          <Path
            d="M-20 240 Q110 170 260 210 T400 200 V320 H-20 Z"
            fill="#80C997"
          />

          {/* Foreground Agricultural Field with Furrow Stripes */}
          <Path
            d="M-20 270 Q140 210 300 240 T400 240 V320 H-20 Z"
            fill="#4FA86C"
          />
          <Path
            d="M0 290 Q120 240 280 270 T400 265"
            stroke="#3C8D55"
            strokeWidth="3"
            fill="none"
          />

          {/* Trees in distance */}
          <Circle cx="120" cy="180" r="14" fill="#3D8A57" />
          <Circle cx="132" cy="185" r="10" fill="#2E6E44" />
          <Circle cx="260" cy="195" r="12" fill="#3D8A57" />

          {/* ================= FARMER (LEFT) ================= */}
          <G id="Farmer">
            {/* Farmer Body / Legs */}
            <Rect x="78" y="270" width="18" height="50" fill="#14532D" rx="4" />
            <Rect x="100" y="270" width="18" height="50" fill="#14532D" rx="4" />

            {/* Torso - Green Dungarees over Teal Shirt */}
            <Path
              d="M74 210 C74 195 86 190 98 190 C110 190 122 195 122 210 V275 H74 V210 Z"
              fill="#1B7A42"
            />
            {/* Dungarees Bib & Straps */}
            <Path
              d="M82 220 H114 V275 H82 Z"
              fill="#14532D"
            />
            <Path d="M84 198 V220" stroke="#0F3F22" strokeWidth="4" />
            <Path d="M112 198 V220" stroke="#0F3F22" strokeWidth="4" />
            {/* Yellow dungaree buttons */}
            <Circle cx="84" cy="223" r="2.5" fill="#EAB308" />
            <Circle cx="112" cy="223" r="2.5" fill="#EAB308" />

            {/* Farmer Left Arm reaching to crate */}
            <Path
              d="M115 208 Q140 215 155 235"
              stroke="#E29D72"
              strokeWidth="11"
              strokeLinecap="round"
            />
            {/* Farmer Shirt sleeve */}
            <Path
              d="M110 200 Q122 203 126 215"
              stroke="#1B7A42"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Neck */}
            <Rect x="92" y="176" width="12" height="16" fill="#F0AC84" rx="3" />

            {/* Head */}
            <Circle cx="98" cy="165" r="16" fill="#F0AC84" />
            {/* Beard & Mustache */}
            <Path
              d="M86 166 C86 182 110 182 110 166 C105 174 91 174 86 166 Z"
              fill="#78350F"
            />
            <Path
              d="M90 166 Q98 171 106 166"
              stroke="#78350F"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Eye & Smile */}
            <Circle cx="103" cy="161" r="2" fill="#18241B" />
            <Path
              d="M99 170 Q103 173 107 170"
              stroke="#B45309"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Straw Hat */}
            {/* Brim */}
            <Path
              d="M72 155 Q98 145 124 155 Q98 152 72 155 Z"
              fill="#F59E0B"
            />
            <Path
              d="M68 154 C68 154 98 146 128 154 C124 156 100 157 68 154 Z"
              fill="#D97706"
            />
            {/* Crown */}
            <Path
              d="M84 153 C84 135 112 135 112 153 Z"
              fill="#FBBF24"
            />
            {/* Hat Band */}
            <Path
              d="M84 150 C93 148 103 148 112 150"
              stroke="#DC2626"
              strokeWidth="3.5"
            />
          </G>

          {/* ================= PRODUCE CRATE (CENTER) ================= */}
          <G id="ProduceCrate">
            {/* Wooden Crate Box */}
            <Rect x="145" y="230" width="70" height="42" fill="#92400E" rx="3" />
            <Rect x="143" y="227" width="74" height="10" fill="#B45309" rx="2" />
            <Rect x="143" y="242" width="74" height="8" fill="#B45309" rx="1" />
            <Rect x="143" y="255" width="74" height="8" fill="#B45309" rx="1" />
            {/* Crate Cutout handle */}
            <Rect x="170" y="238" width="18" height="5" fill="#78350F" rx="2.5" />

            {/* Fresh Produce inside crate */}
            {/* Leafy greens in back */}
            <Circle cx="160" cy="222" r="14" fill="#22C55E" />
            <Circle cx="172" cy="217" r="13" fill="#16A34A" />
            <Circle cx="186" cy="220" r="12" fill="#22C55E" />

            {/* Carrots */}
            <Path
              d="M178 226 L170 210 L176 210 Z"
              fill="#F97316"
            />
            <Path
              d="M173 210 Q171 202 168 198"
              stroke="#15803D"
              strokeWidth="2"
            />

            {/* Tomatoes */}
            <Circle cx="163" cy="227" r="9" fill="#EF4444" />
            <Circle cx="161" cy="224" r="2" fill="#FCA5A5" />
            <Circle cx="195" cy="226" r="9.5" fill="#EF4444" />
            <Circle cx="193" cy="223" r="2.5" fill="#FCA5A5" />
            <Circle cx="178" cy="227" r="10" fill="#DC2626" />
            <Circle cx="176" cy="224" r="2.5" fill="#FCA5A5" />
            {/* Tomato stems */}
            <Path d="M178 217 L178 220" stroke="#15803D" strokeWidth="2" />
            <Path d="M163 217 L163 220" stroke="#15803D" strokeWidth="2" />
            <Path d="M195 216 L195 219" stroke="#15803D" strokeWidth="2" />

            {/* Golden Squash/Pumpkin */}
            <Circle cx="184" cy="223" r="8" fill="#F59E0B" />
          </G>

          {/* ================= BUYER (RIGHT) ================= */}
          <G id="Buyer">
            {/* Buyer Torso / Yellow Shirt */}
            <Path
              d="M246 220 C240 205 255 195 272 195 C288 195 302 205 296 220 V280 H246 V220 Z"
              fill="#F59E0B"
            />

            {/* Buyer Left Arm reaching to crate */}
            <Path
              d="M255 210 Q235 220 205 235"
              stroke="#F5B28D"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Buyer sleeve */}
            <Path
              d="M260 205 Q252 210 248 220"
              stroke="#EA580C"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Neck */}
            <Rect x="266" y="180" width="11" height="16" fill="#F5B28D" rx="3" />

            {/* Head */}
            <Circle cx="272" cy="170" r="15" fill="#F5B28D" />

            {/* Smiling Face profile */}
            <Circle cx="266" cy="167" r="2" fill="#18241B" />
            <Path
              d="M261 176 Q266 180 271 176"
              stroke="#C2410C"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Long dark hair flowing behind */}
            <Path
              d="M268 155 C255 155 258 175 258 175 C258 175 264 163 273 162 C285 162 288 172 290 185 C292 195 293 215 288 230 C285 240 278 245 278 245 C288 240 295 225 296 205 C298 185 296 165 285 156 C280 154 274 155 268 155 Z"
              fill="#1F2937"
            />
          </G>
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
