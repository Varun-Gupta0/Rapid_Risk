import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import colors from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FOLLOW_UP_KEY = 'followUpReminders';

export default function SystemDashboard({ mode, syncStatus }) {
  const [followUpReminders, setFollowUpReminders] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const animation = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const loadFollowUpReminders = async () => {
      try {
        const remindersJson = await AsyncStorage.getItem(FOLLOW_UP_KEY);
        const reminders = remindersJson != null ? JSON.parse(remindersJson) : [];
        setFollowUpReminders(reminders);
      } catch (error) {
        console.error('Error loading follow-up reminders:', error);
      }
    };

    loadFollowUpReminders();
    // Refresh every 30 seconds for demo
    const interval = setInterval(loadFollowUpReminders, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const headerHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 200],
  });

  return (
    <Animated.View style={[styles.container, { height: headerHeight }]}>
      <TouchableOpacity onPress={toggleExpand} style={styles.topRow} activeOpacity={0.7}>
        <View style={styles.statusGroup}>
          <View style={[styles.dot, { backgroundColor: mode ? colors.healthcareGreen : colors.alertOrange }]} />
          <Text style={styles.modeText}>{mode ? 'ONLINE' : 'OFFLINE'}</Text>
        </View>
        
        <Text style={styles.brandText}>RAKSHA AI</Text>

        <View style={styles.statusGroup}>
          <Text style={styles.syncText}>{syncStatus === 'pending' ? '⋯' : '✓'}</Text>
          <View style={[styles.dot, { backgroundColor: syncStatus === 'pending' ? colors.alertOrange : colors.healthcareGreen }]} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Upcoming Follow-ups</Text>
          {followUpReminders.length > 0 ? (
            followUpReminders.slice(0, 3).map((reminder, index) => (
              <View key={index} style={styles.reminderItem}>
                <Text style={styles.reminderPatient}>Patient ID: {reminder.patientId.substring(0, 8)}...</Text>
                <Text style={styles.reminderDate}>{new Date(reminder.date).toLocaleDateString()}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No pending reminders</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#102A43', // Dark deep blue
    borderRadius: 16,
    margin: 12,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modeText: {
    color: '#BCCCDC',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  brandText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  syncText: {
    color: '#BCCCDC',
    fontSize: 12,
    fontWeight: '700',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#9FB3C8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 8,
    borderRadius: 8,
  },
  reminderPatient: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  reminderDate: {
    color: '#627D98',
    fontSize: 12,
  },
  emptyText: {
    color: '#627D98',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  }
});
