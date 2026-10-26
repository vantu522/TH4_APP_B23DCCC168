import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { SyncProvider } from './src/context/SyncContext';
import { AppDataProvider } from './src/context/AppDataContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <SyncProvider>
        <AppDataProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AppDataProvider>
      </SyncProvider>
    </SafeAreaProvider>
  );
};

export default App;
