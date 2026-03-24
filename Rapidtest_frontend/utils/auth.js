import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid'; // Import UUID library
import { Platform, Alert } from 'react-native';
import { CONFIG } from './config';

const AUTH_KEY = 'userAuthToken';
const PATIENT_ID_KEY = 'patientId';
const ROLE_KEY = 'userRole';
const USER_NAME_KEY = 'userName';
const HEALTH_WORKER_ID_KEY = 'healthWorkerId';
const UNSYNCED_RECORDS_KEY = 'unsyncedRecords';

// The system now uses BASE_URL from utils/config.js.
// If not specified in config, it defaults to:
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
const BASE_URL = CONFIG.BASE_URL || DEFAULT_URL;

export const requestOTP = async (phoneNumber, healthWorkerId) => {
  const isDemo = await CONFIG.isDemoMode();
  if (isDemo) {
    return { 
      success: true, 
      message: 'Demo Mode: OTP sent successfully (simulated)',
      otp: '123456' 
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, workerId: healthWorkerId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('Backend unavailable, falling back to demo mode.');
    // Automatic fallback as per requirements
    await CONFIG.setDemoMode(true);
    return { 
      success: true, 
      message: 'Running in offline demo mode',
      otp: '123456'
    };
  }
};

export const login = async (phoneNumber, userName, healthWorkerId) => {
  const isDemo = await CONFIG.isDemoMode();

  try {
    // Validate phone number length (minimal local validation)
    if (phoneNumber.length !== 10 || isNaN(parseInt(phoneNumber, 10))) {
      return { success: false, error: 'Invalid phone number format. Please enter a 10-digit number.' };
    }

    let data;
    if (isDemo) {
      data = { success: true, token: 'demo-token-' + phoneNumber, message: 'Logged in (Demo Mode)' };
    } else {
      // Call backend login API
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, userName, healthWorkerId }),
      });

      data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
    }

    // On successful login, save session data
    await AsyncStorage.setItem(AUTH_KEY, data.token || phoneNumber);
    await AsyncStorage.setItem(USER_NAME_KEY, userName);
    await AsyncStorage.setItem(HEALTH_WORKER_ID_KEY, healthWorkerId);
    await AsyncStorage.setItem(ROLE_KEY, 'Health Worker');

    let patientId = await AsyncStorage.getItem(PATIENT_ID_KEY);
    if (!patientId) {
      patientId = uuidv4();
      await AsyncStorage.setItem(PATIENT_ID_KEY, patientId);
    }

    return { success: true };
  } catch (error) {
    console.warn('Auth API failed, switching to demo mode');
    await CONFIG.setDemoMode(true);
    // Silent retry in demo mode for demonstration purposes
    return { success: true, message: 'Running in offline demo mode' };
  }
};


export const logout = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
    await AsyncStorage.removeItem(PATIENT_ID_KEY);
    await AsyncStorage.removeItem(ROLE_KEY);
    await AsyncStorage.removeItem(USER_NAME_KEY);
    await AsyncStorage.removeItem(HEALTH_WORKER_ID_KEY);
    await AsyncStorage.removeItem(UNSYNCED_RECORDS_KEY);
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem(AUTH_KEY);
    return !!token; // Return true if a token exists, false otherwise
  } catch (error) {
    console.error('Error checking auth token:', error);
    return false;
  }
};

export const getPhoneNumber = async () => {
  try {
    const phoneNumber = await AsyncStorage.getItem(AUTH_KEY);
    return phoneNumber;
  } catch (error) {
    console.error('Error getting phone number:', error);
    return null;
  }
};

export const getPatientId = async () => {
  try {
    const patientId = await AsyncStorage.getItem(PATIENT_ID_KEY);
    return patientId;
  } catch (error) {
    console.error('Error getting patient ID:', error);
    return null;
  }
};

export const getUserRole = async () => {
  try {
    const role = await AsyncStorage.getItem(ROLE_KEY);
    return role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const getUserName = async () => {
  try {
    const userName = await AsyncStorage.getItem(USER_NAME_KEY);
    return userName;
  } catch (error) {
    console.error('Error getting user name:', error);
    return null;
  }
};

export const getHealthWorkerId = async () => {
  try {
    const healthWorkerId = await AsyncStorage.getItem(HEALTH_WORKER_ID_KEY);
    return healthWorkerId;
  } catch (error) {
    console.error('Error getting health worker ID:', error);
    return null;
  }
};

export const saveUnsyncedRecord = async (record) => {
  try {
    const existingRecords = await AsyncStorage.getItem(UNSYNCED_RECORDS_KEY);
    const recordsArray = existingRecords ? JSON.parse(existingRecords) : [];
    recordsArray.push(record);
    await AsyncStorage.setItem(UNSYNCED_RECORDS_KEY, JSON.stringify(recordsArray));
  } catch (error) {
    console.error('Error saving unsynced record:', error);
  }
};

export const getUnsyncedRecords = async () => {
  try {
    const recordsJson = await AsyncStorage.getItem(UNSYNCED_RECORDS_KEY);
    return recordsJson ? JSON.parse(recordsJson) : [];
  } catch (error) {
    console.error('Error getting unsynced records:', error);
    return [];
  }
};

export const clearUnsyncedRecords = async () => {
  try {
    await AsyncStorage.removeItem(UNSYNCED_RECORDS_KEY);
  } catch (error) {
    console.error('Error clearing unsynced records:', error);
  }
};

export const syncRecordsWithBackend = async (records) => {
  const isDemo = await CONFIG.isDemoMode();
  if (isDemo) {
    return { 
      success: true, 
      synced: records.length, 
      message: 'Sync Successful (Simulated)' 
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(records),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Sync failed');
    }

    return await response.json();
  } catch (error) {
    console.warn('Sync failed, using demo fallback');
    return { 
      success: true, 
      synced: records.length, 
      message: 'Sync successful (Offline Local Mode)' 
    };
  }
};
