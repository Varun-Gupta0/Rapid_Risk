import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import colors from '../theme/colors';

export default function PrimaryButton({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  style = {}
}) {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary': return [styles.button, styles.secondaryButton];
      case 'outline': return [styles.button, styles.outlineButton];
      case 'success': return [styles.button, styles.successButton];
      case 'danger': return [styles.button, styles.dangerButton];
      default: return [styles.button, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline': return [styles.text, styles.outlineText];
      default: return [styles.text, styles.primaryText];
    }
  };

  const getIndicatorColor = () => {
    if (variant === 'outline') return colors.primaryBlue;
    return 'white';
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), disabled && styles.disabledButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getIndicatorColor()} />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
  },
  secondaryButton: {
    backgroundColor: colors.textSecondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primaryBlue,
    elevation: 0,
    shadowOpacity: 0,
  },
  successButton: {
    backgroundColor: colors.healthcareGreen,
  },
  dangerButton: {
    backgroundColor: colors.accentRed,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: 'white',
  },
  outlineText: {
    color: colors.primaryBlue,
  },
  disabledButton: {
    opacity: 0.5,
  }
});
