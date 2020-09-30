import React from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  DeviceEventEmitter
} from 'react-native'
import { NavigationScreenProps, NavigationActions, StackActions, NavigationScreenProp } from 'react-navigation'
import Colors from '../../constants/Colors'
import { connect } from 'react-redux'
import { Dispatch } from 'redux';
import TopicCardMini from '../../components/TopicCardMini'
import { objectHash } from '../../utils/functions'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Icon from 'react-native-vector-icons/Ionicons'
import moment from 'moment';
import 'moment/locale/zh-cn';
import { convert, winWidth } from "../../utils/ratio";
import Zhugeio from 'react-native-plugin-zhugeio'
import TouchableIcon from '../../components/TouchableIcon';

interface Props extends NavigationScreenProps {
  dispatch: Dispatch<any>
  navigation: NavigationScreenProp<any>
  joinedTopics: any
  refreshing: boolean
  loading: boolean
  hasNext: boolean
  latestChat: any
}

interface State {
  index: number,
  routes: object[],
}

var showRed = false;


@(connect(
  ({
    'list.joinedTopic': { list, refreshing, loading, hasNext },
    chat: { userChats },
  }: any) => ({
    joinedTopics: list,
    loading,
    refreshing,
    hasNext,
    latestChat: userChats.length > 0 ? userChats[0] : {},
  })) as any)
export default class DiscussionScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null
  }

  constructor(props: Props) {
    super(props);
  }

  componentWillMount() {
    DeviceEventEmitter.addListener("新私信", (e) => {
      showRed = true;
      this.forceUpdate();
    });
    DeviceEventEmitter.addListener("hide", (e) => {
      showRed = false;
      this.forceUpdate();
    });
  }
  componentDidMount() {
    Zhugeio.startTrack('讨论Tab页面');
  }

  componentWillUnmount() {
    Zhugeio.endTrack('讨论Tab页面', {});
    DeviceEventEmitter.removeListener("新私信", () => {

    });
  }

  _onRefreshTopic = () => this.props.dispatch({ type: 'list.joinedTopic/refresh' })

  loadMoreTopics = () => {

    if (this.props.loading) return;

    if (this.props.joinedTopics.length == 0) {
      return;
    }

    if (!this.props.hasNext) {
      return;
    }
    this.props.dispatch({ type: 'list.joinedTopic/next' })
  }

  renderFooter = () => {
    return (
      <View style={{ width: '100%', height: convert(60), justifyContent: 'center', alignItems: 'center', }}>
        {this.props.loading && <ActivityIndicator size="large" color={Colors.darkGrayAlpha(0.4)} />}
        {!this.props.hasNext && <Text style={{ color: Colors.darkGray }}>- 完 - </Text>}
      </View>

    );
  };

  render() {

    const { joinedTopics, refreshing, dispatch, latestChat } = this.props
    return (
      <View
        style={{
          elevation: 0,
          flex: 1,
          backgroundColor: Colors.lightGray,
          paddingTop: getStatusBarHeight(true),
        }}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="rgba(0,0,0,0.1)"
          translucent={true}
        />

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: convert(50),
          backgroundColor: 'white',
          paddingHorizontal: convert(20),
        }}>
          <Text style={{ fontSize: convert(22), fontWeight: '500', color: '#000' }}>讨论</Text>
          <View style={{flexDirection:'row'}}>
            <TouchableIcon name='md-qr-scanner' size={convert(27)} color='#000'
              onPress={() => {
                this.props.navigation.push('QRScannerViewScreen', {

                })
                // dispatch(StackActions.push({ routeName: '' }))
              }} />

            <TouchableIcon name='md-people' size={convert(27)} color='#000'
            style={{marginLeft:convert(20)}}
              onPress={() => {
                dispatch(StackActions.push({ routeName: 'FriendView' }))
              }} />
          </View>
        </View>
        <FlatList
          bounces={true}
          refreshing={refreshing}
          onRefresh={this._onRefreshTopic}
          onEndReached={() => this.loadMoreTopics()}
          data={joinedTopics}
          keyExtractor={(item, index) => objectHash(item)}
          renderItem={({ item = {} }: any) => (
            <TopicCardMini
              topic={item}
              onPress={() => {
                dispatch(NavigationActions.navigate({
                  routeName: 'TopicViewer',
                  params: { topicId: item._id, topicData: item },
                }))
              }}
              onPressAvatar={(user) => {
                dispatch(NavigationActions.navigate({
                  routeName: 'UserViewer',
                  params: { userId: user._id },
                }))
              }}
            />
          )}
          ListEmptyComponent={
            <View style={{ paddingTop: convert(26) }}>
              <Text
                style={{
                  fontSize: convert(20),
                  color: '#ccc',
                  alignSelf: 'center'
                }}
              >快参与一个话题吧！</Text>
            </View>
          }
          ListFooterComponent={() => this.renderFooter()}
          ListHeaderComponent={
            <View style={{ backgroundColor: 'white', paddingHorizontal: convert(16), marginBottom: convert(6) }}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ flexDirection: 'row', marginVertical: convert(12), alignItems: 'center' }}
                onPress={() => {
                  dispatch(StackActions.push({ routeName: 'ChatList' }))
                  DeviceEventEmitter.emit("hide", {});
                }}
              >
                <View
                  style={{
                    width: convert(52),
                    height: convert(52),
                    borderRadius: convert(26),
                    backgroundColor: '#EFEFEF',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <View style={{
                    width: convert(34), height: convert(34), borderRadius: convert(17), backgroundColor: '#1589EE',
                    alignItems: 'center'
                  }}>
                    <Icon style={{ lineHeight: convert(34) }} color="white" size={convert(20)} name="ios-chatbubbles"></Icon>
                  </View>
                </View>
                <View style={{ marginLeft: convert(10), flex: 1 }}>
                  <Text style={{ fontSize: convert(16), color: '#22292F' }}>私信</Text>
                  <Text style={{ fontSize: convert(14), color: '#6E6E6E' }}>{latestChat.lastMsgContent}</Text>
                </View>

                {showRed &&
                  <View style={{ width: 60, alignItems: 'flex-end' }}>
                    <View
                      style={{
                        backgroundColor: 'red',
                        width: convert(10),
                        height: convert(10),
                        borderRadius: convert(5),
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                    </View>
                  </View>
                }
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    );
  }
}

