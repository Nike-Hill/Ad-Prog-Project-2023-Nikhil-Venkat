//Imports
import React, {useCallback, useRef, useState, useEffect } from "react";
import { NavigationContainer } from '@react-navigation/native';
import {View, TouchableOpacity, Text} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

//Import bottom tab navigator and community icons
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


import TasksScreen from './TasksScreen';
import HomeScreen from "./HomeScreen";
import AnalyticsScreen from "./AnalyticsScreen";
import ChallengesScreen from './ChallengesScreen';

//Creat navigator
const Tab = createMaterialBottomTabNavigator();



const MainTabScreen = () => {
    //Return navigator with all main screens
    return (
        <Tab.Navigator
          initialRouteName="Home"
          activeColor="#0277bd"
          inactiveTintColor= 'gray'
          barStyle={{ backgroundColor: '#e3e3e3' }}
        >
          <Tab.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Home',
              title: 'Home',
              tabBarIcon: ({ color }) => (
                <Ionicons name="home" color={color} size={26} />
              ),
            }}
          />
          <Tab.Screen
            name="TaskScreen"
            component={TasksScreen}
            options={{
              tabBarLabel: 'Tasks',
              title: 'Tasks',
              tabBarIcon: ({ color }) => (
                <Ionicons name="ios-list-sharp" color={color} size={26} />
              ),
            }}
          />

        <Tab.Screen
            name="AnalyticsScreen"
            component={AnalyticsScreen}
            options={{
              tabBarLabel: 'Analytics',
              title: 'Analytics',
              tabBarIcon: ({ color }) => (
                <Ionicons name="ios-trending-up" color={color} size={26} />
              ),
            }}
          />
        <Tab.Screen
            name="ChallengesScreen"
            component={ChallengesScreen}
            options={{
              tabBarLabel: 'Challenges',
              title: 'Challenges',
              tabBarIcon: ({ color }) => (
                <Ionicons name="ios-trophy-sharp" color={color} size={26} />
              ),
            }}
          />


        </Tab.Navigator>
      );

}

export default MainTabScreen;