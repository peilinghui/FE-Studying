import React from 'react'
import { createStackNavigator, } from 'react-navigation'
import {
  StyleSheet,
  View,
  Text,
  DeviceEventEmitter
} from 'react-native';
import DiscussionScreen from '../screens/Home/Discussion'
import RealmListScreen from '../screens/Home/RealmList'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'
import Icon from 'react-native-vector-icons/Ionicons'
import Colors from '../constants/Colors'
// import DiscoverScreen from '../screens/Home/Discover'
import DiscoverScreen from '../screens/Home/DiscoverNew'
import Personal from '../screens/Home/Personal'
import { convert } from "../utils/ratio";


var showRed = false;
var showNotifiyRed = false;
var agreeCount=0;

const DiscussionStack = createStackNavigator({
  Discussion: DiscussionScreen,
})

DeviceEventEmitter.addListener("新私信", (e: any) => {
  showRed = true;
});

DeviceEventEmitter.addListener("hide", (e) => {
  showRed = false;
  agreeCount = 0
});

DeviceEventEmitter.addListener("收到新赞同", (e) => {

  showNotifiyRed = true;
 
  agreeCount = e.agreeCount
});


DiscussionStack.navigationOptions = {
  tabBarLabel: 'Discussion',
  tabBarIcon: ({ focused }: { focused: boolean }) => (
    <View>
      <Icon
        name="ios-chatbubbles"
        style={{ fontSize: convert(26), lineHeight: convert(24) }}
        color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
      {showRed && <View style={{ backgroundColor: 'red', position: 'absolute', width: convert(8), height: convert(8), borderRadius: convert(4), right: convert(-2), top: convert(-2) }} />}
    </View >
  ),
}

const RealmStack = createStackNavigator({
  Realm: RealmListScreen,
})

RealmStack.navigationOptions = {
  tabBarLabel: 'Realm',
  tabBarIcon: ({ focused }: { focused: boolean }) => (
    <Icon
      name="md-filing"
      style={{ fontSize: convert(26), lineHeight: convert(24) }}
      color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
    />
  ),
}

const DiscoverStack = createStackNavigator({
  Discover: DiscoverScreen,
})

DiscoverStack.navigationOptions = {
  tabBarLabel: 'Discover',
  tabBarIcon: ({ focused }: { focused: boolean }) => (
    <Icon
      name="md-bulb"
      style={{ fontSize: convert(26), lineHeight: convert(24) }}
      color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
    />
  ),
}

const PersonalStack = createStackNavigator({
  Personal,
})

PersonalStack.navigationOptions = {
  tabBarLabel: 'Personal',
  tabBarIcon: ({ focused }: { focused: boolean }) => (
    <View>
      <Icon
        name="md-person"
        style={{ fontSize: convert(26), lineHeight: convert(24) }}
        color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
      {showNotifiyRed && agreeCount>0 && <View style={{ backgroundColor: 'red', position: 'absolute', width: convert(15), height: convert(8), borderRadius: convert(4), right: convert(-10), top: convert(-5), alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: convert(7) }}>{agreeCount}</Text> 
      </View>}
    </View>
  ),
}

export default createMaterialBottomTabNavigator({
  RealmStack,
  DiscoverStack,
  DiscussionStack,
  PersonalStack
}, {
    barStyle: {
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: 'rgba(150, 150, 150, 0.1)',
      shadowRadius: convert(5),
      shadowOpacity: 1,
      shadowOffset: { height: 0, width: 0 },
      backgroundColor: Colors.tabBar
    },
    labeled: false,
    backBehavior: 'none'
  })
