import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { IntlProvider } from 'react-intl';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { messages } from '../languages';
import { Home, HomeProps } from '../screens';
import { RootStore } from '../stores';

const Stack = createNativeStackNavigator();

const stores = new RootStore();

export function App() {
  const home: HomeProps = {
    appsStore: stores.appsStore,
    onAppPress() {
      console.warn('onAppPress');
    },
    onAppStorePress() {
      console.warn('onAppStorePress');
    },
  };

  return (
    <IntlProvider
      locale="en"
      messages={messages['en']}
      formats={{
        date: {
          en: {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            hour12: false,
            minute: '2-digit',
            timeZoneName: 'short',
          },
        },
      }}
    >
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="home">
            <Stack.Screen name="home">
              {(props) => <Home {...home} {...props} />}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </IntlProvider>
  );
}
