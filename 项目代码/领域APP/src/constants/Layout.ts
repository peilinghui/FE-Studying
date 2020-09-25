import { Dimensions, Platform } from 'react-native';
const androidDimensions = require('react-native-extra-dimensions-android');
const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const realWindowHeight = androidDimensions.get('REAL_WINDOW_HEIGHT');
const sortMenuBarHeight = androidDimensions.get('SOFT_MENU_BAR_HEIGHT');

export default {
  window: {
    width: windowWidth,
    height: windowHeight,
    realHeight: realWindowHeight - sortMenuBarHeight
  },
  screen: {
    width: screenWidth,
    height: screenHeight
  },
  isSmallDevice: windowWidth < 375,
};
