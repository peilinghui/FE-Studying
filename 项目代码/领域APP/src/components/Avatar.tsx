import _ from 'lodash';
import React from 'react';
import { TouchableOpacity, GestureResponderEvent, ViewStyle, Text, StyleSheet, View, Image } from 'react-native';
import Colors from '../constants/Colors';

type OnPressCallback = (event: GestureResponderEvent) => void;

interface UserJSONObject {
  [key: string]: any;
}

interface Props {
  user: UserJSONObject;
  size: number;
  style?: ViewStyle;
  onPress?: OnPressCallback;
  activeStatus?: boolean;
}

const CIRCLE_WIDTH = 2;
const CIRCLE_PADDING = 2;

export default class Avatar extends React.Component<Props> {

  private style: ViewStyle;
  private size: number;
  private onPress?: OnPressCallback;

  constructor(props: Props) {
    super(props);
    this.size = this.props.size;
    this.style = this.props.style || {};
    this.onPress = this.props.onPress;
  }

  withCircle() {
    return (
      <View style={styles.constainer}>
        <TouchableOpacity
          onPress={this.onPress}
          activeOpacity={0.7}
          style={{
            backgroundColor: Colors.lightGray,
            borderRadius: (this.size - CIRCLE_WIDTH * 2) / 2,
            width: this.size - CIRCLE_WIDTH * 2,
            height: this.size - CIRCLE_WIDTH * 2,
            padding: CIRCLE_PADDING,
            ...this.style
          }}
        >
          <Image
            resizeMode={'cover'}
            style={{
              borderRadius: (this.size - CIRCLE_WIDTH * 2 - CIRCLE_PADDING * 2) / 2,
              width: this.size - CIRCLE_WIDTH * 2 - CIRCLE_PADDING * 2,
              height: this.size - CIRCLE_WIDTH * 2 - CIRCLE_PADDING * 2
            }}
            source={{
              uri: _.get(this.props.user, 'profile.avatar.url')
            }}
          />
          <Image
            resizeMode={'cover'}
            style={styles.imageStyle}
            source={
              _.get(this.props.user, 'traces.lastTopicAt')
          && Date.parse(this.props.user.traces.lastTopicAt) > Date.now() - 3600 * 24 * 1000 ?
                require('../assets/blueIcon.png'):
                require('../assets/grayIcon.png')
            }
          />
        </TouchableOpacity>
        </View>
    );
  }

  render() {
    if (this.props.activeStatus) {
      return this.withCircle();
    }
    return (
      <TouchableOpacity
        onPress={this.onPress}
        activeOpacity={0.7}
        style={{
          backgroundColor: Colors.lightGray,
          borderRadius: this.size / 2,
          ...this.style,alignItems:'center',
        }}
      >
        <Image
          resizeMode={'cover'}
          style={{
            borderRadius: this.size / 2,
            width: this.size,
            height: this.size
          }}
          source={{
            uri: _.get(this.props.user, 'profile.avatar.url')
          }}
        />
      </TouchableOpacity>
    )
      }
    
    }
    
const styles = StyleSheet.create({
  constainer:{
    flexDirection:'row',
  },
  imageStyle: {
    width: 15,
    height: 15,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'absolute',
    right:0,
  }
})
