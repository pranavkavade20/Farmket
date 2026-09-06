import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TextInputProps,
  TouchableOpacity,
  ViewStyle
} from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';
import { AppText } from './AppText';
import { Eye, EyeOff, XCircle } from 'lucide-react-native';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  containerStyle?: ViewStyle;
}

export function AppInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  secureTextEntry,
  style,
  containerStyle,
  value,
  onChangeText,
  editable = true,
  ...props
}: AppInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const hasValue = Boolean(value && value.length > 0);

  const getBorderColor = () => {
    if (error) return colors.status.danger;
    if (isFocused) return colors.brand.primary;
    return colors.border.subtle;
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChangeText) {
      onChangeText('');
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <AppText 
          variant="label" 
          weight="semibold" 
          color={colors.text.secondary} 
          style={styles.label}
        >
          {label}
        </AppText>
      )}
      
      <View 
        style={[
          styles.inputContainer, 
          { 
            borderColor: getBorderColor(),
            backgroundColor: editable ? colors.background.surface : colors.background.elevated,
          },
          isFocused && styles.inputContainerFocused,
          Boolean(error) && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            { fontFamily: typography.family.sans },
            !editable && { color: colors.text.muted },
            style
          ]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          placeholderTextColor={colors.text.muted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />

        {clearable && hasValue && editable && (
          <TouchableOpacity 
            style={styles.actionIcon} 
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <XCircle size={18} color={colors.text.muted} />
          </TouchableOpacity>
        )}
        
        {secureTextEntry ? (
          <TouchableOpacity 
            style={styles.actionIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={colors.text.muted} />
            ) : (
              <Eye size={20} color={colors.text.muted} />
            )}
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.actionIcon}>{rightIcon}</View>
        ) : null}
      </View>
      
      {error ? (
        <AppText 
          variant="caption" 
          color={colors.status.danger} 
          style={styles.helper}
        >
          {error}
        </AppText>
      ) : helperText ? (
        <AppText 
          variant="caption" 
          color={colors.text.muted} 
          style={styles.helper}
        >
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radii.lg,
    backgroundColor: colors.background.surface,
    height: 50,
  },
  inputContainerFocused: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.background.surface,
  },
  inputContainerError: {
    borderColor: colors.status.danger,
    backgroundColor: '#FEF2F2',
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
  actionIcon: {
    paddingHorizontal: spacing.md,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helper: {
    marginTop: spacing.xxs,
  }
});
