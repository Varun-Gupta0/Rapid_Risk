import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

export default function RecordDetailScreen({ route, navigation }) {
  const { record } = route.params || {};
  const { 
    riskLevel = 'UNKNOWN', 
    riskScore = 0, 
    timestamp, 
    syncStatus, 
    additionalNotes = '',
    age, heartRate, oxygenLevel,
    fever, breathingDifficulty, chronicDisease, hasDiabetes, isPregnant, hasInfection
  } = record || {};

  const vitals = {
    age,
    heartRate,
    oxygenLevel
  };

  const symptoms = {
    fever,
    breathingDifficulty,
    chronicDisease,
    hasDiabetes,
    isPregnant,
    hasInfection
  };

  const notes = additionalNotes;

  const riskColor = riskLevel === 'HIGH' ? colors.riskHigh : (riskLevel === 'MEDIUM' ? colors.riskMedium : colors.riskLow);

  const renderSection = (title, data) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.gridItem}>
            <Text style={styles.itemLabel}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</Text>
            <Text style={styles.itemValue}>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assessment Details</Text>
        </View>

        <View style={[styles.mainBadge, { borderColor: riskColor }]}>
          <Text style={[styles.badgeLabel, { color: riskColor }]}>{riskLevel} RISK</Text>
          <Text style={[styles.badgeScore, { color: riskColor }]}>{riskScore}</Text>
          <Text style={styles.badgeSub}>Score / 100</Text>
        </View>

        {renderSection('Vital Signs', vitals)}
        {renderSection('Clinical Indicators', symptoms)}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinician Notes</Text>
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>{notes || 'No notes provided during assessment.'}</Text>
          </View>
        </View>

        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>Assessment Time: {new Date(timestamp).toLocaleString()}</Text>
          <Text style={styles.metaText}>Status: {syncStatus === 'synced' ? 'Cloud Backed Up ✅' : 'Local Only 📍'}</Text>
        </View>

        <View style={styles.actionSection}>
           <PrimaryButton 
              title="Return to Home" 
              variant="outline" 
              onPress={() => navigation.popToTop()} 
            />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  mainBadge: {
    padding: 32,
    borderRadius: 32,
    backgroundColor: 'white',
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  badgeLabel: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  badgeScore: {
    fontSize: 64,
    fontWeight: '900',
    marginTop: 8,
  },
  badgeSub: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  notesBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notesText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  metaInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  actionSection: {
    marginTop: 40,
    paddingBottom: 40,
  }
});
