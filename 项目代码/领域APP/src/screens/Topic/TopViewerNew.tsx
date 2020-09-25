import _ from 'lodash'
import React from 'react'
import Axios, { CancelTokenSource } from 'axios'
import Layout from '../../constants/Layout'
import moment from 'moment'
import 'moment/locale/zh-cn'
import Icon from 'react-native-vector-icons/Ionicons'
import {
  Platform,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Keyboard,
  StatusBar,
  ScrollView,
  AppState,
  EmitterSubscription,
  AppStateStatus,
  ToastAndroid,
  Animated,
  Image,
  Clipboard,
  CameraRoll
} from 'react-native'
import { NavigationScreenProps, NavigationEvents, NavigationActions } from 'react-navigation'
import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-x-helper'
import MessageCard from '../../components/MessageCard'
import AutoHeightImage from 'react-native-auto-height-image'
import Colors from '../../constants/Colors'
import Avatar from '../../components/Avatar'
import { connect } from 'react-redux'
import { detail as topicDetail, reply, agree } from '../../services/topic'
import { topicMessages as loadTopicMessages } from "../../services/message"
import RealmModal from '../../components/Modal/Realm'
import TopicModal from '../../components/Modal/Topic'
import ShareModal from '../../components/Modal/ShareModal';
// import LinkModal from "../../components/Modal/LinkModal";
import TouchableIcon from "../../components/TouchableIcon"
import ActionSheet from 'react-native-actionsheet'
import ImagePicker from "react-native-image-crop-picker"
import { detail } from '../../services/realm';
import { convert, winWidth, winHeight } from '../../utils/ratio';
import { buildTopicCardHeight } from "../../components/TopicCard";
import TopTopicDrawer from "./TopTopicDrawer";
import Video from 'react-native-video';
import RealmCard from '../../components/Message/RealmCard'
import TopicCard from '../../components/Message/TopicCard';
import LinkCard from '../../components/Message/LinkCard';
import * as WeChat from 'react-native-wechat'
import ViewShot from 'react-native-view-shot'
import Hyperlink from 'react-native-hyperlink'
import Zhugeio from 'react-native-plugin-zhugeio'
import LookPhotoModal from '../../components/LookPhotoModal';
import ImageResizer from 'react-native-image-resizer';
import { shallowEqualImmutable } from 'react-immutable-render-mixin';
import moonstack from '../../moonstack';
import FastImage from 'react-native-fast-image';

interface Props extends NavigationScreenProps {
  dispatch: Function
  token: any
  user: any
  topics: {
    [key: string]: {
      messages: any[]
      cursorAt?: string
      hasNext?: boolean
    }
  };
}


interface State {
  appState: AppStateStatus,
  messageInputText: string,
  keyboardOn: boolean,
  keyboardHeight: number,
  modal: string,
  topic: any
  topicImages: any[]
  realm: any
  selectedMessage: any
  hasScrolledDown: boolean,
  indicatorVisible: boolean,
  isLoadingMessage: boolean
  visible: boolean
  itemID: any
  item2ID:any
  isMember:boolean
  imageIndex:number
}

@(connect(
  ({
    auth: { detail: user, token },
    "list.topicMessage": { topics }
  }: any) => ({ token, user, topics })
) as any)


export default class TopicViewerScreen extends moonstack.Component<Props, State> {
  static navigationOptions = {
    header: null
  };
  private topicId: any;
  private cancelRequest: CancelTokenSource;
  private keyboardSafeArea: number;
  private keyboardWillShowSub?: EmitterSubscription;
  private keyboardWillHideSub?: EmitterSubscription;
  private messageView?: any;
  private textInput?: any;
  private topicCardHeight: any
  ActionSheet: any;
  imageActionSheet: any;
  MyActionSheet: any
  private viewShot: any
  private messageRefs: { [refId: number]: any }

  constructor(props: Props) {
    super(props, 'topic_viewer');
    this.topicId = this.props.navigation.getParam("topicId");
    this.cancelRequest = Axios.CancelToken.source();
    this.keyboardSafeArea = getBottomSpace();
    this.messageView = React.createRef()
    const topicData = this.props.navigation.getParam("topicData");

    this.state = {
      appState: AppState.currentState,
      messageInputText: "",
      keyboardOn: false,
      keyboardHeight: this.keyboardSafeArea,
      modal: "",
      topic: topicData ? topicData : {},
      topicImages: _.get(topicData, 'elements.images'),
      selectedMessage: null,
      realm: {},
      hasScrolledDown: false,
      indicatorVisible: true,
      isLoadingMessage: false,
      visible: false,
      itemID: '',
      item2ID:'',
      isMember:true,
      imageIndex:0
    }
    this.viewShot = React.createRef()
    this.messageRefs = {}
  }

  componentDidMount() {
    Zhugeio.startTrack('讨论页面');
    AppState.addEventListener('change', this._handleAppStateChange)
    this.gettopicCardHeight()

    this.keyboardWillShowSub = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
      : Keyboard.addListener('keyboardDidShow', this.keyboardWillShow)
    this.keyboardWillHideSub = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
      : Keyboard.addListener('keyboardDidHide', this.keyboardWillHide)

    const { dispatch } = this.props

    dispatch({ type: 'list.topicMessage/fetch', topicId: this.topicId, action: 'update' })
    this.refreshTopic()
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !shallowEqualImmutable(this.props, nextProps) || !shallowEqualImmutable(this.state, nextState);
  }

  async gettopicCardHeight() {
    const { topic } = this.state;
    const dataWithHeight = await buildTopicCardHeight([topic])
    this.topicCardHeight = dataWithHeight[0].cardHeight + convert(20)
  }


  setModalVisible = (modal: string) => this.setState({ modal });

  _handleAppStateChange = (nextAppState: AppStateStatus) => {
    this.setState({ appState: nextAppState })
  }

  keyboardWillShow = (event: any) => {
    requestAnimationFrame(() => {
      this.setState({
        keyboardOn: true,
        keyboardHeight: event.endCoordinates.height,
        indicatorVisible: false,
      });
    });
    this.messageView.scrollToEnd({ animated: true })
  };

  keyboardWillHide = (event: any) => {
    requestAnimationFrame(() => {
      this.setState({
        keyboardOn: false,
        keyboardHeight: this.keyboardSafeArea,
        selectedMessage: null
      });
    });
  };

  componentWillUnmount() {
    Zhugeio.endTrack('讨论页面', {});
    AppState.removeEventListener("change", this._handleAppStateChange);
    this.keyboardWillShowSub!.remove();
    this.keyboardWillHideSub!.remove();
    this.cancelRequest.cancel();
    this.props.dispatch({
      type: "app/unsub",
      topicId: this.topicId
    });
    const { topic = {} } = this.state
    if (this.moon.hasMark('topic_message_created')) {
      if (topic.realm) {
        this.moon.call(`realm_viewer/${topic.realm._id}/refreshTopics`)
        this.props.dispatch({ type: 'list.joinedTopic/refresh' })
      }
      this.moon.unmark('topic_message_created')
    }
  }

  refreshTopic = async () => {
    const { user } = this.props
    const { topic } = this.state
    if(!_.get(topic,'content')){
      const topic = await topicDetail(this.topicId, user._id)
      this.setState({ topic, topicImages: _.get(topic, 'elements.images')})
    }
    const realm = await detail(topic.realm._id, this.props.user._id)
    this.setState({  realm,  isMember: realm.computed.userInfo.isMember })
  }

  async sendMessage() {
    const { dispatch } = this.props
    const { messageInputText: content, selectedMessage, visible } = this.state

    requestAnimationFrame(() => {
      this.setState({ messageInputText: '' })
    })

    this.textInput.clear()

    if (content.trim() === '') {
      ToastAndroid.show('不能发送空消息！', ToastAndroid.LONG)
      return
    }
    Zhugeio.track('发送讨论消息', {});
    dispatch({
      type: 'topic/reply',
      topicId: this.topicId,
      replyType: selectedMessage && visible ? 'reply' : 'text',
      ...(selectedMessage ? {
        elements: { messageId: selectedMessage._id }
      } : {}),
      content,
      callback: (message: any, refId: number) => {
        this.messageView.scrollToEnd({ animated: true })
        this.moon.mark('topic_message_created')
        if (refId) {
          this.messageRefs[refId] = message
        }
      },
    })
  }

  agreeMessage = (item: any) => {
    const { user } = this.props
    const { dispatch } = this.props
    if (item._id === this.state.itemID) {
      return
    }
    // if (!item.computed.userInfo.isAgreed) {
    this.messageView.scrollLock = true
    dispatch({ type: 'message/agree', message: item })
    Zhugeio.track('点击认同 - 认同消息', {});
    // }
    this.setState({ itemID: item._id })
  }

  agreeTopic = async () => {
    const { user } = this.props
    if (!_.get(this.state.topic, 'computed.userInfo.isAgreed')) {
      const topic = this.state.topic
      if (topic._id === this.state.item2ID) {
        return
      }
      await agree(topic._id, user._id)
      _.set(topic, 'computed.userInfo.isAgreed', true)
      Zhugeio.track('点击认同 - 认同主题', {});
      topic.statistics.numOfReceivedAgrees++
      this.setState({ topic, item2ID: topic._id })
    }
  }

  _contentViewScroll(e: any) {
    var offsetY = e.nativeEvent.contentOffset.y; //滑动距离
    var contentSizeHeight = e.nativeEvent.contentSize.height; //scrollView contentSize高度
    var oriageScrollHeight = e.nativeEvent.layoutMeasurement.height; //scrollView高度
    if (offsetY + oriageScrollHeight + convert(300) >= contentSizeHeight) {
      this.setState({ indicatorVisible: false })
    }
  }

  async loadMoreMessages() {
    if (this.state.isLoadingMessage) {
      return
    }

    this.setState({ isLoadingMessage: true }, () => {
      this.props.dispatch({
        type: 'list.topicMessage/next',
        topicId: this.topicId,
        action: 'append',
        callback: (len: number) => {
          if (len === 0) {
            this.messageView.keepScrollToEnd = false;
          }
          this.setState({ isLoadingMessage: false });
        }
      })
    })
  }

  render() {
    const { user, navigation, topics = {} } = this.props;
    if (!topics[this.topicId]) topics[this.topicId] = { messages: [] };
    const { topic, hasScrolledDown, indicatorVisible, } = this.state;
    const { statistics = {} } = topic;

    return (
      <View style={styles.container}>
        <NavigationEvents
          onDidFocus={() =>
            this.props.dispatch({ type: "app/sub", topicId: this.topicId })
          }
        />
        <StatusBar
          barStyle="dark-content"
          backgroundColor="rgba(0,0,0,0.1)"
          translucent={true}
        />
        <View style={styles.topView}>
          <TouchableOpacity
            style={{ alignSelf: "flex-start", marginRight: convert(23) }}
            activeOpacity={0.7}
            onPress={() => navigation.pop()}
          >
            <Icon
              name={"ios-arrow-back"}
              size={convert(26)}
              style={{ lineHeight: convert(30), color: "black" }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.midView}
            activeOpacity={0.7}
            onPress={() => {
              navigation.push("RealmViewer", {
                realmId: topic.realm._id
              });
            }}
          >
            <FastImage
              source={require("../../assets/logo.png")}
              style={{
                width: convert(15),
                height: convert(15),
                marginLeft: convert(5),
                marginRight: convert(5),
                backgroundColor: "transparent",
                borderRadius: convert(5)
              }}
            />
            {_.has(topic, "realm.title") && (
              <Text style={styles.titleText}>{topic.realm.title}</Text>
            )}
          </TouchableOpacity>
          <View style={{ flexDirection: "row" }}>
            <TouchableIcon
              name={"md-share"}
              style={{ marginTop: convert(6) }}
              color="black"
              size={convert(20)}
              onPress={async () => {
                const tag = await this.viewShot.current.capture()
                this.props.navigation.push("ShareLongPic", {
                  previewSource: tag,
                  topic: topic
                });
              }}
            />
            <TouchableIcon
              name={"ios-more"}
              color="black"
              size={convert(26)}
              style={{
                marginLeft: convert(20),
                alignSelf: "flex-end"
              }}
              onPress={() => {
                navigation.push("TopicSetting", {
                  topicId: this.topicId,
                  topic: topic,
                  userId: user._id
                });
              }}
            />
          </View>
        </View>
        <View
          ref="full"
          style={{ backgroundColor: Colors.lightGray, height: convert(1), width: winWidth }} />
        <TopTopicDrawer
          topic={topic}
          topheight={this.topicCardHeight}
          onPressAvatar={(user: { _id: any; }) => {
            this.props.navigation.push('UserViewer', { userId: user._id })
          }}
          onPressAgreeTopic={this.agreeTopic}
          visible={this.state.modal === "currentTopic"}
          onClose={() => this.setModalVisible("")}
        />

        <ScrollView
          style={{ backgroundColor: '#fff', height: '100%', marginTop: 0 }}
          contentContainerStyle={{
            paddingTop: 0,
            paddingBottom: convert(75),
          }}
          ref={ref => this.messageView = ref}
          scrollEventThrottle={20}
          onScroll={(event) => {
            if (event.nativeEvent.contentOffset.y >= this.topicCardHeight && !hasScrolledDown) {
              this.setState({ hasScrolledDown: true })
            } else if (event.nativeEvent.contentOffset.y < this.topicCardHeight && hasScrolledDown) {
              this.setState({ hasScrolledDown: false })
            }
          }}
          onMomentumScrollEnd={(event) => this._contentViewScroll(event)}
        >
          <ViewShot
            ref={this.viewShot}
          >
            <View
              style={{
                marginTop: convert(2),
                paddingVertical: convert(20),
                backgroundColor: 'white'
              }}
            >
              {this._renderTopic()}

              <View style={{ flex: 1 }}>
                <FlatList
                  style={{ flexGrow: 0 }}
                  contentContainerStyle={{ paddingVertical: 10 }}
                  onEndReached={() => {
                    this.loadMoreMessages()
                  }}
                  data={topics[this.topicId].messages}
                  keyExtractor={(item, index) => item + index}
                  onLayout={() => {
                    if (this.messageView.keepScrollToEnd) {
                      this.messageView.scrollToEnd({ animated: true })
                    }
                  }}
                  renderItem={({ item, index }) => (
                    <MessageCard
                      message={item}
                      fromMyself={item.fromUser && item.fromUser._id === user._id}
                      onAgree={() => this.agreeMessage(item)}
                      onSelected={() => {
                        this.setState({ selectedMessage: item },
                          () => item.fromUser && item.fromUser._id === user._id ? this.MyActionSheet.show() : this.ActionSheet.show()
                        )
                      }}
                      key={index}
                      onPressAvatar={() => {
                        navigation.push('UserViewer', {
                          userId: item.fromUser._id
                        })
                      }}
                    />
                  )}
                  ListEmptyComponent={
                    <View style={{
                      paddingTop: convert(50),
                      backgroundColor: '#fff',
                      height: '100%'
                    }}>
                      <Text
                        style={{
                          fontSize: convert(20),
                          color: Colors.darkGray,
                          alignSelf: 'center',
                          fontWeight: '600'
                        }}
                      >
                        发表第一条回复
                  </Text>
                    </View>
                  }
                />
                <ActionSheet
                  ref={(o: any) => this.ActionSheet = o}
                  title={this.state.selectedMessage ? this.state.selectedMessage.content : null}
                  options={['复制', '引用', '举报', '取消']}
                  cancelButtonIndex={3}
                  destructiveButtonIndex={1}
                  onPress={(index: number) => {
                    switch (index) {
                      case 0:
                        Clipboard.setString(this.state.selectedMessage.content);
                        break
                      case 1:
                        this.textInput.()
                        setTimeout(() => {
                          this.textInput.focus()
                        }, 100)
                        this.setState({ visible: true })
                        break
                      case 2:
                        break
                      case 3:
                      default:
                    }
                  }}
                />
                <ActionSheet
                  ref={(o: any) => this.MyActionSheet = o}
                  title={this.state.selectedMessage ? this.state.selectedMessage.content : null}
                  options={['复制', '引用', '撤回消息', '举报', '取消']}
                  cancelButtonIndex={4}
                  destructiveButtonIndex={1}
                  onPress={(index: number) => {
                    const { selectedMessage } = this.state
                    switch (index) {
                      case 0:
                        Clipboard.setString(this.state.selectedMessage.content);
                        break
                      case 1:
                        this.textInput.blur()
                        setTimeout(() => {
                          this.textInput.focus()
                        }, 100)
                        this.setState({ visible: true })
                        break
                      case 2:
                        this.props.dispatch({
                          type: 'message/recall',
                          message: selectedMessage.refId ?
                            this.messageRefs[selectedMessage.refId] :
                            selectedMessage,
                          refId: selectedMessage.refId,
                          callback: () => {
                            this.setState({ selectedMessage: null })
                          }
                        })
                        break
                      case 3:
                        break
                      case 4:
                      default:
                    }
                  }}
                />


              </View>
            </View>

          </ViewShot>
        </ScrollView>


        {indicatorVisible && _.get(topic, 'statistics.numOfMessages') > 10 &&
          <TouchableWithoutFeedback
            onPress={() => {
              this.messageView.keepScrollToEnd = true;
              this.messageView.scrollToEnd({ animated: true })
            }}
            style={{ backgroundColor: '#fff' }}
          >
            <View
              style={{
                flexDirection: 'row',
                height: convert(30),
                width: convert(90),
                position: 'absolute',
                overflow: 'hidden',
                right: 0,
                bottom: convert(110),
                backgroundColor: '#fff',
                borderBottomLeftRadius: convert(15),
                borderTopLeftRadius: convert(15),
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: Colors.lightGray,
                borderWidth: convert(1),
                elevation: 5,
              }}>
            <FastImage style={{ width: convert(10), height: convert(10), marginLeft: convert(8) }}
                source={require('../../assets/down.png')} />
              <Text
                style={{
                  fontSize: convert(12),
                  color: Colors.blue,
                  marginLeft: convert(5),
                  fontWeight: '400',
                  fontFamily: 'SFProText-Semibold',
                }}
              >{statistics.numOfMessages}条消息</Text>
            </View>
          </TouchableWithoutFeedback>}
        {hasScrolledDown ?
          this._renderTopView()
          : <View />}

        {this._renderBottomBar()}
      </View>
    );
  }

  _renderTopic = () => {
    const { navigation } = this.props;
    const { topic, topicImages,isMember } = this.state;
    const { statistics = {} } = topic;
 
    return (
      <View>
        <View
          style={{
            flexDirection: 'row',
            marginBottom: convert(20),
            paddingHorizontal: convert(20),
          }}>
          <Avatar
            user={topic.creator}
            size={36}
            onPress={() => {
              navigation.push('UserViewer', {
                userId: this.state.topic.creator._id,
              })
            }}
          />
          <View style={{ marginLeft: convert(15), flex: 1, flexDirection: 'column' }}>
            <Text style={{ fontSize: convert(12), lineHeight: convert(16), color: 'black', fontWeight: 'bold' }}>{
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
              fontSize: convert(11),
              marginRight: convert(5),
              color: Colors.darkGray,
              marginTop: convert(7),
            }}
          >{statistics.numOfReceivedAgrees}</Text>
          <TouchableIcon
            name="md-thumbs-up"
            size={24}
            color={_.get(this.state.topic, 'computed.userInfo.isAgreed') ? Colors.blue : '#555'}
            onPress={this.agreeTopic}
          />
        </View>
        <Hyperlink linkDefault={true} linkStyle={{ color: Colors.blue, fontSize: convert(12) }}>
          <Text
            style={{
              fontSize: convert(13),
              lineHeight: convert(24),
              paddingHorizontal: convert(20),
              marginBottom: convert(20),
              color: 'black'
            }}
          >{topic.content}</Text>
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
                left: winWidth / 2 - convert(25),
                position: 'absolute',
              }}
              size={convert(50)}
              name="md-play-circle"
              color='#fff'
              onPress={() => this.props.navigation.push('VideosViewer', {
                videoURL: topic
              })}
            /></View>}
        {
          (topic.type === 'image' && _.has(topic, 'elements.images')) &&
          _.map(topicImages, (image,index) =>
            <View style={{ marginBottom: convert(20) }} key={image._id}>
              <TouchableWithoutFeedback onPress={() => {
                this.setModalVisible("imageModel"),this.setState({imageIndex:index})}}>
                <AutoHeightImage
                  style={{
                    backgroundColor: Colors.lightGray
                  }}
                  width={Layout.screen.width}
                  source={{
                    uri: image.url
                      + (image.disableQiniu ? '' : '?imageMogr2/auto-orient/format/jpg/interlace/1/size-limit/$(fsize)')
                  }}
                  onError={(error) => {
                    if (_.findIndex(topicImages, _.matches({ disableQiniu: true })) === -1) {
                      let copyImages = _.cloneDeep(topicImages)
                      let img = _.find(copyImages, image) as any
                      img.disableQiniu = true;
                      this.setState({ topicImages: copyImages })
                    }
                  }}
                />
              </TouchableWithoutFeedback>
            </View>
          )
        }
        {topic.type === 'video' && _.get(topic, 'elements.videos.0.url') &&
          <View>
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
                left: winWidth / 2 - convert(25),
                position: 'absolute',
              }}
              size={convert(50)}
              name="md-play-circle"
              color='#fff'
              onPress={() => this.props.navigation.push('VideosViewer', {
                videoURL: topic
              })}
            /></View>}
        {topic.type === 'realm' &&
          <RealmCard
            onPress={() =>
              this.props.navigation.push("RealmViewer", {
                realmId: topic.elements.realm._id,
              })}
            realm={topic.elements.realm}
            styles={{
              margin: convert(20),
              width: winWidth - convert(40)
            }}
          />
        }
        {topic.type === 'topic' &&
          <TopicCard
            onPress={() =>
              this.props.navigation.push("TopicViewer", {
                topicId: topic.elements.topic._id,
                topicData: topic.elements.topic
              })}
            onPressAvatar={(user: { _id: any; }) => {
              this.props.navigation.push('UserViewer', { userId: user._id })
            }}
            topic={topic.elements.topic}
            styles={{
              margin: convert(20),
              width: winWidth - convert(40)
            }}
          />
        }
        {topic.type === 'link' && _.get(topic, 'elements.link') &&
          <View
            style={{
              margin: convert(15),
              height: convert(180)
            }}
          >
            <LinkCard
              onPress={() => {
                navigation.push("LinkModal", {
                  topic: topic,
                });
              }}
              link={_.get(topic, 'elements.link')}
            />
          </View>}

        {
          _.get(topic, 'statistics.numOfMessages') !== 0 ? <View
            style={{
              flexDirection: 'row',
              marginTop: convert(10),
              marginBottom: convert(5),
              paddingHorizontal: convert(20),
              backgroundColor: Colors.lightGray,
              height: convert(30),
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                fontSize: convert(12),
                lineHeight: convert(16),
                marginRight: convert(3)
              }}
            >
              {
                statistics.numOfMessages
              } 条消息 · {statistics.numOfMembers} 人参与
                                        </Text>
          </View>
            : <View
              style={{
                backgroundColor: Colors.lightGray,
                height: convert(10),
              }}
            />
        }
      </View>
    );
  }

  _renderTopView = () => {
    const { topic, hasScrolledDown } = this.state;
    return (
      <TouchableWithoutFeedback
        onPress={() => this.setModalVisible("currentTopic")}
      >
        <View
          onLayout={(e: any) => {
            // this.setState({ })
          }}
          style={{
            position: "absolute",
            overflow: 'hidden',
            top: getStatusBarHeight() + convert(50),
            left: 0,
            right: 0,
            height: convert(50),
            elevation: 2,
            borderbottomColor: Colors.lightGray,
            borderbottomWidth: convert(1),
            backgroundColor: "#fff",
          }}
        >
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: convert(20),
            alignItems: 'center',
            height: convert(50),
          }}>
            <Avatar
              size={convert(30)}
              activeStatus={false}
              user={topic.creator}
            />
            <View style={{ marginLeft: convert(15), flex: 1, flexDirection: 'column' }}>
              <Text style={{ fontSize: convert(14) }}>{
                _.get(topic, 'creator.profile.nickname')
              }</Text>
              <View style={{ flexDirection: 'row', marginTop: convert(5) }}>
                <Hyperlink linkDefault={true} linkStyle={{ color: Colors.blue, fontSize: convert(12) }}>
                  <Text style={{ lineHeight: convert(20), fontSize: convert(12), }} numberOfLines={1} >{topic.content}</Text>
                </Hyperlink>
              </View>
            </View>

            <View style={{ marginLeft: 'auto' }}>
              <Icon
                name="md-arrow-dropdown"
                size={convert(24)}
                color={'#555'}
                onPress={() => this.setModalVisible("currentTopic")}
              />
            </View>

          </View>
        </View>
      </TouchableWithoutFeedback>

    );
  }

  _renderBottomBar = () => {
    const { topic, keyboardOn, selectedMessage, modal, realm, keyboardHeight, messageInputText, visible, isMember, imageIndex } = this.state;
    return (
      <Animated.View
        onLayout={(e: any) => {
          // this.setState({ })
        }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom:
            Platform.OS === "android" ? 0 : keyboardHeight,
          elevation: 20,
          padding: convert(10),
          borderTopColor: Colors.lightGray,
          borderTopWidth: 1,
          backgroundColor: "#fff"
        }}
      >
        {keyboardOn &&
          (selectedMessage && visible ? (
            <View
              style={{
                padding: 5,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between"
              }}
            >
              <Hyperlink linkDefault={true} linkStyle={{ color: Colors.blue, fontSize: convert(12) }}>
                <Text>正在引用:{selectedMessage.content}</Text>
              </Hyperlink>
              <TouchableIcon
                name="md-close"
                onPress={() => this.setState({ selectedMessage: null })}
              />
            </View>
          ) : (
              <View
                style={{
                  paddingHorizontal: convert(5),
                  marginTop: 0,
                  paddingBottom: convert(15),
                  flexDirection: "row",
                  alignSelf: "flex-end"
                }}
              >
              <TouchableWithoutFeedback onPress={() => this.imageActionSheet.show()}>
                <FastImage source={require('../../assets/addPhoto.png')} style={{width:convert(20),height:convert(20)}}/>
              </TouchableWithoutFeedback>

              <TouchableWithoutFeedback onPress={() => this.setModalVisible("topic")}>
                <FastImage source={require('../../assets/ArtboardArtboard.png')} style={{ width: convert(20), height: convert(20), marginLeft: convert(20) }} />
              </TouchableWithoutFeedback>

              <TouchableWithoutFeedback onPress={() => this.setModalVisible("realm")}>
                <FastImage source={require('../../assets/addlingyu.png')} style={{ width: convert(20), height: convert(20), marginLeft: convert(20) }} />
              </TouchableWithoutFeedback>
              </View>
            ))}
        <ActionSheet
          ref={(o: any) => (this.imageActionSheet = o)}
          title="选择图片"
          options={["相册", "相机", "取消"]}
          cancelButtonIndex={2}
          onPress={async (index: number) => {
            const { dispatch } = this.props;
            switch (index) {
              case 0:
                dispatch({ type: "file/qiniuToken" });
                const images = await ImagePicker.openPicker({
                  multiple: false,
                  // cropping: true,
                  mediaType: "photo"
                });
                if (!Array.isArray(images)) {
                  ImageResizer.createResizedImage(images.path, 8, 6, 'JPEG', 80)
                    .then(({ uri }) => {
                      dispatch({ type: "app/showLoading" });
                      dispatch({
                        type: "file/upload",
                        files: [images],
                        callbackAction: {
                          type: "topic/replyImages",
                          topicId: this.topicId
                        },
                        callback: () => {
                          dispatch({ type: "app/hideLoading" });
                          this.moon.mark('topic_message_created')
                        }
                      });
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }

                break;
              case 1:
                dispatch({ type: "file/qiniuToken" });
                const image = await ImagePicker.openCamera({
                  // cropping: true,
                  multiple: false,
                  mediaType: "photo"
                });
                if (!Array.isArray(image)) {
                  ImageResizer.createResizedImage(image.path, 8, 6, 'JPEG', 80)
                    .then(({ uri }) => {
                      dispatch({ type: "app/showLoading" });
                      dispatch({
                        type: "file/upload",
                        files: [image],
                        callbackAction: {
                          type: "topic/replyImages",
                          topicId: this.topicId
                        },
                        callback: () => {
                          dispatch({ type: "app/hideLoading" });
                          this.moon.mark('topic_message_created')
                        }
                      });
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }
                break;
              case 2:
              default:
            }
          }}
        />
        <TopicModal
          visible={modal === "topic"}
          onClose={() => this.setModalVisible("")}
          onPress={item => {
            const { dispatch } = this.props;
            this.setModalVisible("");
            dispatch({ type: "app/showLoading" });
            this.props.dispatch({
              type: "topic/reply",
              topicId: this.topicId,
              replyType: "topic",
              content: "[话题]",
              elements: { topicId: item._id },
              callback: () => {
                dispatch({ type: "app/hideLoading" });
                this.moon.mark('topic_message_created')
              }
            });
          }}
        />
        <RealmModal
          visible={modal === "realm"}
          onClose={() => this.setModalVisible("")}
          onPress={item => {
            const { dispatch } = this.props;
            this.setModalVisible("");
            dispatch({ type: "app/showLoading" });
            this.props.dispatch({
              type: "topic/reply",
              topicId: this.topicId,
              replyType: "realm",
              content: "[领域]",
              elements: { realmId: item._id },
              callback: () => {
                dispatch({ type: "app/hideLoading" });
                this.moon.mark('topic_message_created')
              }
            });
          }}
        />
        <ShareModal
          visible={modal === "share"}
          onClose={() => this.setModalVisible("")}
          onPress={async (index) => {
            const wechatInstalled = await WeChat.isWXAppInstalled()
            const imageURL = 'https://m.atrealm.com/topics/' + this.topicId
            const path = '/pages/realm/topic-detail/topic-detail?topicId=' + this.topicId
            if (wechatInstalled) {
              if (index === 0) {
                await WeChat.launchMini({
                  userName: 'gh_388b2b756428',
                  miniProgramType: 0,
                  path: path
                })
              } else if (index === 1) {
                await WeChat.shareToSession({
                  // type: 'miniProgram',
                  // title: '邀请你加入讨论',
                  // hdImageData: _.get(topic.creator, 'profile.avatar.url'),
                  // thumbImage: _.get(topic.creator, 'profile.avatar.url'),
                  // description: '邀请你加入讨论',
                  // userName: 'gh_388b2b756428',//小程序ID
                  // webpageUrl: 'http://www.qq.com',
                  // miniProgramType: 0,//0-正式，1-开发，2-体验）
                  // withShareTicket: true,
                  // path:path,

                  type: 'news',
                  thumbImage: _.get(topic.creator, 'profile.avatar.url'),
                  title: '我们正在讨论',
                  description: '我们正在讨论',
                  webpageUrl: imageURL,
                })
              } else if (index === 2) {
                await WeChat.shareToTimeline({
                  type: 'news',
                  thumbImage: _.get(topic.creator, 'profile.avatar.url'),
                  title: '我们正在讨论',
                  description: '我们正在讨论',
                  webpageUrl: imageURL,
                });
              } else if (index === 3) {
                const tag = await this.viewShot.current.capture()
                // try {
                //   await CameraRoll.saveToCameraRoll(tag, 'photo')
                //   ToastAndroid.show('已保存到相册', ToastAndroid.LONG)
                // } catch (error) {
                //   ToastAndroid.show('没有储存权限，无法保存', ToastAndroid.LONG)
                // }   
                this.props.navigation.push("ShareLongPic", {
                  previewSource: tag,
                  topic: topic
                });
              } else if (index === 4) {
                Clipboard.setString(imageURL);
              }
            } else {
              ToastAndroid.show('未安装微信', ToastAndroid.LONG)
            }
            this.setModalVisible("");
          }}
        />

        <LookPhotoModal
          modalVisible={modal === "imageModel"}
          currentImage={imageIndex}
          imageData={_.get(topic, 'elements.images') || []}
          cancel={() => this.setModalVisible("")} />


        {/* {_.get(topic, 'elements.link') && <LinkModal
          visible={modal === "link"}
          onClose={() => this.setModalVisible("")}
          onPress={item => {
            this.setModalVisible("");
          }}
          topic={topic}
        />} */}

        {isMember? (
          <View
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <View
              style={{
                borderRadius: convert(15),
                overflow: 'hidden',
                backgroundColor: Colors.lightGray,
                paddingLeft: convert(10),
                marginTop: -convert(5),
                marginBottom: convert(5),
                //bottom: getBottomSpace() + convert(2),
                width: winWidth - convert(50),
              }}>
              <TextInput
                style={{
                  textAlignVertical: 'center',
                  padding: convert(5)
                }}
                value={messageInputText}
                placeholder="说说你的想法"
                onChangeText={messageInputText =>
                  this.setState({ messageInputText })
                }
                returnKeyType={"send"}
                onSubmitEditing={() => this.sendMessage()}
                blurOnSubmit={false}
                ref={ref => (this.textInput = ref)}
                multiline={true}
                onFocus={() => {
                  this.messageView.keepScrollToEnd = true;
                  this.messageView.scrollToEnd({ animated: true })
                }}
                underlineColorAndroid="transparent"
              />
            </View>
            <TouchableIcon name='md-arrow-dropup-circle' size={convert(30)} color={messageInputText.trim() === '' ? Colors.darkGray : Colors.blue}
              style={{ marginLeft: convert(7.5), marginRight: convert(17.5), marginTop: -convert(5), marginBottom: convert(5), }}
              onPress={() => this.sendMessage()} />
          </View>
        ) : (
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{
                  borderRadius: convert(15),
                  overflow: "hidden",
                  backgroundColor: Colors.lightGray,
                  paddingLeft: convert(10),
                  marginTop: convert(-5),
                  marginBottom: convert(5),
                  width: winWidth - convert(20),
                }}
                activeOpacity={0.8}
                onPress={() => {
                  this.props.navigation.push('RealmViewer', {
                    realmId: realm._id
                  })
                }}
              >
                <Text style={{ paddingHorizontal: convert(5), paddingVertical: convert(7.5) }}>加入领域才能参与讨论</Text>
              </TouchableOpacity>
            </View>
          )}
      </Animated.View >
    );
  };
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: getStatusBarHeight(true)
  },
  topView: {
    paddingHorizontal: convert(20),
    paddingVertical: convert(10),
    height: convert(50),
    flexDirection: "row",
    justifyContent: 'space-between',
  },
  midView: {
    borderRadius: convert(12),
    backgroundColor: Colors.lightGray,
    height: convert(30),
    flexDirection: "row",
    marginLeft: convert(20),
    alignItems: 'center',
  },
  midText: {
    fontSize: convert(14),
    lineHeight: convert(30),
    color: Colors.blue
  },
  titleText: {
    marginLeft: convert(7),
    marginRight: convert(5),
    fontSize: convert(13),
    lineHeight: convert(30)
  },
  scrollCon: {
    backgroundColor: "white",
    marginTop: convert(5)
  }
});               
