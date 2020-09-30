import { Platform } from 'react-native';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import { fromRight } from 'react-navigation-transitions';
import LoginScreen from '../screens/Auth/Login';

export default createAppContainer(createStackNavigator({
  Login: LoginScreen
}, {
  initialRouteName: 'Login',
  headerMode: 'none',
  headerBackTitleVisible: false,
  transitionConfig: Platform.OS === 'android' ? () => fromRight(): undefined
}));