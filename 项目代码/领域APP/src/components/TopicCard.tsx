import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import moment from 'moment';
import 'moment/locale/zh-cn';
import Avatar from './Avatar';
import rnTextSize from 'react-native-text-size'
import _ from 'lodash'
import { convert, winWidth } from "../utils/ratio";
import Video from 'react-native-video';
import RealmCard from './Message/RealmCard'
import LinkCard from "./Message/LinkCard";
import TopicCardMessage from './Message/TopicCard';
import TouchableIcon from '../components/TouchableIcon';
import Hyperlink from 'react-native-hyperlink'
import FastImage, { FastImageProperties } from 'react-native-fast-image';
import { CacheImage } from 'react-native-rn-cacheimage'

type OnPressCallback = (item: any) => void;
type OnPressAvatarCallback = (user: any) => void;
type OnPressRealmCallback = (item: any) => void;
type onPressTopicCallback = (item: any) => void;
type onPressVideoCallback = (item: any) => void;
type onPressLinkCallback = (item: any) => void;
interface TopicJSONObject {
  [key: string]: any;
}

interface Props {
  topic: TopicJSONObject;
  onPress?: OnPressCallback;
  onPressAvatar?: OnPressAvatarCallback;
  onPressRealm?: OnPressRealmCallback;
  onPressTopic?: onPressTopicCallback;
  onPressVideo?: onPressVideoCallback;
  onPressLink?: onPressLinkCallback;
}

interface State {
  disableQiniu: boolean;
}

export default class TopicCard extends React.PureComponent<Props, State> {

  private onPress?: OnPressCallback;
  private onPressAvatar?: OnPressAvatarCallback;
  private onPressRealm?: OnPressRealmCallback;
  private onPressTopic?: onPressTopicCallback;
  private onPressVideo?: onPressVideoCallback;
  private onPressLink?: onPressLinkCallback;

  constructor(props: Props) {
    super(props);
    this.onPress = this.props.onPress;
    this.onPressAvatar = this.props.onPressAvatar;
    this.onPressRealm = this.props.onPressRealm;
    this.onPressTopic = this.props.onPressTopic;
    this.onPressVideo = this.props.onPressVideo;
    this.onPressLink = this.props.onPressLink;
    this.state = {
      disableQiniu: false
    }
  }

  render() {
    const { topic } = this.props;
    const { disableQiniu } = this.state;

    return (
      <TouchableOpacity
        onPress={() => this.onPress && this.onPress(topic)}
        activeOpacity={1}
        style={{
          overflow: 'hidden',
          backgroundColor: topic.isArchived ? '#f5f5f5' : '#ffffff',
          marginLeft: convert(15),
          marginRight: convert(20),
          marginTop: convert(20),
          flex: 1,
        }}
      >
        {
          topic.isArchived ? (
            <View style={{ marginBottom: convert(15) }}>
              <Text
                style={{
                  fontSize: convert(12),
                  color: '#880e4f'
                }}
              >[该话题已经被封存了]</Text>
            </View>
          ) : null
        }
        <View style={{ flexDirection: 'row' }}>
          <View>
            <Avatar
              onPress={() =>
                this.onPressAvatar &&
                this.onPressAvatar(topic.creator)
              }
              size={convert(40)}
              activeStatus={true}
              user={topic.creator}
            />
          </View>
          <View style={{ marginLeft: convert(10), flex: 1, flexDirection: 'column' }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{
                fontSize: convert(12),
                lineHeight: convert(16),
                color: 'black',
                fontWeight: 'bold'
              }}>{
                  topic.creator ? topic.creator.profile.nickname : null
                }</Text>
              <Text
                style={{
                  fontSize: convert(11),
                  color: Colors.darkGray,
                  lineHeight: convert(12),
                  marginTop: convert(2),
                  marginLeft: convert(5)
                }}
              >{
                  moment().from(topic.createdAt).replace('内', '前')
                }</Text>
              <View style={{
                marginLeft: 'auto',
                backgroundColor: Colors.lightGray,
                borderRadius: convert(10),
                height: convert(20),
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Text style={{
                  color: Colors.blue,
                  fontSize: convert(12),
                  paddingHorizontal: convert(8),
                  paddingVertical: convert(5),
                }}>{topic.tag}</Text>
              </View>
            </View>
            <View style={{
              marginTop: convert(10),
              backgroundColor: Colors.lightGray,
              borderRadius: convert(10),
              padding: convert(2),
            }}>
              <Hyperlink linkDefault={true} linkStyle={{ color: Colors.blue, fontSize: convert(12) }}>
                <Text style={{
                  lineHeight: convert(25),
                  fontSize: convert(12),
                  margin: convert(5),
                  paddingHorizontal: convert(5),
                  color: 'black'
                }}>{topic.content}</Text>
              </Hyperlink>
              {topic.type === 'image' && _.get(topic, 'elements.videos.0.url')
                && <View>
                  <Video
                    source={{ uri: _.get(topic, 'elements.videos.0.url') }} // 视频的URL地址，或者本地地址，都可以.
                    ref='player'
                    rate={1}                   // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
                    volume={1.0}                 // 声音的放声音的放大倍数大倍数，0 代表没有声音，就是静音muted, 1 代表正常音量 normal，更大的数字表示放大的倍数
                    muted={false}                // true代表静音，默认为false.
                    paused={true}               // true代表暂停，默认为false
                    resizeMode="cover"           // 视频的自适应伸缩铺放行为，contain、stretch、cover
                    repeat={false}                // 是否重复播放
                    playInBackground={true}     // 当app转到后台运行的时候，播放是否暂停
                    playWhenInactive={false}     // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
                    style={{
                      height: convert(250),
                      borderRadius: convert(12),
                    }}
                  />
                  <TouchableIcon
                    style={{
                      top: convert(100),
                      left: convert(100),
                      position: 'absolute',
                    }}
                    size={convert(50)}
                    name="md-play-circle"
                    color='#fff'
                  // onPress={() => this.props.navigation.push('VideosViewer', {
                  //   videoURL: topic
                  // })}
                  /></View>}
              {
                topic.type === 'image' && _.has(topic, 'elements.images.0') ? (
                  <View
                    style={{
                      marginTop: convert(10),
                      marginBottom: convert(5),
                      backgroundColor: Colors.lightGray,
                      borderRadius: convert(12)
                    }}
                  >
                    <Image
                      style={{
                        height: winWidth - convert(95),
                        borderRadius: convert(12),
                        margin: convert(3),
                      }}
                      source={{
                        uri: _.get(topic, 'elements.images.0.url')
                          + (disableQiniu
                            ? '' : '?imageMogr2/auto-orient/format/jpg/thumbnail/!600x500r/gravity/Center/crop/600x500/interlace/1/size-limit/$(fsize)')
                      }}
                      onError={() => {
                        this.setState({ disableQiniu: true });
                      }}
                    />
                    <View style={{
                      backgroundColor: "#000000bb",
                      position: 'absolute', bottom: convert(5),
                      right: convert(5), width: convert(50),
                      height: convert(20),
                      borderRadius: convert(10),
                      alignItems:'center',
                      justifyContent:'center'
                    }}>
                      <Text style={{ fontSize: convert(10), color: Colors.lightGray, }}>{topic.elements.images.length}张图片</Text>
                    </View>
                  </View>
                ) : null
              }
              {
                topic.type === 'video' ? (
                  <View
                    style={{
                      marginTop: convert(10),
                      marginBottom: convert(5),
                      backgroundColor: Colors.lightGray,
                      borderRadius: convert(12)
                    }}
                  >
                    {_.get(topic, 'elements.videos.0.url')
                      && <View>
                        <Video
                          source={{ uri: _.get(topic, 'elements.videos.0.url') }} // 视频的URL地址，或者本地地址，都可以.
                          ref='player'
                          rate={1}                   // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
                          volume={1.0}                 // 声音的放声音的放大倍数大倍数，0 代表没有声音，就是静音muted, 1 代表正常音量 normal，更大的数字表示放大的倍数
                          muted={false}                // true代表静音，默认为false.
                          paused={true}               // true代表暂停，默认为false
                          resizeMode="cover"           // 视频的自适应伸缩铺放行为，contain、stretch、cover
                          repeat={false}                // 是否重复播放
                          playInBackground={true}     // 当app转到后台运行的时候，播放是否暂停
                          playWhenInactive={false}     // [iOS] Video continues to play when control or notification center are shown. 仅适用于IOS
                          style={{
                            margin: convert(3),
                            height: winWidth - convert(95),
                            borderRadius: convert(12),
                          }}
                        />
                        <TouchableIcon
                          style={{
                            top: convert(100),
                            left: convert(100),
                            position: 'absolute',
                          }}
                          size={convert(50)}
                          name="md-play-circle"
                          color='#fff'
                          onPress={() => this.onPressVideo && this.onPressVideo(topic)}
                        /></View>}
                  </View>
                ) : null
              }
              {topic.type === 'realm' && _.get(topic, 'elements.realm') ? (
                <RealmCard
                  onPress={() => this.onPressRealm && this.onPressRealm(topic)}
                  realm={topic.elements.realm}
                  styles={{
                    width: winWidth - convert(95),
                    margin: convert(3)
                  }}
                />
              ) : null}
              {topic.type === 'topic' ? (
                <TopicCardMessage
                  onPress={() => this.onPressTopic && this.onPressTopic(topic)}
                  onPressAvatar={() => this.onPressAvatar &&
                    this.onPressAvatar(topic.elements.topic.creator)}
                  topic={topic.elements.topic}
                  styles={{
                    width: winWidth - convert(95),
                    backgroundColor: '#fff',
                    margin: convert(3)
                  }}
                />
              ) : null}
              {topic.type === 'link' ? (
                <LinkCard
                  onPress={() => this.onPressLink && this.onPressLink(topic)}
                  link={_.get(topic, 'elements.link')}
                />
              ) : null}
            </View>
          </View>
        </View>
        <View style={{
          flex: 1,
          marginTop: convert(10),
          flexDirection: 'row',
          marginLeft: convert(50),
        }}>
          <View style={{
            borderRadius: convert(10),
            backgroundColor: Colors.lightGray,
            alignSelf: 'flex-start',
            flexDirection: 'row',
            height: convert(28),
            alignItems: 'center',
          }}>
            {topic.lastMessage ? <Avatar
              user={topic.lastMessage.fromUser}
              size={convert(18)}
            /> : <Avatar
                user={topic.creator}
                size={convert(18)}
              />}
            {topic.lastMessage ?
              <Text numberOfLines={1} style={styles.lastMessageContent}>{
                topic.lastMessage.content
              }</Text>
              : <Text numberOfLines={1} style={styles.lastMessageContent}>
                发起了讨论
                  </Text>
            }
          </View>

          <View style={{
            marginTop: convert(5),
            height: convert(22),
            marginLeft: convert(10),
          }}>
            {topic.lastMessage ?
              <Text style={{
                color: Colors.blue,
                fontSize: convert(11),
              }}>{
                  topic.statistics.numOfMessages
                } 条回复</Text>
              : <Text style={{
                color: Colors.blue,
                fontSize: convert(11),
              }}>进入回复</Text>}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

}

function countRegexp(str: string, regexp: RegExp) {
  return (str.match(regexp) || []).length
}

export async function buildTopicCardHeight(topics: any) {
  const lineHeight = convert(25);
  const magic = convert(110);
  const magic_with_img = convert(390);
  const magic_with_realm = convert(100);
  const magic_text_width = winWidth - convert(100);
  const magic_link_height = convert(180);
  return Promise.all(topics.map(async (topic: any) => {
    const size = await rnTextSize.measure({
      text: topic.content,
      width: magic_text_width,
      fontSize: convert(12)
    });
    let extraLineCount = countRegexp(topic.content, /\n/g) - countRegexp(topic.content.trim(), /\n/g);
    const textHeight = lineHeight * (size.lineCount + extraLineCount);
    const cardHeight = topic.type === 'image' || topic.type === 'video' ?
      textHeight + magic_with_img
      : topic.type === 'realm' && _.get(topic, 'elements.realm') ?
        textHeight + magic_with_realm + magic
        : topic.type === 'topic' ?
          2 * (textHeight + magic)
          : topic.type === 'link' ?
            textHeight + magic + magic_link_height
            : textHeight + magic;

    topic.cardHeight = cardHeight;
    return topic;
  })) as Promise<any[]>;
}

const styles = StyleSheet.create({
  lastMessageContent: {
    fontSize: convert(11),
    lineHeight: convert(11),
    paddingVertical: convert(5),
    paddingHorizontal: convert(8),
    marginBottom: convert(-1),
    maxWidth: Layout.screen.width - convert(170)
  },
});