import _ from 'lodash';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  GestureResponderEvent
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Avatar from './Avatar';
import { convert, winWidth } from "../utils/ratio";
import FastImage from 'react-native-fast-image';

type OnPressCallback = (event: GestureResponderEvent) => void;
type OnPressAvatarCallback = (user: any) => void;

interface TopicJSONObject {
  [key: string]: any;
}

interface Props {
  topic: TopicJSONObject;
  onPress?: OnPressCallback;
  onPressAvatar?: OnPressAvatarCallback;
}

export default class TopicCardMini extends React.PureComponent<Props> {

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
          overflow: 'hidden',
          backgroundColor: '#fff',
          paddingHorizontal: convert(20),
          paddingVertical: convert(15),
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <View>
            <Avatar
              onPress={() =>
                this.onPressAvatar &&
                this.onPressAvatar(this.props.topic.creator)
              }
              size={convert(35)}
              user={this.props.topic.creator}
            />
            <FastImage
              resizeMode="cover"
              source={{ uri: _.get(this.props, 'topic.realm.coverImage.url') }}
              style={{
                marginTop: convert(-16),
                marginLeft: convert(24),
                width: convert(20),
                height: convert(20),
                borderRadius: convert(10),
                borderColor: '#fff',
                borderWidth: convert(2)
              }}
            />
          </View>
          <View style={{ marginLeft: convert(15), flex: 1, flexDirection: 'column' }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: convert(12), lineHeight: convert(16) }}>{
                this.props.topic.creator ? this.props.topic.creator.profile.nickname : null
              }</Text>
              <Text
                style={{
                  fontSize: convert(10),
                  color: Colors.darkGray,
                  lineHeight: convert(12),
                  marginTop: convert(2),
                  marginLeft: convert(5)
                }}
              >
                @{_.get(this.props, 'topic.realm.title')}
              </Text>
              <Text
                style={{
                  fontSize: convert(10),
                  lineHeight: convert(12),
                  color: Colors.darkGray,
                  marginTop: convert(2),
                  marginLeft: 'auto'
                }}
              >{
                moment().from(this.props.topic.createdAt).replace('内', '前')
              }</Text>
            </View>
            <View style={{ flexWrap: 'wrap', marginTop: convert(5), }}>
              <Text
                numberOfLines={1}
                style={{ lineHeight: convert(25), fontSize: convert(12) }}
              >{ this.props.topic.content }</Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, marginTop: convert(8), flexDirection: 'row' }}>
          {
            this.props.topic.lastMessage && this.props.topic.lastMessage.fromUser ? (
              <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                  <View style={{
                  borderRadius: convert(10),
                    backgroundColor: Colors.lightGray,
                    alignSelf: 'flex-start'
                  }}>
                    <Text numberOfLines={1} style={styles.lastMessageContent}>{
                      this.props.topic.lastMessage.content
                    }</Text>
                  </View>
                <FastImage
                    resizeMode={'cover'}
                    style={{
                      borderRadius: convert(12),
                      width: convert(20),
                      height: convert(20),
                      marginLeft: convert(5),
                    }}
                    source={{
                      uri: _.get(this.props.topic.lastMessage.fromUser, 'profile.avatar.url'),
                    }}
                  />
              </View>
            ) : (
              <View style={{ marginLeft: 'auto' }}>
                <View style={{
                  borderRadius: convert(10),
                  backgroundColor: Colors.lightGray,
                  alignSelf: 'flex-start'
                }}>
                  <Text style={styles.lastMessageContent}>还没有回复</Text>
                </View>
              </View>
            )
          }
          </View>
      </TouchableOpacity>
    )
  }

}

const styles = StyleSheet.create({
  lastMessageContent: {
    fontSize: convert(10),
    lineHeight: convert(10),
    paddingVertical: convert(5),
    paddingHorizontal: convert(8),
    marginBottom: convert(-1),
    maxWidth: winWidth - convert(170)
  },
  statsLabel: {
    color: Colors.blue,
    fontSize: convert(10),
    lineHeight: convert(10),
    paddingVertical: convert(1),
  }
});