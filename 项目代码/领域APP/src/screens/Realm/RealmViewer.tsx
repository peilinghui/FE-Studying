import _ from 'lodash';
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import LinearGradient from 'react-native-linear-gradient'
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  Clipboard,
  ToastAndroid,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
} from 'react-native'
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation'
import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-x-helper'
import { darkLight } from '../../utils/ui-helper'
import BottomDrawer from '../../components/BottomDrawer'
import Colors from '../../constants/Colors'
import Swiper from 'react-native-swiper'
import { connect } from 'react-redux'
import { detail as realmDetail, hexCode as realmHexCode, getMembers, getUserSettings as getUserRealmSetting, setNotification } from '../../services/realm'
import KVDB from '../../services/kvdb'
import { realmTopics as getRealmTopics, getRealmTopicsSmall, topicTags } from '../../services/topic'
import { getShareRealmUrl, getRealmInvCode } from '../../services/feature';
import List from '../../components/TopicList'
import MemberList from "../../components/Realm/MemberList";
import ActionSheet from 'react-native-actionsheet'
import Avatar from '../../components/Avatar';
import moment from 'moment'
import 'moment/locale/zh-cn'
import { convert, winHeight, winWidth } from '../../utils/ratio';
import Zhugeio from 'react-native-plugin-zhugeio'
import { shallowEqualImmutable } from 'react-immutable-render-mixin';
import moonstack from '../../moonstack';
import { Select } from 'teaset';
import ScrollableTabView from 'react-native-scrollable-tab-view';

interface Props extends NavigationScreenProps {
  dispatch: Function
  user: any
  detail: {
    title: string
    intro: string
    coverImage: any
    computed: any
    statistics: any
  }
  backgroundColor: string
  lightBackground: boolean
  topics: any[];
}

interface State {
  currentTabIndex: number,
  backgroundColor: string,
  lightBackground: boolean,
  hasScrolledDown: boolean,
  realm: any,
  members: any[]
  userSet: boolean
  modifyRealm: any
  value: string
  tags: any[]
  isMember: boolean
}

@(connect(({ auth: { detail } }: any) => ({ user: detail })) as any)
export default class RealmViewerScreen extends moonstack.Component<Props, State> {
  static navigationOptions = {
    header: null
  }
  private swiper?: any
  private realmId: any
  topicList: any
  joinActionSheet: any
  addActionSheet: any
  exitActionSheet: any

  constructor(props: Props) {
    super(props, 'realm_viewer')
    this.realmId = this.props.navigation.getParam('realmId')

    this.state = {
      currentTabIndex: 0,
      backgroundColor: '#ffffff',
      lightBackground: false,
      hasScrolledDown: false,
      realm: {},
      members: [],
      userSet: true,
      modifyRealm: {},
      value: '最新讨论',
      tags: [],
      isMember: true
    }

    this.moon.bind(this.realmId)
    this.topicList = React.createRef()
    this.joinActionSheet = React.createRef()
    this.addActionSheet = React.createRef()
    this.exitActionSheet = React.createRef()
  }

  componentDidMount() {
    Zhugeio.startTrack('领域页面');
    this.refreshRealm()
    this.loadMembers()
    this.getTags()
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !shallowEqualImmutable(this.props, nextProps) || !shallowEqualImmutable(this.state, nextState);
  }

  componentWillUnmount() {
    Zhugeio.endTrack('领域页面', {});
    if (this.moon.hasMark('topic_created')) {
      this.props.dispatch({ type: 'list.realm/refresh' })
      this.props.dispatch({ type: 'list.joinedTopic/refresh' })
      this.moon.unmark('topic_created')
    }
    this.moon.unbind(this.realmId)
  }

  refreshRealm = async () => {
    const { user } = this.props
    const realmCache = await KVDB.get(`Realms:${this.realmId}:data`)
    if (realmCache) {
      this.setState({ realm: realmCache });
    }

    let hexCode = await KVDB.get(`Realms:${this.realmId}:backgroundHexCode`)
    if (hexCode) {
      this.setState({
        backgroundColor: '#' + hexCode,
        lightBackground: darkLight(hexCode) === 'light' ? true : false
      })
    }
    const realm = await realmDetail(this.realmId, user._id)
    KVDB.put(`Realms:${this.realmId}:data`, realm, 3600 * 48)
    if (!hexCode) {
      const { RGB } = await realmHexCode(realm.coverImage.url)
      hexCode = RGB.substr(2)
      KVDB.put(`Realms:${realm._id}:backgroundHexCode`, hexCode, 3600 * 48)
    }
    realm.computed.userInfo.isMember && this.getUserSettings()
    this.setState({
      realm,
      backgroundColor: '#' + hexCode,
      lightBackground: darkLight(hexCode) === 'light' ? true : false,
      value: realm.computed.userInfo.isMember ? '最新讨论' : '热门讨论',
      isMember: realm.computed.userInfo.isMember
    })
  }

  loadMembers = async () => {
    const members = await getMembers(this.realmId, 6)
    this.setState({ members })
  }

  //如果该成员没有加入领域是获取不到设置的，这个获取通知的设置
  getUserSettings = async () => {
    const { user } = this.props
    const settings = await getUserRealmSetting(this.realmId, user._id)
    this.setState({ userSet: settings.notification })
  }

  getTags = async () => {
    const alltags = await topicTags(this.realmId)
    const nameTags = alltags.map((item: any) => { return item.name })
    const nameFilterTag = nameTags.filter((item: string) => item !== "默认话题");
    const tags = _.concat(['最新讨论', '热门讨论'], nameFilterTag)
    this.setState({ tags })
  }

  join = () => {
    const { realm } = this.state
    const { membership, type } = realm
    if (type === 'purchase') {
      this.props.dispatch(NavigationActions.navigate({
        routeName: 'ShareRealm',
        params: { realm: realm, realmType: type },
      }))
    } else {
      if (membership === 'open') {
        this.addActionSheet.current.show()
      } else {
        this.joinActionSheet.current.show()
      }
    }
  }

  refreshTopics = () => {
    this.topicList.refresh()
  }

  render() {
    const { dispatch, user, navigation } = this.props;
    const {
      backgroundColor,
      realm,
      lightBackground,
      hasScrolledDown,
      currentTabIndex,
      members,
      userSet,
      modifyRealm,
      tags,
      isMember,
      value
    } = this.state;

    const { computed = {}, membership, type } = realm;
    const { userInfo = {} } = computed;
    const { memberType } = userInfo

    return (
      <View style={{ ...styles.container, backgroundColor }}>
        <StatusBar
          barStyle={lightBackground ? 'dark-content' : 'light-content'}
          backgroundColor="rgba(0,0,0,0.1)"
          translucent={true}
        />
        <View style={{
          paddingTop: getStatusBarHeight(true),
          zIndex: 1,
          ...(hasScrolledDown ? {
            backgroundColor: backgroundColor
          } : {})
        }}>
          <View
            style={{
              paddingHorizontal: convert(20),
              alignItems: 'center',
              height: convert(50),
              flexDirection: 'row',
            }}
          >
            <TouchableOpacity
              style={{ marginRight: convert(15) }}
              activeOpacity={0.7}
              onPress={() => navigation.pop()}
            >
              <Icon
                name={'ios-arrow-back'}
                size={convert(20)}
                style={{
                  lineHeight: convert(30),
                  color: hasScrolledDown && lightBackground ? 'black' : 'white',
                }}
              />
            </TouchableOpacity>
            <View>
              {realm &&
                <Text style={{
                  fontSize: convert(18),
                  lineHeight: convert(25),
                  maxWidth: winWidth - convert(140),
                  ...(hasScrolledDown && lightBackground ? {
                    color: 'black'
                  } : {
                      color: 'white'
                    })
                }}
                  numberOfLines={1}
                >{_.get(modifyRealm, 'title') ? modifyRealm.title : realm.title}</Text>}
              <Text style={{
                ...(hasScrolledDown && lightBackground ? {
                  color: 'black'
                } : {
                    color: 'white'
                  }), fontSize: convert(10)
              }}>{_.get(realm, 'creator.profile.nickname')}创立 · {_.get(realm, 'statistics.numOfMembers')}个成员</Text>
            </View>
            {!userSet &&
              <Icon
                name={'md-notifications-off'}
                size={convert(15)}
                style={{
                  lineHeight: convert(30),
                  color: Colors.darkGray,
                  marginLeft: convert(5)
                }}
              />}
            <TouchableOpacity
              style={{ marginLeft: 'auto' }}
              activeOpacity={0.7}
              onPress={() => {
                dispatch(NavigationActions.navigate({
                  routeName: 'ShareRealm',
                  params: { realm: realm, realmType: type },
                }))
              }}
            >
              <Icon
                name={'md-share'}
                size={convert(20)}
                style={{
                  lineHeight: convert(30),
                  color: hasScrolledDown && lightBackground ? 'black' : 'white',
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                this.exitActionSheet.current.show()
              }
              }>
              <Icon
                name={"ios-more"}
                size={convert(20)}
                style={{
                  marginLeft: convert(20),
                  lineHeight: convert(30),
                  color: hasScrolledDown && lightBackground ? 'black' : 'white',
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        {realm &&
          <ScrollView
            style={{
              position: 'absolute',
              top: convert(-30),
              left: 0,
              bottom: 0,
              right: 0
            }}
            contentContainerStyle={{ paddingTop: convert(200), paddingBottom: convert(140) }}
            scrollEventThrottle={60}
            onScroll={(event) => {
              if (event.nativeEvent.contentOffset.y >= 90 && !hasScrolledDown) {
                this.setState({ hasScrolledDown: true })
              } else if (event.nativeEvent.contentOffset.y < 90 && hasScrolledDown) {
                this.setState({ hasScrolledDown: false })
              }
            }}
          >
            <ImageBackground
              resizeMode={'cover'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: convert(200),
                width: '100%'
              }}
              source={{
                uri: _.get(modifyRealm, 'coverImageUrl') ? modifyRealm.coverImageUrl : _.has(realm, 'coverImage.url') ?
                  realm.coverImage.url +
                  '?imageMogr2/format/jpg/thumbnail/!300x200r/gravity/Center/interlace/1'
                  : undefined
              }}
            >
              <LinearGradient
                colors={[
                  lightBackground
                    ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)'
                  , backgroundColor
                ]}
                style={{
                  height: convert(200)
                }}
              />
            </ImageBackground>
            <View
              style={{
                paddingHorizontal: convert(20),
                paddingBottom: convert(20),
                backgroundColor
              }}
            >
              <View style={{
                borderRadius: convert(12),
                backgroundColor: type === 'public' && membership === 'open' ? 'transparent' : '#000000',
                alignSelf: 'flex-start',
                flexDirection: 'row',
                height: convert(24),
                alignItems: 'center',
              }}>
                <View style={{
                  backgroundColor: type === 'purchase' ? '#BB11E4'
                    : type === 'public' && membership === 'request' ? '#D67F56'
                      : _.has(realm, 'isPrivate') && realm.isPrivate ? 'red' : 'transparent',
                  width: convert(8),
                  height: convert(8),
                  margin: convert(7),
                  borderRadius: convert(4)
                }} />

                <Text numberOfLines={1} style={{
                  fontSize: convert(12),
                  color: '#fff',
                  marginRight: convert(7),
                }}>{type === 'purchase' ? '咖啡领域'
                  : type === 'public' && membership === 'request' ? '申请制'
                    : _.has(realm, 'isPrivate') && realm.isPrivate ? '私密领域' : null}</Text>
              </View>
              <Text
                style={{
                  marginTop: convert(10),
                  lineHeight: convert(30),
                  fontSize: convert(15),
                  color: lightBackground ? 'black' : 'white'
                }}
              >{_.get(modifyRealm, 'intro') ? modifyRealm.intro : realm.intro}</Text>
              {isMember ?
                <View
                  style={{
                    marginTop: convert(30),
                    backgroundColor:
                      lightBackground
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: convert(12),
                    overflow: 'hidden'
                  }}
                >
                  <Text
                    style={{
                      fontSize: convert(15),
                      padding: convert(15),
                      color: lightBackground ? 'black' : 'white',
                      fontWeight: 'bold'
                    }}
                  >我的领域成就</Text>
                  <View style={{
                    flexDirection: 'row',
                    marginBottom: convert(15)
                  }}>
                    <View
                      style={{
                        width: '33.33%',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: convert(24),
                          color: lightBackground ? 'black' : 'white'
                        }}
                      >{userInfo.numOfCreatedTopics}</Text>
                      <Text
                        style={{
                          fontSize: convert(13),
                          color: lightBackground ? '#777' : '#ddd'
                        }}
                      >发起讨论</Text>
                    </View>
                    <View
                      style={{
                        width: '33.33%',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: convert(24),
                          color: lightBackground ? 'black' : 'white'
                        }}
                      >{userInfo.numOfReceivedAgrees}</Text>
                      <Text
                        style={{
                          fontSize: convert(13),
                          color: lightBackground ? '#777' : '#ddd'
                        }}
                      >获得认同</Text>
                    </View>
                    <View
                      style={{
                        width: '33.33%',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: convert(24),
                          color: lightBackground ? 'black' : 'white'
                        }}
                      >{userInfo.numOfJoinedTopics}</Text>
                      <Text
                        style={{
                          fontSize: convert(13),
                          color: lightBackground ? '#777' : '#ddd'
                        }}
                      >参与讨论</Text>
                    </View>
                  </View>
                </View>
                :
                <View style={{ marginTop: convert(30) }}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={this.join}
                    style={{
                      height: convert(39),
                      borderRadius: convert(9),
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: convert(14), fontWeight: '500', }}>
                      {membership === 'open' ? '加入领域' : '申请加入'}
                    </Text>
                  </TouchableOpacity>
                </View>
              }
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Icon name='md-information-circle-outline' size={convert(16)} color='#999' />
                <Text
                  style={{ color: lightBackground ? '#555' : Colors.lightGray, marginTop: convert(14), marginLeft: convert(6) }}
                >{type === 'purchase' && _.has(realm, 'isPrivate') && realm.isPrivate ? '该领域需付费加入，内容对外完全不可见'
                  : type === 'purchase' ? '该领域需付费加入，所有人可见'
                    : type === 'public' && _.has(realm, 'isPrivate') && realm.isPrivate ? '该领域为私密领域，内容对外完全不可见'
                      : type === 'public' && membership === 'request' ? '该领域所有人可见，需要通过邀请或申请加入'
                        : '该领域所有人可见，可直接加入，无需申请'}</Text>
              </View>
              <View
                style={{
                  marginTop: convert(20),
                  backgroundColor:
                    lightBackground
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: convert(12),
                  overflow: 'hidden',
                  padding: convert(20),
                }}
              >
                <View style={{ flexDirection: 'row', width: '100%' }}>
                  <View style={{ marginTop: convert(3) }}>
                    <Avatar
                      onPress={() => dispatch(NavigationActions.navigate({
                        routeName: 'UserViewer',
                        params: {
                          userId: this.state.realm.creator._id
                        }
                      }))}
                      size={convert(36)}
                      user={realm.creator}
                    />
                  </View>
                  <View style={{ marginLeft: convert(10) }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={{ color: lightBackground ? 'black' : 'white', fontWeight: 'bold' }}>{_.get(realm, 'creator.profile.nickname')}</Text>
                      <Text style={{ marginLeft: convert(10), paddingHorizontal: convert(10), borderRadius: convert(12), fontSize: convert(12), lineHeight: convert(16), backgroundColor: Colors.lightGray, color: '#555' }}>创建者</Text>
                    </View>
                    <Text style={{ color: lightBackground ? '#555' : '#ddd', marginTop: convert(3), fontSize: convert(13) }}>
                      创立于{moment().from(realm.createdAt).replace('内', '前')}
                    </Text>
                  </View>
                </View>
              </View>
              <View
                style={{
                  marginTop: convert(20),
                  backgroundColor:
                    lightBackground
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: convert(12),
                  overflow: 'hidden',
                  padding: convert(20),
                }}
              >
                <Text
                  style={{
                    color: lightBackground ? 'black' : 'white',
                    fontSize: convert(15)
                  }}
                >{_.get(realm, 'statistics.numOfMembers')} 位领域成员</Text>
                <View style={{ flexDirection: 'row', marginTop: convert(10) }}>
                  {
                    members.map((member, index) =>
                      <View style={{ padding: convert(5) }} key={index}>
                        <Avatar size={convert(26)} user={member}></Avatar>
                      </View>
                    )
                  }
                  {
                    _.get(realm, 'statistics.numOfMembers', 0) > 6 &&
                    <View style={{ padding: convert(5), marginLeft: convert(5) }}>
                      <Icon size={convert(26)} name="ios-more" color={lightBackground ? 'black' : 'white'}></Icon>
                    </View>
                  }
                </View>
              </View>
            </View>
          </ScrollView>
        }
        <BottomDrawer
          topOffset={convert(60) + getStatusBarHeight(true)}
          bottomOffset={getBottomSpace() + convert(115)}
          renderBottomBar={this._renderBottomBar}
          roundedEdges={true}
          startUp={isMember}
          headerView={
            <View >
              <View style={{ height: convert(8), justifyContent: 'center', width: winWidth, alignItems: 'center' }}>
                <Image source={require('../../assets/indicator.png')}
                  style={{ marginTop: convert(6) }} />
              </View>
              <View
                style={{
                  borderBottomColor: '#f8f8f8',
                  borderBottomWidth: convert(1),
                  flexDirection: 'row',
                  height: convert(40),
                  alignItems: 'center'
                }}
              >

                <TouchableWithoutFeedback onPress={() => {
                  if (currentTabIndex === 0) {
                    return
                  }
                  this.setState({ currentTabIndex: 0 })
                  this.swiper.goToPage(0)
                }}>
                  <View
                    style={{
                      marginLeft: convert(15),
                      paddingHorizontal: convert(10),
                      borderRadius: convert(12),
                      backgroundColor:
                        currentTabIndex === 0 ?
                          Colors.lightGray :
                          'transparent'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: convert(14),
                        fontWeight: 'bold',
                        lineHeight: convert(36),
                        color:
                          currentTabIndex === 0 ?
                            Colors.tabIconSelected :
                            Colors.tabIconDefault
                      }}
                    >讨论</Text>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => {
                  if (currentTabIndex === 1) {
                    return
                  }
                  this.setState({ currentTabIndex: 1 })
                  this.swiper.goToPage(1)
                }}>
                  <View
                    style={{
                      marginLeft: convert(15),
                      paddingHorizontal: convert(10),
                      borderRadius: convert(12),
                      backgroundColor:
                        currentTabIndex === 1 ?
                          Colors.lightGray :
                          'transparent'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: convert(14),
                        fontWeight: 'bold',
                        lineHeight: convert(36),
                        color:
                          currentTabIndex === 1 ?
                            Colors.tabIconSelected :
                            Colors.tabIconDefault
                      }}
                    >成员</Text>
                  </View>
                </TouchableWithoutFeedback>

                <Select
                  size='md'
                  style={{
                    marginLeft: 'auto',
                    width: convert(90),
                    borderWidth: 0,
                    borderRadius: convert(10),
                    marginBottom: convert(5),
                    backgroundColor: Colors.lightGray,
                    marginRight: convert(10)
                  }}
                  valueStyle={{ color: Colors.blue }}
                  value={this.state.value}
                  items={tags}
                  pickerType='popover'
                  placeholder={'最新讨论'}
                  pickerTitle='Custom'
                  iconTintColor={Colors.blue}
                  onSelected={(item: any, index: any) => {
                    this.setState({ value: item })
                    this.topicList.refresh()
                  }}
                  placeholderTextColor={Colors.blue}
                />
              </View>
            </View>
          }
        >
          <ScrollableTabView
            renderTabBar={() => <View />}
            ref={(swiper: any) => {
              this.swiper = swiper;
            }}
            onChangeTab={
              (obj: { i: any; }) => {
                this.setState({ currentTabIndex: obj.i })
              }
            }
            activeTab={this.state.currentTabIndex}
            initialPage={0}
            tabBarBackgroundColor={'white'}
            tabBarUnderlineColor={'white'}
            tabBarActiveTextColor={'white'}
            tabBarInactiveTextColor={'white'}
            scrollWithoutAnimation={true}
          >
            <List
              ref={ref => this.topicList = ref}
              navigation={navigation}
              request={(cursorAt: string | null, limit: number) =>
                value === '热门讨论' ? getRealmTopicsSmall(this.realmId, user._id, cursorAt, limit)
                  : getRealmTopics(this.realmId, user._id, cursorAt, limit, this.state.value)
              }
              realmType={type}
              isMember={isMember}
              isPrivate={_.has(realm, 'isPrivate') ? realm.isPrivate : false}
            />
            <MemberList
              navigation={navigation}
              realm={realm}
            />
          </ScrollableTabView>
        </BottomDrawer>

        <ActionSheet
          ref={this.joinActionSheet}
          title='申请加入该领域'
          message='向领域主申请加入该领域'
          options={['一键向领域主申请', '取消']}
          cancelButtonIndex={1}
          onPress={async (index: number) => {
            const { dispatch } = this.props
            switch (index) {
              case 0:
                dispatch({
                  type: 'realm/requestJoin',
                  realmId: this.realmId,
                  callback: this.refreshRealm
                })
                Zhugeio.track('加入领域', {});
                break
              case 1:
              default:
            }
          }}
        />
        <ActionSheet
          ref={this.addActionSheet}
          title='是否确定加入该领域'
          message='将直接加入领域，可发起，查看和参与讨论'
          options={['确定加入', '取消']}
          cancelButtonIndex={1}
          onPress={async (index: number) => {
            const { dispatch } = this.props
            switch (index) {
              case 0:
                dispatch({
                  type: 'realm/addMember',
                  realmId: this.realmId,
                  callback: this.refreshRealm,
                })
                break
              case 1:
              default:
            }
          }}
        />
        {isMember ?
          memberType === 'creator' ?
            <ActionSheet
              ref={this.exitActionSheet}
              title='我想要'
              options={userSet ? ['修改领域', '复制领域链接', '关闭领域消息通知', '取消'] : ['修改领域', '复制领域链接', '打开领域消息通知', '取消']}
              cancelButtonIndex={3}
              onPress={async (index: number) => {
                const { dispatch } = this.props
                switch (index) {
                  case 0:
                    navigation.push('ModifyRealm', {
                      realm: realm,
                      callback: ((data: any) => {
                        this.setState({
                          modifyRealm: data,
                        })
                      }),
                    })
                    break
                  case 1:
                    const url = await getShareRealmUrl(realm._id, user._id);
                    Clipboard.setString(url);
                    ToastAndroid.show('复制成功', ToastAndroid.LONG)
                    break
                  case 2:
                    await setNotification(this.realmId, user._id, !this.state.userSet)
                    this.setState({ userSet: !this.state.userSet })
                    this.refreshRealm()
                    break

                  default:
                }
              }}
            />
            : <ActionSheet
              ref={this.exitActionSheet}
              title='我想要'
              options={userSet ? ['复制领域链接', '关闭领域消息通知', '退出该领域', '举报该领域', '取消'] : ['复制领域链接', '打开领域消息通知', '退出该领域', '举报该领域', '取消']}
              cancelButtonIndex={4}
              onPress={async (index: number) => {
                const { dispatch } = this.props
                switch (index) {
                  case 0:
                    const url = await getShareRealmUrl(realm._id, user._id);
                    Clipboard.setString(url);
                    ToastAndroid.show('复制成功', ToastAndroid.LONG)
                    break
                  case 1:
                    await setNotification(this.realmId, user._id, !this.state.userSet)
                    this.setState({ userSet: !this.state.userSet })
                    this.refreshRealm()
                    break
                  case 2:
                    dispatch({
                      type: 'realm/removeMember',
                      realmId: this.realmId,
                      callback: this.refreshRealm
                    })
                    break
                  case 3:
                    break
                  default:
                }
              }}
            />
          : <ActionSheet
            ref={this.exitActionSheet}
            title='我想要'
            options={['复制领域链接', '举报该领域', '取消']}
            cancelButtonIndex={2}
            onPress={async (index: number) => {
              const { dispatch } = this.props
              switch (index) {
                case 0:
                  const url = await getShareRealmUrl(realm._id, user._id);
                  Clipboard.setString(url);
                  ToastAndroid.show('复制成功', ToastAndroid.LONG)
                  break
                case 1:
                  break
                default:
              }
            }}
          />}
      </View>
    )
  }

  _renderBottomBar = () => {
    const {
      realm,
      isMember
    } = this.state;

    if (realm.hasOwnProperty('isActivated') && !realm.isActivated) {
      return (
        <View>
          <View
            style={{
              height: convert(40),
              backgroundColor: Colors.red,
              justifyContent: 'center',
              paddingHorizontal: convert(15)
            }}>
            <Text style={{ fontSize: convert(12), color: 'white' }}>
              领域不满4人，对外不可见，可通过分享邀请好友加入
                  </Text>
          </View>

          <View
            style={{
              marginTop: convert(2),
              borderTopColor: Colors.lightGray,
              borderTopWidth: 1,
              backgroundColor: '#fff',
              // height: convert(40)
            }}
          >
            <View
              style={{
                overflow: 'hidden',
                backgroundColor: Colors.lightGray,
                bottom: getBottomSpace(),
              }}
            >
              <TouchableWithoutFeedback
                style={{
                }}
                onPress={() => {
                  const { dispatch } = this.props
                  if (isMember) {
                    dispatch(StackActions.push({
                      routeName: 'TopicCreator',
                      params: { realmId: this.realmId, topicList: this.topicList.current }
                    }))
                  } else {
                    this.join()
                  }
                }}>
                <Image style={{
                  width: winWidth,
                  height: convert(38),
                  marginTop: convert(-1),
                  marginBottom: convert(3)
                }} source={require('../../assets/bottom.png')} />
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
      )
    }
    return (
      <View
        style={{
          // padding: convert(10),
          borderTopColor: Colors.lightGray,
          borderTopWidth: 1,
          backgroundColor: '#fff',
          // height: convert(40)
        }}
      >
        <View
          style={{
            overflow: 'hidden',
            backgroundColor: Colors.lightGray,
            bottom: getBottomSpace(),
          }}
        >
          <TouchableWithoutFeedback
            style={{
            }}
            onPress={() => {
              const { dispatch } = this.props
              if (isMember) {
                dispatch(StackActions.push({
                  routeName: 'TopicCreator',
                  params: { realmId: this.realmId, topicList: this.topicList.current }
                }))
              } else {
                this.join()
              }
            }}>
            {isMember ?
              <Image style={{
                width: winWidth,
                height: convert(38),
                marginTop: convert(-1),
                marginBottom: convert(3)
              }} source={require('../../assets/bottom.png')} />
              : <LinearGradient
                colors={['#2962ff', '#448aff']}
                start={{ y: 0.4, x: 0 }}
                style={{
                  paddingVertical: convert(5),
                  height: convert(40),
                  width: winWidth,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                <Text
                  style={{
                    fontSize: convert(14),
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >加入领域</Text>
              </LinearGradient>}
          </TouchableWithoutFeedback>
        </View>
      </View>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
})
