import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './navigation/StackNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SystemDashboard from './components/SystemDashboard';
import { isAuthenticated, getUserRole } from './utils/auth';
import LoginScreen from './screens/LoginScreen';
import { Alert } from 'react-native';
import * as Speech from 'expo-speech';

export default function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' or 'pending'
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const authenticated = await isAuthenticated();
      setIsAuthenticatedUser(authenticated);
      if (authenticated) {
        const role = await getUserRole();
        setUserRole(role);
      }
    };

    checkAuthentication();

    // Display disclaimer on app load
    const disclaimer = "This application is for informational purposes only and should not be considered a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns or before making any decisions related to your health or treatment.";
    Alert.alert(
      "Disclaimer",
      disclaimer
    );

  }, []);

  const handleLogout = async () => {
    const { logout } = require('./utils/auth');
    await logout();
    setIsAuthenticatedUser(false);
    setUserRole(null);
  };

  const handleLogin = async (role) => {
    setIsAuthenticatedUser(true);
    setUserRole(role);
  };

  if (!isAuthenticatedUser) {
    return (
      <NavigationContainer>
        <LoginScreen onLogin={(role) => { setIsAuthenticatedUser(true); setUserRole(role) }} />
        <StatusBar style="dark" />
      </NavigationContainer>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <SystemDashboard mode={isOnline} syncStatus={syncStatus} />
        <StackNavigator 
          isOnline={isOnline} 
          syncStatus={syncStatus} 
          toggleOnlineMode={toggleOnlineMode} 
          setSyncStatus={setSyncStatus} 
          userRole={userRole}
          onLogout={handleLogout}
        />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

