import _ from 'lodash';
import React from 'react';
import { Text, View, TouchableOpacity, GestureResponderEvent, ImageBackground } from 'react-native';
import 'moment/locale/zh-cn';
import Colors from '../../constants/Colors';
import { convert } from '../../utils/ratio';
import FastImage from 'react-native-fast-image';
import { CacheImage } from 'react-native-rn-cacheimage'

type OnPressCallback = (event: GestureResponderEvent) => void;

interface RealmJSONObject {
  [key: string]: any;
}

interface Props {
  realm: RealmJSONObject;
  onPress?: OnPressCallback;
  styles: any;
}

export default class RealmCard extends React.PureComponent<Props> {

  private onPress?: OnPressCallback;

  constructor(props: Props) {
    super(props);
    this.onPress = this.props.onPress;
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.onPress}
        activeOpacity={1}
        style={{
          borderRadius: convert(12),
          height: convert(100),
          width: convert(280),
          elevation: convert(2),
          backgroundColor: '#eee',
          shadowColor: Colors.darkGrayAlpha(0.4),
          shadowRadius: convert(6),
          shadowOpacity: convert(1),
          shadowOffset: {
            width: 0,
            height: 0
          },
          ...this.props.styles
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: convert(12),
            overflow: 'hidden'
          }}>
          <CacheImage
            resizeMode={'cover'} // or cover
            style={{
              flex: 1
            }}
            source={{
              uri: _.get(this.props.realm, 'coverImage.url') +
                '?imageMogr2/format/jpg/thumbnail/!300x200r/gravity/Center/interlace/1'
            }}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, .35)' }}>
              <Text style={{
                color: 'white',
                fontSize: convert(16),
                marginTop: convert(15),
                marginLeft: convert(15)
              }}>{_.get(this.props.realm, 'title')}</Text>
            </View>
          </CacheImage>
        </View>
      </TouchableOpacity>
    )
  }

}
