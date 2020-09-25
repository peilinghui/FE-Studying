import React from 'react'
import _ from 'lodash'
import { View, StatusBar, Text, TouchableOpacity, Dimensions, Linking, DeviceEventEmitter, AsyncStorage } from "react-native"
import { connect } from 'react-redux'
import { NavigationScreenProp, StackActions, NavigationActions } from "react-navigation"
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import moment from 'moment'
import Button from '../../components/Button'
import Avatar from '../../components/Avatar'
import { BoxShadow } from 'react-native-shadow'
import Icon from 'react-native-vector-icons/Ionicons';
import Layout from '../../constants/Layout';
import { convert, winWidth } from "../../utils/ratio";
import Zhugeio from 'react-native-plugin-zhugeio'
import Colors from '../../constants/Colors';


interface Props {
  navigation: NavigationScreenProp<any, any>
  dispatch: Function
  currentUser: any
}

interface State {
  agreeCount:number
}

var showRed = false;
var showNotifiyRed = false;

@(connect(({ auth: { detail } }: any) => ({ currentUser: detail })) as any)

export default class PersonalScreen extends React.Component<Props,State> {
  static navigationOptions = {
    header: null
  }

  cconstructor(props: Props) {
    this.state = {
      agreeCount:0
    } 
  }

  componentWillMount() {
    this.props.dispatch({ type: 'list.agree/agreeCount', userId: this.props.currentUser._id });
    DeviceEventEmitter.addListener("新通知", (e: any) => {
      showNotifiyRed = true;
      this.forceUpdate();
    });
     DeviceEventEmitter.addListener("hide", (e) => {
      showRed = false;
      showNotifiyRed = false;
      this.forceUpdate();
    });
    DeviceEventEmitter.addListener("收到新赞同", (e) => {
      showRed = true;
      console.log('=====收到新赞同========')
      this.setState({
        agreeCount: e.agreeCount
      });
      this.forceUpdate();
    });
   
  }
  componentDidMount() {
    const { dispatch, currentUser } = this.props

    Zhugeio.identify('用户', { '用户名': _.get(currentUser, 'nickname'), 'userId': _.get(currentUser, 'userId'), '头像': _.get(currentUser, 'profile.avatar.url') })
    Zhugeio.startTrack('我的Tab页面');
  }

  componentWillUnmount() {
    Zhugeio.endTrack('我的Tab页面', {});
    DeviceEventEmitter.removeAllListeners()
  }

  render() {
    const { dispatch, currentUser } = this.props
    if (!currentUser) {
      return <View></View>
    }
    const {
      _id: userId,
      profile: { nickname, intro },
      statistics: { numOfReceivedAgrees, numOfFollowers },
    } = currentUser

    return (
      <View style={{ paddingTop: getStatusBarHeight(true) }}>
        <View style={{ paddingHorizontal: convert(16) }}>
          <StatusBar backgroundColor='#fff' />
          <Text
            style={{
              marginTop: convert(30),
              fontSize: convert(13),
              fontFamily: 'SFProText-Semibold',
              fontWeight: '600',
              color: '#999',
            }}
          >{moment().locale('en').format('dddd, MMMM D')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <Text
              style={{
                fontSize: convert(34),
                fontFamily: 'SFProDisplay-Bold',
                fontWeight: 'bold',
                color: '#000',
              }}
            >我的</Text>
            <Button
              onPress={() => {
                dispatch(StackActions.push({ routeName: 'Notification', params: { userId } })) 
                DeviceEventEmitter.emit("hide", {});            
              }}
              style={{ flexDirection: 'row' }}>
              <Icon name='md-notifications' size={17} color={showNotifiyRed? Colors.blue : '#bbbbc5'} />
              <Text style={{ marginLeft: convert(8), color: showNotifiyRed? Colors.blue : '#bbbbc5' }}>通知</Text>
              {showNotifiyRed&& <View style={{ backgroundColor: 'red', position: 'absolute', width: convert(10), height: convert(10), borderRadius: convert(5), right: convert(-2), top: convert(0) }} />}
            </Button>
          </View>
          <BoxShadow
            setting={{
              height: convert(89),
              width: winWidth - convert(32),
              color: "#000",
              border: convert(46),
              opacity: 0.1,
              style: { marginTop: convert(15) },
              radius: convert(12),
              x: convert(5),
              y: convert(15),
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                height: convert(89),
                width: winWidth - convert(32),
                backgroundColor: '#fff',
                flexDirection: 'row',
                borderRadius: convert(12),
                paddingLeft: convert(16),
                paddingRight: convert(16),
                paddingTop: convert(13),
              }}
              onPress={() => {
                dispatch(NavigationActions.navigate({
                  routeName: 'UserViewer',
                  params: { userId: currentUser._id }
                }))
              }}
            >
              <View style={{ alignSelf: 'flex-start', maxWidth: winWidth - convert(160) }}>
                <Text style={{ fontSize: convert(19), color: 'rgba(0,0,0,0.55)', fontWeight: 'bold' }}>{nickname}</Text>
                <Text style={{ fontSize: convert(15), color: '#bbbbc5' }} numberOfLines={2}>{intro}</Text>
              </View>
              <View style={{ marginLeft: 'auto' }}>
                <Avatar user={_.get(this.props, 'currentUser')} size={convert(59)} />
              </View>
            </TouchableOpacity>
          </BoxShadow>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: convert(18),
            backgroundColor: '#fff',
            marginTop: convert(22),
            paddingVertical: convert(20),
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => dispatch(StackActions.push({ routeName: 'Agree', params: { userId } }))}
            >
              <Text style={{ fontSize: convert(26), color: '#000' }}>{numOfReceivedAgrees}</Text>
              <Text style={{ fontSize: convert(15), color: '#bbbbc5' }}>认同</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => dispatch(StackActions.push({ routeName: 'Follower', params: { userId } }))}
              style={{ marginLeft: convert(65) }}
            >
              <Text style={{ fontSize: convert(26), color: '#000' }}>{numOfFollowers}</Text>
              <Text style={{ fontSize: convert(15), color: '#bbbbc5' }}>关注</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              backgroundColor: showRed && this.state.agreeCount > 0 ? 'red' : '#efeff4',
              borderRadius: convert(6),
              paddingHorizontal: convert(10),
              paddingVertical: convert(5),
              alignSelf: 'flex-end'
            }}
            onPress={() => {
              dispatch(StackActions.push({ routeName: 'Agree', params: { userId } }))
              DeviceEventEmitter.emit("hide", {});
              this.setState({agreeCount:0})
            }}
          >
            <Text style={{ fontSize: convert(12), color: showRed ? '#ffff' : '#bbbbc5' }}>{showRed&&this.state.agreeCount>0 ? _.get(this.state,'agreeCount')+'个新赞同' : '暂无新认同'}</Text>
          </TouchableOpacity>

        </View>
        <View style={{ marginLeft: convert(22), paddingRight: convert(16), borderTopWidth: convert(1), borderTopColor: '#EFEFEF' }}>
          <TouchableOpacity
            style={{ paddingVertical: convert(16), flexDirection: 'row', justifyContent: 'space-between' }}
            activeOpacity={0.7}
            onPress={() => dispatch(StackActions.push({ routeName: 'Setting' }))}
          >
            <Text style={{ color: '#000', fontSize: convert(16), fontWeight: '500' }}>帐户设置</Text>
            <Icon name='ios-arrow-forward' size={convert(13)} color='#ccc' />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingVertical: convert(16), flexDirection: 'row', justifyContent: 'space-between' }}
            activeOpacity={0.7}
            onPress={() => dispatch(StackActions.push({ routeName: 'Wallet' }))}
          >
            <Text style={{ color: '#000', fontSize: convert(16), fontWeight: '500' }}>我的钱包</Text>
            <Icon name='ios-arrow-forward' size={convert(13)} color='#ccc' />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingVertical: convert(16) }}
            activeOpacity={0.7}
            onPress={() => Linking.openURL('https://www.atrealm.com/agreement.html')}
          >
            <Text style={{ color: '#000', fontSize: convert(16), fontWeight: '500' }}>隐私与协议</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={{ paddingVertical: convert(16) }} activeOpacity={0.7} onPress={() => { }}>
            <Text style={{ color: '#000', fontSize: 17, fontWeight: '500' }}>评价领域</Text>
          </TouchableOpacity> */}
          <TouchableOpacity style={{ paddingVertical: convert(16) }} activeOpacity={0.7} onPress={() => dispatch({ type: 'auth/logout' })}>
            <Text style={{ color: '#FF3567', fontSize: convert(16), fontWeight: '500' }}>登出</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}
