//imports
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/LoginScreen.js';
import SignupScreen from './screens/SignupScreen.js';

import MainTabScreen from './screens/MainTabScreen.js';


//create navigator
const Stack = createStackNavigator();

export default function App() {
  
  return (
    //Return navigator with login screen, sign up screen, and main app.
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        <Stack.Screen options={{headerShown: false}} name="Login" >
          {(props) => <LoginScreen {...props}/>}
        </Stack.Screen>

        <Stack.Screen name="Signup"
                options={{
                  title: 'Sign Up',
                  headerTitleStyle: {
                    fontSize: 30,
                    fontWeight: 'bold',
                    marginTop: 20,
                    marginBottom: 20,
                    color: 'white',
                  },

                  headerShown: true,
                  headerStyle: {
                    backgroundColor: '#000',
                    borderColor: '#000',
                    borderWidth: 1,
                  },
                  headerTintColor: '#5034abff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }} >
        {(props) => <SignupScreen {...props} />}
        </Stack.Screen>

        <Stack.Screen  options={{headerShown: false}} name="MainTabScreen">
        {() => <MainTabScreen/>}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
}

