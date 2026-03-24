import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Switch, 
  TextInput, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import Slider from '@react-native-community/slider';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import { isAuthenticated, BASE_URL } from '../utils/auth';
import { calculateRisk, calculateRiskEnhanced } from '../utils/riskScorer';
import * as Speech from 'expo-speech';
import { CONFIG } from '../utils/config';

export default function AssessmentScreen({ navigation, route }) {
  const { isOnline = false, isDemo = false } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [formData, setFormData] = useState({
    age: 45,
    fever: false,
    breathingDifficulty: false,
    chronicDisease: false,
    heartRate: 72,
    oxygenLevel: 98,
    hasDiabetes: false,
    isPregnant: false,
    hasInfection: false,
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setIsAuthorized(authenticated);
    };
    checkAuth();
  }, []);

  const validate = () => {
    let newErrors = {};
    if (formData.age < 0 || formData.age > 120) newErrors.age = 'Invalid age';
    if (formData.heartRate < 20 || formData.heartRate > 250) newErrors.heartRate = 'Invalid HR';
    if (formData.oxygenLevel < 50 || formData.oxygenLevel > 100) newErrors.oxygenLevel = 'Invalid SpO2';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    if (!validate()) return;

    setLoading(true);
    let result;
    const isDemo = await CONFIG.isDemoMode();

    if (isDemo) {
      // Simulated cloud calculation delay
      await new Promise(resolve => setTimeout(resolve, 600));
      result = calculateRiskEnhanced(
        formData.age, 
        formData.fever, 
        formData.breathingDifficulty, 
        formData.chronicDisease, 
        formData.heartRate, 
        formData.oxygenLevel,
        formData.hasDiabetes,
        formData.isPregnant,
        formData.hasInfection,
        formData.additionalNotes,
        0.15
      );
    } else if (isOnline) {
      try {
        const response = await fetch(`${BASE_URL}/patients/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            diabetes: formData.hasDiabetes,
            pregnancy: formData.isPregnant,
            infection: formData.hasInfection
          }),
        });
        const evalResult = await response.json();
        if (evalResult.success) {
          result = evalResult.data;
        } else {
          throw new Error('Backend evaluation failed');
        }
      } catch (error) {
        console.warn('Backend evaluation failed, falling back to local:', error.message);
        result = calculateRiskEnhanced(
          formData.age, 
          formData.fever, 
          formData.breathingDifficulty, 
          formData.chronicDisease, 
          formData.heartRate, 
          formData.oxygenLevel,
          formData.hasDiabetes,
          formData.isPregnant,
          formData.hasInfection,
          formData.additionalNotes,
          0.15
        );
      }
    } else {
      result = calculateRisk(
        formData.age, 
        formData.fever, 
        formData.breathingDifficulty, 
        formData.chronicDisease, 
        formData.heartRate, 
        formData.oxygenLevel,
        0.15
      );
    }

    setLoading(false);
    navigation.navigate('Result', { 
      ...result,
      ...formData,
      isOnline: !isDemo && isOnline,
      isDemo
    });
  };

  const getValueColor = (key, value) => {
    if (key === 'oxygenLevel') {
      if (value < 90) return colors.riskHigh;
      if (value < 95) return colors.riskMedium;
      return colors.healthcareGreen;
    }
    if (key === 'heartRate') {
      if (value < 50 || value > 120) return colors.riskHigh;
      if (value > 100) return colors.riskMedium;
      return colors.healthcareGreen;
    }
    return colors.primaryBlue;
  };

  const renderSliderInput = (label, key, min, max, unit) => {
    const value = formData[key];
    const valueColor = getValueColor(key, value);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{label}</Text>
          <View style={[styles.badge, { backgroundColor: valueColor + '15' }]}>
            <Text style={[styles.badgeText, { color: valueColor }]}>
              {value} <Text style={styles.unitText}>{unit}</Text>
            </Text>
          </View>
        </View>
        
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={1}
          value={value}
          onValueChange={(val) => setFormData(prev => ({ ...prev, [key]: Math.round(val) }))}
          minimumTrackTintColor={valueColor}
          maximumTrackTintColor="#E2E8F0"
          thumbTintColor={valueColor}
        />
        
        <View style={styles.sliderRange}>
          <Text style={styles.rangeText}>{min}{unit}</Text>
          <Text style={styles.rangeText}>{max}{unit}</Text>
        </View>
        {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
      </View>
    );
  };

  const renderToggle = (label, key, description, icon) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => setFormData(prev => ({ ...prev, [key]: !prev[key] }))}
      style={[
        styles.toggleCard, 
        formData[key] && styles.toggleCardActive
      ]}
    >
      <View style={styles.toggleContent}>
        <View style={styles.toggleTextContent}>
          <Text style={[styles.toggleLabel, formData[key] && styles.toggleLabelActive]}>{label}</Text>
          {description && <Text style={styles.toggleDesc}>{description}</Text>}
        </View>
        <Switch
          value={formData[key]}
          onValueChange={(val) => setFormData(prev => ({ ...prev, [key]: val }))}
          trackColor={{ false: '#CBD5E1', true: colors.healthcareGreen }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#CBD5E1"
          style={{ transform: [{ scale: 1.1 }] }}
        />
      </View>
    </TouchableOpacity>
  );

  const speakInstructions = () => {
    Speech.speak("Please enter accurate biometrics for precise risk analysis. Use the sliders for Age, Heart Rate, and Oxygen Saturation. Toggle the switches for any clinical indicators present.");
  };

  if (!isAuthorized) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.headerTag}>VITAL SIGNS ASSESSMENT</Text>
              <TouchableOpacity onPress={speakInstructions} style={{padding: 6, backgroundColor: colors.primaryBlue + '15', borderRadius: 8}}>
                <Text style={{fontSize: 12, fontWeight: 'bold', color: colors.primaryBlue}}>🔊 Speak</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>Clinical Data</Text>
            <Text style={styles.subtitle}>Enter accurate biometrics for precise risk analysis</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Biometric Variables</Text>
            {renderSliderInput('Patient Age', 'age', 0, 100, 'yr')}
            {renderSliderInput('Heart Rate', 'heartRate', 40, 200, 'bpm')}
            {renderSliderInput('Oxygen Saturation (SpO2)', 'oxygenLevel', 70, 100, '%')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Clinical Indicators</Text>
            <View style={styles.grid}>
              {renderToggle('Fever', 'fever', 'Temp > 38°C')}
              {renderToggle('Difficulty Breathing', 'breathingDifficulty', 'Respiratory distress')}
              {renderToggle('Chronic Disease', 'chronicDisease', 'Pre-existing conditions')}
              {renderToggle('Diabetes', 'hasDiabetes', 'Endocrine history')}
              {renderToggle('Pregnancy', 'isPregnant', 'Maternal status')}
              {renderToggle('Infection Signs', 'hasInfection', 'Active symptoms')}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Clinical Notes</Text>
            <View style={styles.notesContainer}>
              <TextInput
                style={styles.notesInput}
                multiline
                numberOfLines={4}
                placeholder="Observed clinical signs, medications, or relevant patient history..."
                placeholderTextColor={colors.textSecondary + '70'}
                value={formData.additionalNotes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, additionalNotes: text }))}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <PrimaryButton
              title={loading ? "Analyzing Clinical Data..." : "Generate Risk Assessment"}
              onPress={handleComplete}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            />
            <Text style={styles.disclaimer}>
              Ensure all data gathered follows medical protocol before submission.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    marginTop: 10,
  },
  headerTag: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primaryBlue,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 18,
    fontWeight: '900',
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  grid: {
    gap: 12,
  },
  toggleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  toggleCardActive: {
    borderColor: colors.healthcareGreen + '30',
    backgroundColor: colors.healthcareGreen + '05',
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTextContent: {
    flex: 1,
    marginRight: 15,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toggleLabelActive: {
    color: colors.healthcareGreen,
  },
  toggleDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notesContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesInput: {
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: 10,
    alignItems: 'center',
  },
  submitButton: {
    height: 60,
    borderRadius: 18,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  }
});



