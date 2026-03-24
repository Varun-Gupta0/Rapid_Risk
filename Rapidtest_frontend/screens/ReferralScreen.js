import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Linking, ScrollView, TouchableOpacity, Switch } from 'react-native';
import colors from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';
import { getUserName, getPhoneNumber, getPatientId } from '../utils/auth';

const hospitalsData = [
  { id: 1, name: 'AIIMS New Delhi', distance: '1.2 km', type: 'Tertiary Care', urgency: 'Immediate', isGovt: true },
  { id: 2, name: 'Metro ICU Center', distance: '2.5 km', type: 'Specialized ICU', urgency: 'Immediate', isGovt: false },
  { id: 3, name: 'SJH Government Hospital', distance: '3.1 km', type: 'General Medicine', urgency: 'Routine', isGovt: true },
  { id: 4, name: 'Central Trauma Center', distance: '4.8 km', type: 'Emergency Center', urgency: 'High', isGovt: false },
];

export default function ReferralScreen({ route, navigation }) {
  const { score, riskLevel, notes } = route.params || {};

  const [patientDetails, setPatientDetails] = useState({
    name: 'Patient Name',
    phoneNumber: '',
    patientId: '',
  });
  const [isEmergency, setIsEmergency] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const loadDetails = async () => {
      const name = await getUserName() || 'Registering Patient...';
      const phone = await getPhoneNumber() || 'No Phone';
      const id = await getPatientId() || 'ID-UNKNOWN';
      setPatientDetails({ name, phoneNumber: phone, patientId: id });
    };
    loadDetails();
  }, []);

  const filteredHospitals = useMemo(() => {
    let list = [...hospitalsData];
    
    // Filtering logic
    if (filter === 'Govt') list = list.filter(h => h.isGovt);
    if (filter === 'Private') list = list.filter(h => !h.isGovt);

    // Sorting logic: Prioritize Nearest Govt Hospitals if isEmergency is true
    if (isEmergency) {
      list.sort((a, b) => {
        if (a.isGovt && !b.isGovt) return -1;
        if (!a.isGovt && b.isGovt) return 1;
        return parseFloat(a.distance) - parseFloat(b.distance);
      });
    }

    return list;
  }, [filter, isEmergency]);

  const callAmbulance = () => {
    Linking.openURL('tel:108');
  };

  const openInMaps = (hospitalName) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hospitalName}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Referral Protocol</Text>
          <Text style={styles.subtitle}>Recommended facilities based on {riskLevel} status</Text>
        </View>

        <View style={styles.patientBanner}>
          <View>
            <Text style={styles.patientName}>{patientDetails.name}</Text>
            <Text style={styles.patientId}>Patient ID: {patientDetails.patientId.substring(0, 12)}</Text>
          </View>
          <View style={[styles.riskTag, { backgroundColor: riskLevel === 'HIGH' ? colors.riskHigh : colors.riskMedium }]}>
            <Text style={styles.riskTagText}>{riskLevel}</Text>
          </View>
        </View>

        <View style={styles.emergencyControl}>
          <View style={styles.emergencyTextSection}>
            <Text style={styles.emergencyLabel}>Emergency Protocol</Text>
            <Text style={styles.emergencyDesc}>Prioritize government facilities & enable ambulance services</Text>
          </View>
          <Switch
            value={isEmergency}
            onValueChange={setIsEmergency}
            trackColor={{ false: '#CBD5E1', true: colors.riskHigh }}
            thumbColor={'#fff'}
          />
        </View>

        {isEmergency && (
          <View style={styles.ambulanceSection}>
            <PrimaryButton 
              title="🚑 Call Emergency Ambulance (108)" 
              variant="danger" 
              onPress={callAmbulance} 
            />
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Nearest Hospitals</Text>
          <View style={styles.filterChips}>
            {['All', 'Govt', 'Private'].map(type => (
              <TouchableOpacity 
                key={type} 
                onPress={() => setFilter(type)}
                style={[styles.filterChip, filter === type && styles.activeChip]}
              >
                <Text style={[styles.filterChipText, filter === type && styles.activeChipText]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {filteredHospitals.map((hospital) => (
          <TouchableOpacity 
            key={hospital.id} 
            style={styles.hospitalCard}
            onPress={() => openInMaps(hospital.name)}
          >
            <View style={styles.hospitalInfo}>
              <View style={styles.hospitalTitleRow}>
                <Text style={styles.hospitalName}>{hospital.name}</Text>
                {hospital.isGovt && (
                   <View style={styles.govtBadge}><Text style={styles.govtBadgeText}>GOVT</Text></View>
                )}
              </View>
              <View style={styles.tagRow}>
                <View style={styles.tag}><Text style={styles.tagText}>{hospital.type}</Text></View>
                <View style={[styles.tag, { backgroundColor: '#F1F5F9' }]}><Text style={[styles.tagText, { color: colors.textSecondary }]}>{hospital.distance}</Text></View>
              </View>
            </View>
            <View style={styles.mapIconContainer}>
               <Text style={styles.mapEmoji}>🧭</Text>
               <Text style={styles.navLabel}>NAVIGATE</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.actionSection}>
          <PrimaryButton 
            title="Generate Referral Slip" 
            onPress={() => navigation.navigate('ReferralSlip', { patientDetails, riskScore: score, riskLevel, notes })} 
          />
          <View style={{ height: 12 }} />
          {!isEmergency && (
            <PrimaryButton 
              title="Broadcast Regional Alert" 
              variant="danger" 
              onPress={() => {}} 
            />
          )}
        </View>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  patientBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  patientName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  patientId: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  riskTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  riskTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  emergencyControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  emergencyTextSection: {
    flex: 1,
    marginRight: 10,
  },
  emergencyLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.riskHigh,
  },
  emergencyDesc: {
    fontSize: 11,
    color: '#991B1B',
    marginTop: 2,
  },
  ambulanceSection: {
    marginBottom: 24,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  activeChip: {
    backgroundColor: colors.primaryBlue,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  activeChipText: {
    color: 'white',
  },
  hospitalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  govtBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#86EFAC',
  },
  govtBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#166534',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryBlue,
  },
  mapIconContainer: {
    paddingHorizontal: 10,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  mapEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primaryBlue,
    letterSpacing: 0.5,
  },
  actionSection: {
    marginTop: 32,
    marginBottom: 40,
  }
});
