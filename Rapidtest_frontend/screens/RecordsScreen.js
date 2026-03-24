import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPatientId, getUnsyncedRecords, clearUnsyncedRecords, syncRecordsWithBackend } from '../utils/auth';
import PrimaryButton from '../components/PrimaryButton';

const STORAGE_KEY = 'patientRecords';

export default function RecordsScreen({ navigation, userRole, setGlobalSyncStatus }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(''); // Fetching, Syncing, Finalizing
  const [retryCount, setRetryCount] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const patientId = await getPatientId();
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      let allRecords = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      // Filter by role if needed (simplified for demo)
      const filtered = userRole === 'Supervisor' ? allRecords : allRecords.filter(r => r.patientId === patientId);
      
      // Sort: Newest first
      filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setRecords(filtered);
      
      const unsynced = await getUnsyncedRecords();
      setUnsyncedCount(unsynced.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userRole]);

  const handleSync = async () => {
    if (unsyncedCount === 0) return;
    
    setIsSyncing(true);
    setSyncProgress('Preparing records...');
    setRetryCount(0);

    const performSync = async (retries = 3) => {
      try {
        const unsynced = await getUnsyncedRecords();
        if (unsynced.length === 0) return;

        setSyncProgress(`Syncing ${unsynced.length} records...`);

        const result = await syncRecordsWithBackend(unsynced);

        if (result.success) {
          setSyncProgress('Finalizing sync...');
          await clearUnsyncedRecords();
          
          // Update local STORAGE_KEY records to mark as synced if needed
          const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
          let allRecords = jsonValue != null ? JSON.parse(jsonValue) : [];
          const updatedRecords = allRecords.map(r => ({ ...r, syncStatus: 'synced' }));
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));

          setIsSyncing(false);
          setUnsyncedCount(0);
          setGlobalSyncStatus('synced');
          Alert.alert("Sync Successful", result.message || `${result.synced} records synchronized with Raksha Cloud.`);
          loadData();
        } else {
          throw new Error('Server returned failure');
        }
      } catch (error) {
        console.error('Sync error:', error);
        if (retries > 0) {
          setRetryCount(3 - retries + 1);
          setSyncProgress(`Retrying sync (${3 - retries + 1}/3)...`);
          setTimeout(() => performSync(retries - 1), 2000);
        } else {
          setIsSyncing(false);
          setSyncProgress('');
          Alert.alert("Sync Failed", "Could not reach the cloud server. Please check your connection and try again.");
        }
      }
    };

    performSync();
  };

  const renderRecord = ({ item }) => {
    const date = new Date(item.timestamp);
    const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    const riskColor = item.riskLevel === 'HIGH' ? colors.riskHigh : (item.riskLevel === 'MEDIUM' ? colors.riskMedium : colors.riskLow);

    return (
      <TouchableOpacity 
        style={styles.recordCard} 
        onPress={() => navigation.navigate('RecordDetail', { record: item })}
      >
        <View style={styles.recordHeader}>
          <View>
            <Text style={styles.recordDate}>{dateStr}</Text>
            <Text style={styles.recordTime}>{timeStr}</Text>
          </View>
          <View style={[styles.scoreBadge, { backgroundColor: riskColor + '15' }]}>
            <Text style={[styles.scoreValue, { color: riskColor }]}>{item.riskScore}</Text>
          </View>
        </View>
        
        <View style={styles.recordMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Level</Text>
            <Text style={[styles.metaValue, { color: riskColor }]}>{item.riskLevel}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>Verified</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Clinical History</Text>
          <Text style={styles.subtitle}>Log of all system-verified assessments</Text>
        </View>

        {unsyncedCount > 0 && (
          <View style={styles.syncBanner}>
            <View style={styles.syncInfo}>
              <Text style={styles.syncTitle}>{unsyncedCount} Unsynced Records</Text>
              <Text style={styles.syncSub}>Awaiting cloud backup</Text>
            </View>
            <TouchableOpacity 
              style={styles.syncAction} 
              onPress={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={[styles.syncActionText, { marginLeft: 8 }]}>{syncProgress}</Text>
                </View>
              ) : (
                <Text style={styles.syncActionText}>Sync Now</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primaryBlue} />
          </View>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => item.timestamp + item.patientId}
            renderItem={renderRecord}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>📋</Text>
                <Text style={styles.emptyText}>No assessment history found.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundWhite,
  },
  container: {
    flex: 1,
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
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBlue,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  syncSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  syncAction: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncActionText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  list: {
    paddingBottom: 40,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recordTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  recordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  }
});
