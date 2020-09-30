import React from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  PanResponder,
  Modal,
  GestureResponderEvent
} from "react-native";
import Colors from "../../constants/Colors";
import { getBottomSpace, getStatusBarHeight } from "react-native-iphone-x-helper";
import { winHeight, convert, winWidth } from "../../utils/ratio";
import Avatar from '../../components/Avatar';
import TouchableIcon from "../../components/TouchableIcon";
import _ from 'lodash'
import Icon from 'react-native-vector-icons/Ionicons'
import moment from 'moment'
import 'moment/locale/zh-cn'
import AutoHeightImage from 'react-native-auto-height-image'
// import Lightbox from 'react-native-lightbox';
import Video from 'react-native-video';
import RealmCard from '../../components/Message/RealmCard'
import TopicCard from '../../components/Message/TopicCard';
import LinkCard from '../../components/Message/LinkCard';

type OnPressCallback = (event: GestureResponderEvent) => void;
type OnPressAvatarCallback = (user: { _id: any; }) => void;

interface Props {
  onClose: () => void
  visible: boolean
  topheight: number,
  topic: any;
  onPress?: OnPressCallback;
  onPressAvatar?: OnPressAvatarCallback;
  onPressAgreeTopic?: OnPressCallback;
}

interface State {
  active: boolean;
}
const MAX_HEIGHT = winHeight - convert(140) - getBottomSpace() - getStatusBarHeight();

export default class TopTopicDrawer extends React.PureComponent<Props, State> {

  private _panResponder: any
  constructor(props:any) {
    super(props);
  
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderTerminate: () => this.props.onClose(),
      onPanResponderRelease: this.props.onClose
    });
  }

  render() {
    const { onClose, visible, topic, topheight } = this.props;
    const { statistics = {} } = topic;
    return (
      <Modal
        animationType={'fade'}
        transparent={true}
        visible={visible}>

        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0)', height: convert(50) }} />

        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', height: winHeight, }}>
          <View
            style={{
              backgroundColor: "#fff",
              height: this.props.topheight > MAX_HEIGHT ?
                MAX_HEIGHT : this.props.topheight,
              alignItems: 'center',
              borderBottomLeftRadius: convert(12),
              borderBottomRightRadius: convert(12),
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              contentContainerStyle={{
                width: winWidth
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: convert(10),
                  paddingHorizontal: convert(20),
                }}>
                <Avatar
                  // onPress={() =>
                  // this.props.onPressAvatar &&
                  // this.props.onPressAvatar(this.props.topic.creator)
                  // }
                  size={convert(30)}
                  activeStatus={false}
                  user={this.props.topic.creator}
                />
                <View style={{ marginLeft: convert(15), flex: 1, flexDirection: 'column' }}>
                  <Text style={{ fontSize: convert(14), lineHeight: convert(16), }}>{
                    _.get(topic, 'creator.profile.nickname')
                  }</Text>
                  <View style={{ flexDirection: 'row', marginTop: convert(5) }}>
                    <Text style={{ fontSize: convert(11), lineHeight: convert(12), color: Colors.darkGray }}>
                      {moment().from(topic.createdAt).replace('内', '前')}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    fontSize: convert(14),
                    lineHeight: convert(16),
                    marginRight: convert(5),
                    color: Colors.darkGray,
                    marginTop: convert(7),
                  }}
                >{statistics.numOfReceivedAgrees}</Text>
                <TouchableIcon
                  name="md-thumbs-up"
                  size={convert(24)}
                  color={_.get(this.props.topic, 'computed.userInfo.isAgreed') ? Colors.blue : '#555'}
                  onPress={() => this.props.onPressAgreeTopic}
                />
              </View>
              <View style={{ flexWrap: 'wrap', marginTop: convert(10), paddingHorizontal: convert(20), }}>
                <Text
                  style={{
                    fontSize: convert(12),
                    lineHeight: convert(24),
                    marginBottom: convert(5),
                  }}
                >{topic.content}</Text>
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
                        height: convert(200),
                        borderRadius: convert(12),
                        marginBottom: convert(5)
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
                    /></View>}
                {
                  topic.type === 'image' &&
                  _.map(topic.elements.images, image =>
                    <AutoHeightImage
                      style={{
                        backgroundColor: Colors.lightGray,
                        borderRadius: convert(12),
                        // height:convert(174)
                        marginLeft: convert(5),
                        marginBottom: convert(2)
                      }}
                      key={image._id}
                      width={winWidth - convert(50)}
                      source={{
                        uri: image.url
                          + '?imageMogr2/auto-orient/format/jpg/interlace/1/size-limit/$(fsize)'
                      }}
                    />
                  )
                }
                {topic.type === 'realm' &&
                  <View
                    style={{
                      height: convert(150),
                      // marginLeft: convert(20),
                    }}
                  >
                    <RealmCard
                      // onPress={() =>
                      //   this.props.navigation.push("RealmViewer", {
                      //     realmId: topic.elements.realm._id,
                      //     isMember: false
                      //   })}
                      realm={topic.elements.realm}
                      styles={{}}
                    />
                  </View>
                }
                {topic.type === 'topic' &&
                  <View
                    style={{
                      height: convert(150),
                      // marginLeft: convert(20),
                    }}
                  >
                    <TopicCard
                      // onPress={() =>{}
                      // this.props.navigation.push("TopicViewer", {
                      //   realmId: topic.elements.topic._id,
                      //   topicData: topic.elements.topic,
                      //   isMember: false
                      // })
                      // }
                      // onPressAvatar={(user: { _id: any; }) => {
                      //   this.props.navigation.push('UserViewer', { userId: user._id })
                      // }}
                      topic={topic.elements.topic}
                      styles={{}}
                    />
                  </View>}
                {
                  topic.type === 'video' && _.get(topic, 'elements.videos.0.url')
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
                    // onPress={() => this.onPressVideo && this.onPressVideo(topic)}
                    /></View>
                }
                {topic.type === 'link' &&
                  <View
                    style={{
                      marginLeft: convert(15),
                      marginRight: convert(15),
                      height: convert(180)
                    }}
                  >
                    <LinkCard
                      // onPress={() => this.setModalVisible("link")}
                      link={topic.elements.link}
                    />
                  </View>}
              </View>
            </ScrollView>
            <TouchableWithoutFeedback
              style={{
                width: winWidth,
                height: convert(30),
                alignItems: 'center',
                justifyContent: "center",
              }}
              onPress={onClose}
            >
              <Icon
                name="md-arrow-dropup"
                size={convert(24)}
                color={'#555'}
                onPress={onClose}
                style={{ marginBottom: convert(5) }}
              />
            </TouchableWithoutFeedback>
          </View>
          <View style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)', width: winWidth,
            height: this.props.topheight > MAX_HEIGHT ? winHeight - MAX_HEIGHT : winHeight - this.props.topheight,
          }}
            {...this._panResponder.panHandlers} />
        </View>
        
      </Modal>
    );
  }
}
