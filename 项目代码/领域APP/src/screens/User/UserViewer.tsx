import _ from 'lodash'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  FlatList,
  TouchableWithoutFeedback,
  ImageBackground,
} from 'react-native'
import { NavigationEvents, NavigationScreenProps, StackActions } from 'react-navigation'
import Colors from '../../constants/Colors'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { connect } from 'react-redux'
import Avatar from '../../components/Avatar'
import RealmCard from '../../components/User/RealmCard'
import AddFigureModal from '../../components/Modal/AddFigure'
import FigureModal from '../../components/Modal/Figure'
import Button from '../../components/Button'
import SocialCardView from '../../components/SocialCardView'
import { winWidth, convert } from '../../utils/ratio';
import ImagePicker from 'react-native-image-crop-picker'
import ActionSheet from 'react-native-actionsheet'
import Zhugeio from 'react-native-plugin-zhugeio'
import RealmDrawerModel from "./RealmDrawer";
import { shallowEqualImmutable } from 'react-immutable-render-mixin';
import { Dispatch } from 'redux'

interface Props extends NavigationScreenProps {
  dispatch: Dispatch<any>
  user: any;
  currentUser: any;
  commonFriends: any[]
  commonFriendsCount: number
  figures: any[]
  cards: any[]
  features: any[]
  mostActiveRealms: any[]
}

interface State {
  hasScrolledDown: boolean;
  user?: any;
  modal: string
  figure: string | null
  figureAgreeCount: number
  images: any
  indexId: number
}

@(connect(
  ({
    auth: { detail: currentUser },
    user: { detail: user, commonFriends = {}, figures, cards, features, mostActiveRealms }
  }: any) => {
    const { count = 0, data = [] } = commonFriends
    return {
      user,
      currentUser,
      commonFriends: data.slice(0, 3),
      commonFriendsCount: count,
      figures,
      cards, features,
      mostActiveRealms,
    }
  }) as any)
export default class UserViewerScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null
  }

  private userId: any
  private imageActionSheet: any

  constructor(props: Props) {
    super(props)
    this.userId = this.props.navigation.getParam('userId')
    this.state = {
      hasScrolledDown: false,
      modal: '',
      figure: null,
      figureAgreeCount: 0,
      images: '',
      indexId: 0
    }
    this.imageActionSheet = React.createRef()
  }

  componentDidMount() {
    if (this.userId === this.props.currentUser._id) {
      Zhugeio.startTrack('个人用户主页');
    } else {
      Zhugeio.startTrack('他人用户主页');
    }
   this.props.dispatch({
      type: 'user/detail',
      userId: this.userId,
    })
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !shallowEqualImmutable(this.props, nextProps) || !shallowEqualImmutable(this.state, nextState);
  }

  componentWillUnmount() {
    if (this.userId === this.props.currentUser._id) {
      Zhugeio.startTrack('个人用户主页');
    } else {
      Zhugeio.startTrack('他人用户主页');
    }
  }

  imagePicker = async (index: number) => {
    const { dispatch } = this.props
    switch (index) {
      case 0:
        const image = await ImagePicker.openPicker({ multiple: false, mediaType: 'photo' })
        dispatch({ type: 'user/updateProfileCover', image })
        this.setState({ images: image })
        break
      case 1:
        const cameraImage = await ImagePicker.openCamera({ mediaType: 'photo' })
        dispatch({ type: 'user/updateProfileCover', image: cameraImage })
        this.setState({ images: cameraImage })
        break
      case 2:
      default:
    }
  }

  render() {
    const {
      dispatch,
      user = {},
      currentUser = {},
      commonFriends,
      commonFriendsCount,
      figures,
      cards, features,
      mostActiveRealms,
    } = this.props
  
    const { profile = {}, statistics = {}, _id: userId } = user
    const { numOfReceivedAgrees, numOfFollowers, numOfFollowees } = statistics
    const { intro } = profile
    const { images,indexId,modal } = this.state
    const FOLLOW_STATUS: { [key: string]: string } = {
      none: '关注',
      followee: '已关注',
      follower: '回关',
      mutual: '好友'
    };
    return (
      <View style={styles.container}>
        <NavigationEvents
          // onWillFocus={() => this.props.dispatch({
          //   type: 'user/detail',
          //   userId: this.userId,
          // })}
        />
        <StatusBar
          barStyle="light-content"
          backgroundColor="rgba(0,0,0,0.1)"
          translucent={true}
        />
        <View
          style={{
            flex: 0,
            paddingHorizontal: convert(20),
            paddingBottom: convert(10),
            paddingTop: convert(10) + getStatusBarHeight(true),
            height: convert(50) + getStatusBarHeight(true),
            flexDirection: 'row',
            zIndex: convert(10),
            ...(this.state.hasScrolledDown ? {
              backgroundColor: '#ffffff'
            } : {})
          }}
        >
          <TouchableOpacity
            style={{
              marginRight: convert(15),
              alignSelf: 'flex-start'
            }}
            activeOpacity={0.7}
            onPress={() => this.props.navigation.pop()}
          >
            <Icon
              name="ios-arrow-back"
              size={convert(26)}
              style={{
                lineHeight: convert(30),
                ...(this.state.hasScrolledDown ? {
                  color: 'black'
                } : {
                    color: 'white'
                  })
              }}
            />
          </TouchableOpacity>
          {
            this.state.hasScrolledDown && (
              <Text style={{
                fontSize: convert(16),
                lineHeight: convert(30),
                fontWeight: 'bold',
                color: 'black'
              }}>{profile.nickname}</Text>
            )
          }
        </View>
        <ScrollView
          style={{
            position: 'absolute',
            top: convert(-30),
            left: 0,
            bottom: 0,
            right: 0
          }}
          scrollEventThrottle={60}
          onScroll={(event) => {
            if (event.nativeEvent.contentOffset.y >= 130 && !this.state.hasScrolledDown) {
              this.setState({ hasScrolledDown: true })
            } else if (event.nativeEvent.contentOffset.y < 130 && this.state.hasScrolledDown) {
              this.setState({ hasScrolledDown: false })
            }
          }}
        >
          <View style={{ height: convert(280) }}>
            <TouchableWithoutFeedback
              onPress={() => this.imageActionSheet.current.show()}>
              <View
                style={{
                  height: convert(230),
                  backgroundColor: Colors.darkGray
                }}
              >
                {images ? <ImageBackground
                  resizeMode={'cover'}
                  style={{ height: convert(230), width: '100%' }}
                  source={{ uri: images.path }}>
                  <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }} >
                    {userId === currentUser._id && <Icon name='md-photos' size={convert(25)} color='#fff'
                      style={{ position: 'absolute', right: convert(20), bottom: convert(10) }}
                    />}
                  </View>
                </ImageBackground>
                  :
                  <ImageBackground
                    resizeMode={'cover'}
                    style={{ height: convert(230), width: '100%' }}
                    source={{
                      uri: _.has(user, 'profile.coverImage.url') ?
                        profile.coverImage.url +
                        '?imageMogr2/format/jpg/thumbnail/!300x200r/gravity/Center/interlace/1'
                        : undefined
                    }}
                  >
                    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' }} >
                      {userId === currentUser._id && <Icon name='md-photos' size={convert(25)} color='#fff'
                        style={{ position: 'absolute', right: convert(20), bottom: convert(10) }}
                      />}
                    </View>
                  </ImageBackground>}

              </View>
            </TouchableWithoutFeedback>
            <ActionSheet
              ref={this.imageActionSheet}
              title="选择图片"
              options={['相册', '相机', '取消']}
              cancelButtonIndex={2}
              onPress={this.imagePicker}
            />
            <View style={{ flexDirection: 'row' }}>
              <View
                style={{
                  marginTop: convert(-50),
                  marginLeft: convert(15),
                }}
              >
                <View
                  style={{
                    margin: 3,
                    width: convert(80),
                    height: convert(80),
                    borderRadius: convert(40),
                    backgroundColor: Colors.lightGray,
                    padding: convert(2)
                  }}
                >
                  <Avatar user={user} size={convert(76)}></Avatar>
                </View>
              </View>
            </View>
          </View>
          {user && (
            <View>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ marginLeft: convert(18) }}>
                  <Text
                    style={{
                      fontSize: convert(22),
                      color: 'black',
                      marginBottom: convert(8)
                    }}
                  >{profile.nickname}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <Icon
                      name="md-pin"
                      style={{
                        fontSize: convert(14),
                        color: Colors.darkGray,
                        lineHeight: convert(15),
                        marginRight: convert(5)
                      }}
                    />
                    <Text
                      style={{
                        fontSize: convert(14),
                        color: Colors.darkGray,
                        lineHeight: convert(15)
                      }}
                    >{profile.location}</Text>
                  </View>
                </View>
                {
                  userId !== currentUser._id &&
                  <View style={{ marginLeft: 'auto', marginRight: convert(15) }}>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: Colors.blue,
                          paddingHorizontal: convert(18),
                          height: convert(30),
                          borderRadius: convert(5),
                          marginRight: convert(5)
                        }}
                        onPress={() => {
                          Zhugeio.track('发送私信消息', {});
                          dispatch({
                            type: 'chat/ensureChat',
                            userId,
                            callback: (item: any) => {
                              dispatch({
                                type: 'chat/chat',
                                chat: item,
                                callback: () => {
                                  dispatch({ type: 'chat/addBranch', branch: '新的话题' })
                                }
                              })
                            }
                          })
                          dispatch(StackActions.push({ routeName: 'ChatDetail' }))
                        }}
                      >
                        <Icon
                          name="ios-chatboxes"
                          style={{
                            color: 'white',
                            fontSize: convert(19),
                            lineHeight: convert(30)
                          }}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: Colors.blue,
                          paddingHorizontal: convert(13),
                          height: convert(30),
                          flexDirection: 'row',
                          borderRadius: convert(5)
                        }}
                        onPress={() => {
                          if (
                            ['followee', 'mutual']
                              .includes(_.get(user, 'computed.userInfo.relationType'))
                          ) {
                            dispatch({ type: 'user/unfollow', userId })
                          } else {
                            dispatch({ type: 'user/follow', userId })
                          }
                        }}
                      >
                        {
                          ['followee', 'mutual']
                            .includes(_.get(user, 'computed.userInfo.relationType')) ? (
                              <Icon
                                name="md-checkmark"
                                style={{
                                  color: 'white',
                                  fontSize: convert(15),
                                  lineHeight: convert(30),
                                  marginRight: convert(5)
                                }}
                              />
                            ) : (
                              <Icon
                                name="md-add"
                                style={{
                                  color: 'white',
                                  fontSize: convert(15),
                                  lineHeight: convert(30),
                                  marginRight: convert(5)
                                }}
                              />
                            )
                        }
                        <Text
                          style={{
                            color: 'white',
                            fontSize: convert(16),
                            lineHeight: convert(30)
                          }}
                        >{FOLLOW_STATUS[_.get(user, 'computed.userInfo.relationType')]}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                }
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: convert(-18), marginVertical: convert(20) }}>
                <TouchableOpacity
                  style={{ width: winWidth / 3, justifyContent: 'center', alignItems: 'center' }}
                  activeOpacity={0.7}
                  onPress={() => dispatch(StackActions.push({ routeName: 'Agree', params: { userId } }))}
                >
                  <Text style={{ fontSize: convert(21), color: '#000', fontWeight:'bold' }}>{numOfReceivedAgrees}</Text>
                  <Text style={{ fontSize: convert(11), color: '#bbbbc5' }}>认同</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ width: winWidth / 3, justifyContent: 'center', alignItems: 'center' }}
                  activeOpacity={0.7}
                  onPress={() => dispatch(StackActions.push({ routeName: 'Follower', params: { userId } }))}
                >
                  <Text style={{ fontSize: convert(21), color: '#000', fontWeight: 'bold'  }}>{numOfFollowers}</Text>
                  <Text style={{ fontSize: convert(11), color: '#bbbbc5' }}>关注者</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ width: winWidth / 3, justifyContent: 'center', alignItems: 'center' }}
                  activeOpacity={0.7}
                  onPress={() => dispatch(StackActions.push({ routeName: 'Followee', params: { userId } }))}
                >
                  <Text style={{ fontSize: convert(21), color: '#000', fontWeight: 'bold'  }}>{numOfFollowees}</Text>
                  <Text style={{ fontSize: convert(11), color: '#bbbbc5' }}>关注</Text>
                </TouchableOpacity>
              </View>
              <View style={{ marginHorizontal: convert(18) }}>
                <Text style={{ marginVertical: convert(11) }}>{intro}</Text>
                {commonFriendsCount > 0 && this.userId !== currentUser._id ?
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      marginVertical: convert(10),
                    }}>
                    <View
                      style={{
                        width: convert(25) * commonFriends.length + convert(10),
                        display: 'flex',
                        flexDirection: 'row',
                        position: 'relative'
                      }}
                    >
                      {commonFriends.map((user, index) => (
                        <Avatar
                          style={{
                            position: 'absolute',
                            left: convert(25) * index,
                            zIndex: convert(3) - index
                          }}
                          key={user._id}
                          user={user}
                          size={convert(32)}
                        />
                      ))}
                    </View>
                    <Text style={{ flex: 1, color: '#BBBBC5' }}>
                      {commonFriendsCount}位共同好友，包括
                      <Text style={{ color: 'black' }}>
                        {commonFriends.map(({ profile: { nickname } }) => nickname).join(',')}
                      </Text>
                      等等
                    </Text>
                  </View>
                  : this.userId !== currentUser._id ?
                    <View><Text>没有共同好友</Text></View> : null}
               
                <Text style={styles.title}>个人形象</Text>
                <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                  {figures.map(({ _id, agreeCount, name }: any) => (
                    <Button
                      key={_id}
                      style={{
                        marginRight: convert(10),
                        marginBottom: convert(10),
                      }}
                      onPress={() => this.setState({
                        modal: 'figure',
                        figure: name,
                        figureAgreeCount: agreeCount,
                      })}
                    >
                      <Text>{name}·{agreeCount}</Text>
                    </Button>
                  ))}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => this.setState({ modal: 'addFigure' })}
                  >
                    <View
                      style={{
                        backgroundColor: '#e6f2ff',
                        borderRadius: convert(20),
                        paddingHorizontal: convert(20),
                        paddingVertical: convert(5),
                        marginRight: convert(10),
                        marginBottom: convert(10),
                      }}>
                      <Text style={{ color: '#007aff' }}>新增形象</Text>
                    </View>
                  </TouchableOpacity>
                  <FigureModal
                    userId={userId}
                    figure={this.state.figure}
                    agreeCount={this.state.figureAgreeCount}
                    visible={this.state.modal === 'figure'}
                    onClose={() => this.setState({ modal: '' })}
                  />
                  <AddFigureModal
                    userId={userId}
                    visible={this.state.modal === 'addFigure'}
                    onClose={() => this.setState({ modal: '' })}
                  />
                  <RealmDrawerModel
                    dispatch={dispatch}
                    joinRealm={mostActiveRealms}
                    visible={this.state.modal === 'realmTopic'}
                    onClose={() => this.setState({ modal: '' })}
                    userId={userId}
                    indexId={indexId}
                  />
                </View>
                {/*社交卡片*/}
              </View>
              <SocialCardView cards={cards} userId={userId} features={features} />
              <View>
                <Text style={{ ...styles.title, paddingHorizontal: convert(18) }}>所在领域</Text>
                <FlatList
                  data={mostActiveRealms}
                  keyExtractor={({ _id }) => _id}
                  renderItem={({ item, index }) => (
                    <View style={{ paddingHorizontal: convert(18), marginBottom: convert(20) }}>
                      <RealmCard
                        realm={item}
                        key={index}
                        onPress={() => this.setState({ modal: 'realmTopic', indexId: index })}
                      />
                    </View>
                  )}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: convert(18),
    fontWeight: 'bold',
    marginTop: convert(30),
    marginBottom: convert(10),
  }
})
