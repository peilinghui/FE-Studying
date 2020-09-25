import _ from 'lodash'
import React from 'react'
import { Text, View, TouchableOpacity, GestureResponderEvent } from 'react-native'
import Colors from '../../constants/Colors'
import moment from 'moment';
import 'moment/locale/zh-cn';
import { convert, winWidth } from "../../utils/ratio";
import FastImage from 'react-native-fast-image';

type OnPressCallback = (event: GestureResponderEvent) => void;
type OnPressAvatarCallback = (user: any) => void;

interface RealmJSONObject {
  [key: string]: any;
}

interface Props {
  realm: RealmJSONObject;
  onPress?: OnPressCallback;
  onPressAvatar?: OnPressAvatarCallback;
}

export default class RealmCard extends React.PureComponent<Props> {

  private onPress?: OnPressCallback
  private onPressAvatar?: OnPressAvatarCallback

  constructor(props: Props) {
    super(props)
    this.onPress = this.props.onPress
    this.onPressAvatar = this.props.onPressAvatar
  }

  render() {
    const { realm } = this.props
    const {
      realm: {
        computed: { userInfo: { numOfCreatedTopics, numOfReceivedAgrees } },
        creator: { profile: { nickname } },
        statistics:{numOfMembers}
      }
    } = this.props
    return (
      <TouchableOpacity
        onPress={this.onPress}
        activeOpacity={1}
        style={{
          borderRadius: convert(12),
          height: convert(110),
          elevation: convert(16),
          backgroundColor: '#eee',
          shadowColor: Colors.darkGrayAlpha(0.4),
          shadowRadius: convert(6),
          shadowOpacity: convert(1),
          shadowOffset: {
            width: 0,
            height: 0
          }
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: convert(12),
            overflow: 'hidden'
          }}>
          <FastImage
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
                fontSize: convert(10),
                marginTop: convert(10),
                marginLeft: convert(15),
                maxWidth: winWidth - convert(100)
              }}
                numberOfLines={1}
              >{nickname} 创建的</Text>
              <Text style={{
                color: 'white',
                fontWeight: '500',
                fontSize: convert(16),
                marginTop: convert(3),
                marginLeft: convert(15),
                maxWidth: winWidth - convert(100)
              }}
                numberOfLines={1}
              >{realm.title}</Text>
              <Text style={{
                position: 'absolute',
                color: '#eee',
                fontSize: convert(10),
                bottom: convert(5),
                right: convert(10)

              }}>{moment().from(realm.lastTopicAt).replace('内', '前')}</Text>
            </View>
            <View
              style={{
                height: convert(32),
                backgroundColor: '#fff',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <View
                style={{
                  marginVertical: convert(5),
                  marginLeft: convert(10),
                  paddingHorizontal: convert(5),
                  flexDirection: 'row'
                }}
              >
                <Text
                  style={{
                    color: '#9B9B9B',
                    fontSize: convert(12),
                  }}
                >发起 <Text style={{ color: '#000' }}>{numOfCreatedTopics}</Text> 个讨论 ·
                  获得 <Text style={{ color: '#000' }}>{numOfReceivedAgrees}</Text> 个认同</Text>
              </View>
            </View>
          </FastImage>
        </View>
      </TouchableOpacity>
    )
  }

}
