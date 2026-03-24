import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Switch, Alert } from 'react-native';
import colors from '../theme/colors';
import { getPatientId, getUserName, getHealthWorkerId, logout, BASE_URL } from '../utils/auth';
import { CONFIG } from '../utils/config';

export default function HomeScreen({ navigation, isOnline, syncStatus, toggleOnlineMode, setSyncStatus, userRole }) {
  const [totalPatients, setTotalPatients] = useState(0);
  const [highRiskCases, setHighRiskCases] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [isDemo, setIsDemo] = useState(true);

  const loadDashboardData = async () => {
    const demoActive = await CONFIG.isDemoMode();
    setIsDemo(demoActive);

    try {
      setLoading(true);
      setError(null);

      const name = await getUserName();
      const id = await getHealthWorkerId();
      setUserName(name || 'Guardian');
      setWorkerId(id || '');
      
      if (demoActive) {
        // Simulated data for demo
        setTimeout(() => {
          setTotalPatients(124);
          setHighRiskCases(18);
          setLoading(false);
        }, 800);
        return;
      }

      const response = await fetch(`${BASE_URL}/dashboard`);
      const result = await response.json();
      
      if (result.success) {
        setTotalPatients(result.data.totalPatients);
        setHighRiskCases(result.data.highRiskPatients);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.warn("Dashboard API failed, auto-enabling demo fallback.");
      await CONFIG.setDemoMode(true);
      setIsDemo(true);
      setTotalPatients(124);
      setHighRiskCases(18);
    } finally {
      if (!demoActive) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const toggleDemoMode = async (value) => {
    await CONFIG.setDemoMode(value);
    setIsDemo(value);
    Alert.alert(
      value ? "Prototype Mode Activated" : "Live Mode Activated",
      value ? "The app will now use simulated data for safe demonstration." : "The app will now attempt to connect to the cloud backend."
    );
    loadDashboardData();
  };

  const handleLogout = async () => {
    await logout();
    // navigation is handled via state change in App.js
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>Hello, {userName.split(' ')[0]}</Text>
              <Text style={styles.subtitle}>Health Monitoring Dashboard</Text>
            </View>
            <View style={styles.modeIndicator}>
               <Text style={[styles.modeText, { color: isDemo ? colors.alertOrange : colors.healthcareGreen }]}>
                 {isDemo ? 'Demo Mode ⚡ (Offline Ready)' : 'Live Mode ☁️'}
               </Text>
            </View>
          </View>
          {workerId ? (
            <View style={styles.workerBadge}>
              <Text style={styles.workerBadgeText}>Worker ID: {workerId}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.demoToggleCard}>
          <View>
            <Text style={styles.demoToggleTitle}>Simulation Environment</Text>
            <Text style={styles.demoToggleSubtitle}>Enable for offline presentation</Text>
          </View>
          <Switch 
            value={isDemo}
            onValueChange={toggleDemoMode}
            trackColor={{ false: '#CBD5E1', true: colors.alertOrange }}
            thumbColor="white"
          />
        </View>

        <View style={styles.statsContainer}>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primaryBlue} />
              <Text style={styles.loadingText}>Initializing {isDemo ? 'Simulation' : 'Cloud Sync'}...</Text>
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Patients</Text>
                <Text style={styles.statValue}>{totalPatients}</Text>
              </View>

              <View style={[styles.statCard, { borderLeftColor: colors.accentRed, borderLeftWidth: 4 }]}>
                <Text style={styles.statLabel}>High Risk</Text>
                <Text style={[styles.statValue, { color: colors.accentRed }]}>{highRiskCases}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Assessment')}
          >
            <Text style={styles.actionButtonText}>Start New Assessment 🩺</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.surfaceWhite, borderWidth: 1, borderColor: colors.primaryBlue }]}
            onPress={() => navigation.navigate('Records')}
          >
            <Text style={[styles.actionButtonText, { color: colors.primaryBlue }]}>View Patient Records 📋</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.syncCard}>
          <Text style={styles.syncLabel}>Cloud Connectivity</Text>
          <View style={styles.syncStatusRow}>
            <View style={[styles.statusDot, { backgroundColor: syncStatus === 'pending' ? colors.alertOrange : colors.healthcareGreen }]} />
            <Text style={styles.syncStatusText}>
              {syncStatus === 'pending' ? 'Pending Sync' : 'Fully Synchronized'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout from Session</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modeIndicator: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  workerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2F7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  workerBadgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  demoToggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.alertOrange + '30',
    backgroundColor: colors.alertOrange + '05',
  },
  demoToggleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  demoToggleSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    minHeight: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statCard: {
    backgroundColor: colors.surfaceWhite,
    width: '48%',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primaryBlue,
  },
  errorText: {
    color: colors.accentRed,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: colors.primaryBlue,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  syncCard: {
    backgroundColor: '#EEF2F7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  syncLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  syncStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  syncStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  logoutBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutText: {
    color: colors.accentRed,
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
