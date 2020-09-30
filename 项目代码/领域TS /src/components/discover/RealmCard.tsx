import _ from 'lodash';
import React from 'react';
import { Text, View, TouchableOpacity, GestureResponderEvent } from 'react-native';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Colors from '../../constants/Colors';
import TouchableIcon from '../TouchableIcon'
import { convert, winWidth } from "../../utils/ratio";
import FastImage from 'react-native-fast-image';

type OnPressCallback = (event: GestureResponderEvent) => void;
type OnPressAvatarCallback = (user: any) => void;

interface RealmJSONObject {
  [key: string]: any;
}

interface Props {
  item: { realm: any, source: string, count?: number }
  onPress?: OnPressCallback;
  onPressAvatar?: OnPressAvatarCallback;
  styles: any;
}

export default class RealmCard extends React.PureComponent<Props> {

  private onPress?: OnPressCallback;
  private onPressAvatar?: OnPressAvatarCallback;

  constructor(props: Props) {
    super(props);
    this.onPress = this.props.onPress;
    this.onPressAvatar = this.props.onPressAvatar;
  }


  render() {
    
    const { item } = this.props
    const { realm, source } = item
    const text = source === 'most_friends' ? `${item.count}个好友所在` : '热门领域'
    const { creator = {}, membership } = realm;
    const { profile = {} } = creator;
    const { nickname } = profile
    return (
      
      <TouchableOpacity
        onPress={this.onPress}
        activeOpacity={1}
        style={{
          borderRadius: convert(12),
          height: convert(220),
          elevation: convert(5),
          backgroundColor: '#eee',
          shadowColor: Colors.darkGrayAlpha(0.4),
          shadowRadius: convert(6),
          shadowOpacity: 1,
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
            overflow: 'hidden',
          }}>
          <FastImage
            resizeMode={'cover'} // or cover
            style={{
              flex: 1,
            }}
            source={{
              uri: _.get(realm, 'coverImage.url') +
                '?imageMogr2/format/jpg/thumbnail/!300x200r/gravity/Center/interlace/1'
            }}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, .35)' }}>
              <Text style={{
                color: 'white',
                fontSize: convert(12),
                marginTop: convert(10),
                marginLeft: convert(10),
                maxWidth: winWidth - convert(100)
              }}
                numberOfLines={1}
              >{nickname} 的</Text>
              <Text numberOfLines={3} ellipsizeMode="tail" style={{
                color: 'white',
                fontSize: convert(18),
                marginTop: convert(3),
                marginLeft: convert(10),
                marginRight: convert(10),
                fontWeight:'bold'
              }}>{realm.title}</Text>
              <Text style={{
                color: Colors.lightGray,
                fontSize: convert(10),
                marginTop: convert(3),
                marginLeft: convert(10),
              }}>
                {moment().from(realm.lastTopicAt).replace('内', '前')} - {realm.statistics.numOfTopics} 个话题
              </Text>
              <View style={{ flex: 1 }}></View>

              <View style={{ padding: convert(15) }}>
                <Text style={{
                  color: Colors.lightGray,
                  fontSize: convert(12),
                  marginTop: convert(3),
                  textAlign: 'center'
                }}>{text}</Text>
              </View>
            </View>
          </FastImage>
        </View>
      </TouchableOpacity>
    )
  }

}
