import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import TicketsListScreen from '../screens/TicketsListScreen';
import TicketDetailsScreen from '../screens/TicketDetailsScreen';
import TicketCreateScreen from '../screens/TicketCreateScreen';
import TicketEditScreen from '../screens/TicketEditScreen';
import TicketStatusScreen from '../screens/TicketStatusScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingState from '../components/LoadingState';
import { colors } from '../styles/colors';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { token, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return <LoadingState message="Carregando sessão" />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.canvas },
        headerTitleStyle: { fontWeight: '700' },
        headerTintColor: colors.ink
      }}
    >
      {token ? (
        <>
          <Stack.Screen
            name="Tickets"
            component={TicketsListScreen}
            options={{ title: 'Tickets' }}
          />
          <Stack.Screen
            name="TicketDetails"
            component={TicketDetailsScreen}
            options={{ title: 'Detalhes' }}
          />
          <Stack.Screen
            name="TicketCreate"
            component={TicketCreateScreen}
            options={{ title: '' }}
          />
          <Stack.Screen
            name="TicketEdit"
            component={TicketEditScreen}
            options={{ title: 'Editar Ticket' }}
          />
          {isAdmin ? (
            <Stack.Screen
              name="TicketStatus"
              component={TicketStatusScreen}
              options={{ title: 'Alterar Status' }}
            />
          ) : null}
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: 'Perfil' }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
