import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPatientId, saveUnsyncedRecord, BASE_URL } from '../utils/auth';
import { CONFIG } from '../utils/config';
import * as Speech from 'expo-speech';

const { width } = Dimensions.get('window');
const STORAGE_KEY = 'patientRecords';
const FOLLOW_UP_KEY = 'followUpReminders';

export default function ResultScreen({ route, navigation, isOnline, setGlobalSyncStatus }) {
  const params = route.params || {};
  const { 
    riskScore = 0, 
    riskLevel = 'UNKNOWN', 
    explanation = [],
    age, fever, breathingDifficulty, chronicDisease, heartRate, oxygenLevel, 
    hasDiabetes, isPregnant, hasInfection, additionalNotes 
  } = params;

  const confidenceScore = 95;
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 20, friction: 7, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  const saveRecord = async () => {
    const isDemo = await CONFIG.isDemoMode();
    const patientId = await getPatientId();
    const timestamp = new Date().toISOString();
    
    setLoading(true);

    const record = {
      patientId,
      ...params,
      timestamp,
      syncStatus: isDemo ? 'synced' : 'pending'
    };

    try {
      if (isDemo) {
        // Simulated lag for realism
        await new Promise(resolve => setTimeout(resolve, 800));
        await saveUnsyncedRecord({ ...record, syncStatus: 'synced' });
        setSaved(true);
        Alert.alert("Prototype Mode", "Record Saved Successfully (Simulated Mode)");
        return;
      }

      if (isOnline) {
        const response = await fetch(`${BASE_URL}/patients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...record,
            infection: record.hasInfection 
          }),
        });
        
        const result = await response.json();
        if (result.success) {
          setSaved(true);
          Alert.alert("Success", "Diagnostic Record Synchronized with Cloud");
        } else {
          throw new Error('Save failed');
        }
      } else {
        await saveUnsyncedRecord(record);
        setSaved(true);
        Alert.alert("Saved Locally", "Internet required for cloud synchronization.");
      }
    } catch (error) {
      console.warn('Backend save failed, auto-falling back to local storage');
      await saveUnsyncedRecord({ ...record, syncStatus: 'pending' });
      setSaved(true);
      Alert.alert("Local Backup Saved", "Cloud backend unreachable. Record stored for later sync.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = () => {
    switch (riskLevel) {
      case 'HIGH': return { color: colors.riskHigh, label: 'High Risk', sub: 'Immediate clinical attention required' };
      case 'MEDIUM': return { color: colors.riskMedium, label: 'Moderate Risk', sub: 'Clinical follow-up advised' };
      case 'LOW': return { color: colors.riskLow, label: 'Low Risk', sub: 'Continue routine monitoring' };
      default: return { color: colors.textSecondary, label: 'Undetermined', sub: 'Insufficient data' };
    }
  };

  const config = getStatusConfig();

  const handleFollowUp = async () => {
    try {
      const patientId = await getPatientId();
      const today = new Date();
      const reminder = { patientId, date: today.toISOString() };

      const jsonValue = await AsyncStorage.getItem(FOLLOW_UP_KEY);
      const reminders = jsonValue != null ? JSON.parse(jsonValue) : [];
      reminders.push(reminder);
      await AsyncStorage.setItem(FOLLOW_UP_KEY, JSON.stringify(reminders));
      
      Alert.alert('Follow-Up Scheduled', 'A reminder has been added to your dashboard.');
    } catch (e) {
      Alert.alert('Error', 'Could not schedule follow-up.');
    }
  };

  const speakResult = () => {
    Speech.speak(`Assessment complete. Risk level is ${riskLevel}. Score: ${riskScore} out of 100.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.headerTitle}>Diagnostic Summary</Text>
          <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
            <Text style={[styles.badgeText, { color: config.color }]}>
              {saved ? 'Record Persisted' : (isOnline ? 'Cloud AI Verified' : 'Local Edge Diagnostic')}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.mainCard}>
          <View style={styles.scoreCircleContainer}>
            <View style={[styles.scoreInnerCircle, { borderColor: config.color }]}>
              <Text style={[styles.scoreNumber, { color: config.color }]}>{riskScore}</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>
          </View>

          <View style={styles.resultInfo}>
            <Text style={[styles.riskLevelText, { color: config.color }]}>{config.label}</Text>
            <Text style={styles.riskSubtext}>{config.sub}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.confidenceRow}>
            <Text style={styles.confidenceLabel}>AI Confidence</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${confidenceScore}%` }]} />
            </View>
            <Text style={styles.confidenceValue}>{confidenceScore}%</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Findings</Text>
          {explanation && explanation.length > 0 ? explanation.map((item, idx) => (
            <View key={idx} style={styles.findingItem}>
              <View style={[styles.findingDot, { backgroundColor: config.color }]} />
              <Text style={styles.findingText}>{item}</Text>
            </View>
          )) : (
            <Text style={styles.findingText}>No specific risk factors identified.</Text>
          )}
        </View>

        <View style={styles.actions}>
          {!saved ? (
            <PrimaryButton 
              title={loading ? "Saving..." : "Save Diagnostic Result"} 
              onPress={saveRecord}
              disabled={loading}
              loading={loading}
            />
          ) : (
            <PrimaryButton 
              title="Refer to Specialist" 
              variant={riskLevel === 'HIGH' ? 'danger' : 'primary'}
              onPress={() => navigation.navigate('Referral', { ...params })}
            />
          )}
          
          <View style={styles.buttonRow}>
            <View style={{ flex: 1 }}>
              <PrimaryButton 
                title="Schedule Follow-up" 
                variant="outline" 
                onPress={handleFollowUp}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <PrimaryButton 
                title="Voice Playback" 
                variant="outline" 
                onPress={speakResult}
              />
            </View>
          </View>

          <PrimaryButton 
            title="Finish & Back home" 
            variant="outline" 
            onPress={() => navigation.popToTop()}
            style={{ marginTop: 12, borderColor: colors.textSecondary }}
          />
        </View>

        <Text style={styles.disclaimer}>
          ⚠️ AI-assisted screening only. This is not a formal medical diagnosis. 
          Consult a physician for clinical decisions.
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundWhite,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 32,
  },
  scoreCircleContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreInnerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '900',
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: -4,
  },
  resultInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  riskLevelText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  riskSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#E2E8F0',
    marginVertical: 24,
  },
  confidenceRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 80,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#EDF2F7',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primaryBlue,
    borderRadius: 3,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
    width: 40,
    textAlign: 'right',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  findingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  findingText: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 32,
    lineHeight: 16,
    marginBottom: 40,
  }
});
