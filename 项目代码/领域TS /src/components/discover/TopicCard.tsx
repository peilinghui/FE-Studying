import _ from 'lodash';
import React from 'react';
import { Text, View, TouchableOpacity, GestureResponderEvent } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Layout from '../../constants/Layout';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Colors from '../../constants/Colors';
import { convert, winWidth } from '../../utils/ratio';
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

export default class TopicCard extends React.PureComponent<Props> {
  
  private onPress?: OnPressCallback;
  private onPressAvatar?: OnPressAvatarCallback;

  constructor(props: Props) {
    super(props);
    this.onPress = this.props.onPress;
    this.onPressAvatar = this.props.onPressAvatar;
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.onPress}
        activeOpacity={1}
        style={{
          borderRadius: convert(12),
          height: convert(228),
          elevation: convert(5),
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
                uri: _.get(this.props.realm, 'coverImage.url') +
                  '?imageMogr2/format/jpg/thumbnail/!600x400r/gravity/Center/interlace/1'
              }}
            >
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, .35)' }}>
              <Text style={{
                color: 'white',
                fontSize: convert(20),
                marginTop: convert(15),
                marginLeft: convert(15)
              }}>{this.props.realm.title}</Text>
              <Text style={{
                color: '#eee',
                fontSize: convert(12),
                marginTop: convert(3),
                marginLeft: convert(15)
              }}>{moment().from(this.props.realm.lastTopicAt).replace('内', '前')} - {
                this.props.realm.statistics.numOfTopics
              } 个话题</Text>
            </View>
            <View
              style={{
                height: convert(40),
                backgroundColor: '#fff',
                flexDirection: 'row'
              }}
            >
              <View
                style={{
                  marginVertical: convert(7),
                  marginLeft: convert(10),
                  height: convert(26),
                  backgroundColor: Colors.lightGray,
                  borderRadius: convert(12),
                  paddingHorizontal: convert(10),
                  alignSelf: 'flex-start',
                  flexDirection: 'row'
                }}
              >
                <Icon
                  name={'md-person'}
                  size={convert(13)}
                  style={{
                    lineHeight: convert(26),
                    alignSelf: 'flex-start',
                    marginRight: convert(5)
                  }}
                  color={Colors.darkGray}
                />
                <Text
                  style={{
                    color: Colors.darkGray,
                    lineHeight: convert(26),
                    fontSize: convert(13)
                  }}
                >{this.props.realm.statistics.numOfMembers}</Text>
              </View>
              { this.props.realm.lastTopic && (
                <View
                  style={{
                    marginLeft: 'auto',
                    marginRight: convert(10),
                    alignSelf: 'flex-end',
                    flexDirection: 'row'
                  }}
                >
                  <View
                    style={{
                      marginVertical: convert(7),
                      marginLeft: convert(10),
                      height: convert(26),
                      backgroundColor: Colors.lightGray,
                      borderRadius: convert(12),
                      paddingHorizontal: convert(10),
                      flexDirection: 'row',
                      alignSelf: 'flex-end'
                    }}
                  >
                    { !_.get(this.props.realm, 'isRead') &&
                      <View
                        style={{
                          backgroundColor: Colors.red,
                          height: convert(8),
                          width: convert(8),
                          borderRadius: convert(4),
                          marginVertical: convert(9),
                          alignSelf: 'flex-start',
                          marginRight: convert(8),
                        }}
                      />
                    }
                    <Text
                      style={{
                        color: '#666',
                        lineHeight: convert(26),
                        fontSize: convert(13),
                        maxWidth: winWidth - convert(210),
                        alignSelf: 'flex-start'
                      }}
                      numberOfLines={1}
                    >{this.props.realm.lastTopic.content.trim()}</Text>
                  </View>
                  
                </View>
              )}
            </View>
          </FastImage>
        </View>
      </TouchableOpacity>
    )
  }

}
