import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TextInputProps,
  TouchableOpacity
} from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { AppText } from './AppText';
import { Eye, EyeOff } from 'lucide-react-native';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function AppInput({
  label,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry,
  style,
  ...props
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const getBorderColor = () => {
    if (error) return colors.status.danger;
    if (isFocused) return colors.brand.primary;
    return colors.border.strong;
  };

  return (
    <View style={styles.container}>
      {label && (
        <AppText 
          variant="small" 
          weight="medium" 
          color={colors.text.secondary} 
          style={styles.label}
        >
          {label}
        </AppText>
      )}
      
      <View style={[styles.inputContainer, { borderColor: getBorderColor() }]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            { fontFamily: typography.family.sans },
            style
          ]}
          placeholderTextColor={colors.text.muted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        
        {secureTextEntry ? (
          <TouchableOpacity 
            style={styles.rightIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.text.muted} />
            ) : (
              <Eye size={20} color={colors.text.muted} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>
      
      {error && (
        <AppText 
          variant="small" 
          color={colors.status.danger} 
          style={styles.error}
        >
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.md,
    backgroundColor: colors.background.surface,
    height: 48,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
    fontSize: typography.size.md,
  },
  leftIcon: {
    paddingLeft: spacing.md,
  },
  rightIcon: {
    paddingRight: spacing.md,
  },
  error: {
    marginTop: spacing.xxs,
  }
});
