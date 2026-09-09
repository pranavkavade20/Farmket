import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing, radii } from '../../theme';
import { Minus, Plus } from 'lucide-react-native';

interface FarmketQuantitySelectorProps {
  quantity: number;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (qty: number) => void;
  style?: StyleProp<ViewStyle>;
}

export const FarmketQuantitySelector: React.FC<FarmketQuantitySelectorProps> = ({
  quantity,
  unit = 'kg',
  min = 1,
  max = 99,
  step = 1,
  onChange,
  style,
}) => {
  const handleDecrement = () => {
    if (quantity > min) {
      onChange(Math.max(min, quantity - step));
    }
  };

  const handleIncrement = () => {
    if (quantity < max) {
      onChange(Math.min(max, quantity + step));
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      <AppText variant="bodySmall" weight="bold" color={colors.text.primary} style={styles.title}>
        Select Quantity
      </AppText>

      <View style={styles.selectorRow}>
        <TouchableOpacity
          style={[styles.stepBtn, quantity <= min && styles.stepBtnDisabled]}
          onPress={handleDecrement}
          disabled={quantity <= min}
          activeOpacity={0.7}
        >
          <Minus size={18} color={quantity <= min ? colors.text.muted : colors.text.primary} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.quantityDisplay}>
          <AppText variant="h2" weight="bold" color={colors.text.primary}>
            {quantity}{' '}
            <AppText variant="body" weight="medium" color={colors.text.secondary}>
              {unit}
            </AppText>
          </AppText>
        </View>

        <TouchableOpacity
          style={[styles.stepBtn, quantity >= max && styles.stepBtnDisabled]}
          onPress={handleIncrement}
          disabled={quantity >= max}
          activeOpacity={0.7}
        >
          <Plus size={18} color={quantity >= max ? colors.text.muted : colors.text.primary} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.md,
  },
  title: {
    marginBottom: spacing.sm,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9F5',
    borderRadius: radii.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#EAECE7',
  },
  stepBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAECE7',
  },
  stepBtnDisabled: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    opacity: 0.5,
  },
  quantityDisplay: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
