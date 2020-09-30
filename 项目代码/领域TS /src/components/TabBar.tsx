import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import Colors from '../constants/Colors';
import { getStatusBarHeight } from 'react-native-iphone-x-helper'

interface Props {
  
}

interface State {

}


export default class DiscoverScreen extends React.Component<Props, State> {

  constructor(props:Props) {
    super(props);
  }

  _renderItem = (props:any) => ({ route, index }:any) => {

    const { navigationState, position }=props;
    const inputRange = navigationState.routes.map((x:any, i:number) => i);

    const activeOpacity = position.interpolate({
      inputRange,
      outputRange: inputRange.map((i:number) => (i === index ? 1 : 0)),
    });
    const inactiveOpacity = position.interpolate( {
      inputRange,
      outputRange: inputRange.map((i:number) => (i === index ? 0 : 1)),
    });
    

    return (
      <View>
        <Animated.View style={[ { opacity: inactiveOpacity ,}]}>
        
          <Text style={[,styles.topTab,]}>{route.title}</Text>
        </Animated.View>
        <Animated.View
          style={[ StyleSheet.absoluteFill, { opacity: activeOpacity },]}
        >
          
          <Text style={[,styles.topTab, styles.topTabActivated]}>{route.title}</Text>
        </Animated.View>
      </View>
    );
  };

  _renderTabBar = (props:any) => (
    <View style={styles.topTabBar}>
      {props.navigationState.routes.map((route:any, index:number) => {
        return (
          <TouchableWithoutFeedback
            key={route.key}
            onPress={() => props.jumpTo(route.key)}
          >
            {this._renderItem(props)({ route, index })}
          </TouchableWithoutFeedback>
        );
      })}
    </View>
  );



  
  render() {
    return (
      this._renderTabBar(this.props)
    );
  }
}



const styles = StyleSheet.create({

  topTabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: getStatusBarHeight(true),
    backgroundColor: 'white'
  },
  topTab: {
    fontSize: 22,
    lineHeight: 50,
    fontWeight: 'bold',
    marginRight: 5,
    paddingHorizontal: 2,
    borderRadius: 12,
    color: Colors.tabIconDefault
  },
  topTabActivated: {
    color: Colors.tabIconSelected
  },
});
