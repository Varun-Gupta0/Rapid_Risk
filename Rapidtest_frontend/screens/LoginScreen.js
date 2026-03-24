import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import colors from '../theme/colors';
import { login, requestOTP } from '../utils/auth';

const { width } = Dimensions.get('window');

export default function LoginScreen({ onLogin }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [healthWorkerId, setHealthWorkerId] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false); // For OTP request
  const [isLoggingIn, setIsLoggingIn] = useState(false); // For login verification
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(0);


  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const validateRequest = () => {
    let newErrors = {};
    if (phoneNumber.length !== 10 || isNaN(parseInt(phoneNumber, 10))) {
      newErrors.phoneNumber = 'Enter a valid 10-digit phone number';
    }
    if (healthWorkerId.length < 2) {
      newErrors.healthWorkerId = 'Health Worker ID is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    let newErrors = {};
    if (otp.length !== 6) {
      newErrors.otp = 'Enter the 6-digit OTP';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestOtp = async () => {
    if (!validateRequest()) return;

    setLoading(true);
    const response = await requestOTP(phoneNumber, healthWorkerId);
    setLoading(false);

    if (response.success) {
      setIsOtpSent(true);
      setCountdown(60);
      // For demo, if OTP is returned in response, we'll alert it
      if (response.otp) {
        Alert.alert(`Demo Mode: Your OTP is ${response.otp}`);
      } else {
        Alert.alert('Success', 'OTP sent successfully to your registered number.');
      }
    } else {
      Alert.alert('Error', response.message || 'Failed to request OTP. Please check your credentials.');
    }
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    setIsLoggingIn(true);
    const result = await login(phoneNumber, healthWorkerId, otp);
    setIsLoggingIn(false);

    if (result.success) {
      onLogin('Health Worker');
    } else {
      Alert.alert('Login Failed', result.error || 'Login failed. Please try again.');
    }

  };

  const resetForm = () => {
    setIsOtpSent(false);
    setOtp('');
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🛡️</Text>
            </View>
            <Text style={styles.appName}>RakshaAI</Text>
            <Text style={styles.tagline}>Intelligent Health Guard for Everyone</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Health Worker Portal</Text>
            <Text style={styles.formSubtitle}>
              {isOtpSent ? 'Verify your identity' : 'Sign in to access patient diagnostics'}
            </Text>

            {!isOtpSent ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={[styles.input, errors.phoneNumber && styles.inputError]}
                    placeholder="10-digit mobile number"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholderTextColor={colors.textSecondary + '80'}
                  />
                  {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Health Worker ID</Text>
                  <TextInput
                    style={[styles.input, errors.healthWorkerId && styles.inputError]}
                    placeholder="ID-XXXXXXXX"
                    value={healthWorkerId}
                    onChangeText={setHealthWorkerId}
                    placeholderTextColor={colors.textSecondary + '80'}
                  />
                  {errors.healthWorkerId && <Text style={styles.errorText}>{errors.healthWorkerId}</Text>}
                </View>

                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={handleRequestOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.loginButtonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Verification Code</Text>
                    <TouchableOpacity onPress={resetForm}>
                      <Text style={styles.changeText}>Change Details</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.input, errors.otp && styles.inputError]}
                    placeholder="6-digit OTP"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    placeholderTextColor={colors.textSecondary + '80'}
                  />
                  {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
                  <Text style={styles.resendText}>
                    {countdown > 0 
                      ? `Resend OTP in ${countdown}s` 
                      : 'Didn\'t receive OTP? Resend'}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={handleLogin}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.loginButtonText}>Verify & Launch</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            <Text style={styles.securityNote}>
              🔒 Secure multi-factor authentication enabled
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primaryBlue,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeText: {
    fontSize: 12,
    color: colors.primaryBlue,
    fontWeight: '700',
  },
  resendText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  formTitle: {

    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputError: {
    borderColor: colors.accentRed,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: colors.primaryBlue,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  securityNote: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 12,
    color: colors.textSecondary,
    opacity: 0.8,
  },
});
