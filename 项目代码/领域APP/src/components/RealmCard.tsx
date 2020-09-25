import _ from 'lodash';
import React from 'react';
import { Text, View, ImageBackground, TouchableOpacity, GestureResponderEvent } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Layout from '../constants/Layout';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Colors from '../constants/Colors';
import Avatar from './Avatar';
import { convert, winWidth } from "../utils/ratio";
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

  private onPress?: OnPressCallback;
  private onPressAvatar?: OnPressAvatarCallback;

  constructor(props: Props) {
    super(props);
    this.onPress = this.props.onPress;
    this.onPressAvatar = this.props.onPressAvatar;
  }

  render() {

    const { realm } = this.props

    const { creator = {}, membership } = realm;
    const { profile = {} } = creator;
    const { nickname } = profile

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
          shadowOpacity: 1,
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
              uri: _.get(realm, 'coverImage.url') +
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
                fontSize: convert(16),
                marginTop: convert(3),
                marginLeft: convert(15),
                fontWeight: '500',
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
                  marginLeft: convert(10),
                  height: convert(22),
                  backgroundColor: Colors.lightGray,
                  borderRadius: convert(12),
                  paddingHorizontal: convert(10),
                  marginVertical: convert(7),
                  flexDirection: 'row',
                  alignSelf: 'center',
                }}
              >
                <Icon
                  name={'md-person'}
                  size={convert(13)}
                  style={{
                    alignSelf: 'center',
                    marginRight: convert(5)
                  }}
                  color={Colors.darkGray}
                />
                <Text
                  style={{
                    color: Colors.darkGray,
                    alignSelf: 'center',
                    fontSize: convert(10)
                  }}
                >{realm.statistics.numOfMembers}</Text>
              </View>
              {realm.lastTopic && (
                <View
                  style={{
                    marginLeft: 'auto',
                    marginRight: convert(10),
                    flexDirection: 'row',
                    alignSelf: 'center',
                  }}
                >
                  <View
                    style={{
                      marginVertical: convert(7),
                      marginLeft: convert(10),
                      height: convert(24),
                      backgroundColor: Colors.lightGray,
                      borderRadius: convert(12),
                      paddingHorizontal: convert(10),
                      flexDirection: 'row',
                      alignSelf: 'center',
                    }}
                  >
                    {!_.get(realm, 'isRead') &&
                      <Text
                        style={{
                          color: Colors.red,
                          fontSize: convert(10),
                          alignSelf: 'center',
                          marginRight: convert(2)
                        }}
                        numberOfLines={1}
                      >[新讨论]</Text>
                    }
                    <Text
                      style={{
                        color: '#666',
                        fontSize: convert(10),
                         alignSelf: 'center',
                        maxWidth: winWidth - convert(210),
                      }}
                      numberOfLines={1}
                    >{realm.lastTopic.content.trim()}</Text>
                  </View>
                  <Avatar
                    user={_.get(realm, 'lastTopic.creator')}
                    size={convert(20)}
                    style={{
                      marginVertical: convert(7),
                      marginLeft: convert(5)
                    }}
                    onPress={() =>
                      this.onPressAvatar &&
                      this.onPressAvatar(_.get(realm, 'lastTopic.creator'))
                    }
                  />
                </View>
              )}
            </View>
          </FastImage>
        </View>
      </TouchableOpacity>
    )
  }
}
