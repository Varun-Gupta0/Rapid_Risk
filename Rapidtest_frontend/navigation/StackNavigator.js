import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AssessmentScreen from '../screens/AssessmentScreen';
import ResultScreen from '../screens/ResultScreen';
import ReferralScreen from '../screens/ReferralScreen';
import RecordsScreen from '../screens/RecordsScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import RecordDetailScreen from '../screens/RecordDetailScreen';
import ReferralSlipScreen from '../screens/ReferralSlipScreen';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function StackNavigator({ isOnline, syncStatus, toggleOnlineMode, setSyncStatus, userRole, onLogout }) {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundWhite, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
        headerTintColor: colors.primaryBlue,
        headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Home" options={{ title: 'RAKSHA AI', headerTitleAlign: 'center' }}>
        {props => (
          <HomeScreen 
            {...props} 
            isOnline={isOnline} 
            syncStatus={syncStatus} 
            toggleOnlineMode={toggleOnlineMode} 
            setSyncStatus={setSyncStatus} 
            userRole={userRole}
            onLogout={onLogout}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Assessment" component={AssessmentScreen} options={{ title: 'Clinical Assessment' }} />
      <Stack.Screen name="Result" options={{ title: 'Assessment Result' }}>
        {props => <ResultScreen {...props} isOnline={isOnline} setGlobalSyncStatus={setSyncStatus} />}
      </Stack.Screen>
      <Stack.Screen name="Referral" component={ReferralScreen} options={{ title: 'Referral Protocol' }} />
      <Stack.Screen name="ReferralSlip" component={ReferralSlipScreen} options={{ title: 'Referral Slip' }} />
      <Stack.Screen name="Records" options={{ title: 'Assessment History' }}>
        {props => <RecordsScreen {...props} userRole={userRole} setGlobalSyncStatus={setSyncStatus} />}
      </Stack.Screen>
      <Stack.Screen name="RecordDetail" component={RecordDetailScreen} options={{ title: 'Historical Record' }} />
      <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} options={{ title: 'Questionnaire' }} />
    </Stack.Navigator>
  );
}
