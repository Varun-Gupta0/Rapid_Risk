import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEMO_MODE_KEY = 'demo_mode_enabled';

export const CONFIG = {
  // Static defaults
  DEFAULT_DEMO_MODE: true,
  BASE_URL: Platform.OS === 'android' 
    ? "http://10.0.2.2:3000/api" 
    : "http://localhost:3000/api",
  
  // Method to check demo mode (Async)
  isDemoMode: async () => {
    return true; // Forced DEMO MODE for FINAL DEMO LAUNCH
  },

  // Method to set demo mode
  setDemoMode: async (enabled) => {
    await AsyncStorage.setItem(DEMO_MODE_KEY, enabled ? 'true' : 'false');
  }
};
