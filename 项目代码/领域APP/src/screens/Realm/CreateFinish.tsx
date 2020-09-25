import React from 'react'
import _ from 'lodash';
import { View, Text, TouchableOpacity, CameraRoll, ToastAndroid, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native'
import { connect } from 'react-redux'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Dispatch } from 'redux'
import { NavigationScreenProp, StackActions, NavigationActions } from 'react-navigation'
import Avatar from '../../components/Avatar'
import { detail as realmDetail, hexCode as realmHexCode, getMembers } from '../../services/realm'
import KVDB from '../../services/kvdb'
import ViewShot from 'react-native-view-shot'
// import QRCode from 'react-native-qrcode-svg'
import * as WeChat from 'react-native-wechat'
import { getMiniProgramQRCode, getRealmInvCode } from '../../services/feature';
import { convert, winWidth, winHeight, statusBarHeight } from '../../utils/ratio';
import RealmCard from '../../components/Message/RealmCard'
import Colors from '../../constants/Colors';
import FastImage from 'react-native-fast-image';

interface Props {
  dispatch: Dispatch<any>
  navigation: NavigationScreenProp<any>
  currentUser: any
}

type State = {
  realm: any
  backgroundColor: string
  qrcodeUrl?: any
  members: any[]
}

@(connect(
  ({ auth: { detail } }: any) => ({ currentUser: detail })
) as any)
export default class CreatFinish extends React.Component<Props, State> {
  static navigationOptions = {
    header: null
  }

  private viewShot: any

  constructor(props: Props) {
    super(props)
    this.state = {
      realm: {},
      backgroundColor: '#fff',
      members: [],
    }
    this.viewShot = React.createRef()
  }

  async componentDidMount() {
    const { currentUser, navigation, dispatch } = this.props
    const realmId = navigation.getParam('realmId')

    try {
      dispatch({ type: 'app/showLoading' })
      const invCode = await getRealmInvCode(realmId, currentUser._id);
      const path = 'pages/realm/realm?realmId=' + realmId + '&invCode=' + invCode.invCode
      const url = await getMiniProgramQRCode(path)
      this.setState({ qrcodeUrl: url });
      const realm = await realmDetail(realmId, currentUser._id)
      let hexCode = await KVDB.get(`Realms:${realm._id}:backgroundHexCode`)
      if (!hexCode) {
        const { RGB } = await realmHexCode(realm.coverImage.url)
        hexCode = RGB.substr(2)
        KVDB.put(`Realms:${realm._id}:backgroundHexCode`, hexCode, 3600 * 48)
      }
      const members = await getMembers(realmId, 8)
      this.setState({
        members,
        realm,
        backgroundColor: '#' + hexCode,
      }, () => {
        dispatch({ type: 'app/hideLoading' })
      })
    } catch (error) {
      dispatch({ type: 'app/hideLoading' })
    }
  }

  render() {
    const { dispatch, navigation, currentUser } = this.props
    const realmType = navigation.getParam('realmType')
    const { realm, members } = this.state
    const { profile: { nickname } } = currentUser
    const realmId = navigation.getParam('realmId')
    return (
      <View style={{ paddingTop: getStatusBarHeight(true) }}>
        <View style={{ height: convert(40), justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{ color: 'black', fontSize: convert(17), marginRight: convert(100) }}
          ></Text>
          <TouchableWithoutFeedback
            style={{ marginRight: convert(25) }}
            onPress={() => dispatch({ type: 'realm/createdNewRealm', realmId })}
          >
            <Text
              style={{ color: '#2585FC', fontSize: convert(17), fontWeight: '600', marginRight: convert(20) }}
            >好了</Text>
          </TouchableWithoutFeedback>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: convert(180) }}
        >
          <Text style={{ color: '#000', fontSize: convert(32), fontWeight: '600', marginTop: convert(10), paddingHorizontal: convert(20) }}>
            创建完成</Text>
          <Text numberOfLines={1}
            style={{ color: 'rgba(0, 0, 0, 0.46)', fontSize: convert(15), marginTop: convert(6), paddingHorizontal: convert(20) }}>
            分享二维码，好友可直接在微信加入</Text>
          <ViewShot
            ref={this.viewShot}
          >
            <View
              style={{
                width: winWidth - convert(70),
                backgroundColor: '#70A9AB',
                marginTop: convert(20),
                borderRadius: convert(10),
                marginLeft: convert(35)
              }}>
              <View style={{ height: convert(60), alignItems: 'center', justifyContent: 'center', }}>
                <Avatar
                  style={{
                    marginTop: convert(6),
                    marginBottom: convert(6),
                  }}
                  user={currentUser}
                  size={convert(22)}
                />
                <Text style={{
                  color: '#fff',
                  fontSize: convert(12),
                }}>{nickname} 邀请你加入领域</Text>
              </View>

              <RealmCard
                onPress={() => { }}
                realm={realm}
                styles={{
                  height: convert(120),
                  marginLeft: convert(25),
                  marginRight: convert(25),
                  width: winWidth - convert(120),
                  top: convert(60),
                  position: 'absolute',
                }}
              />
              <View style={{
                borderRadius: convert(10),
                backgroundColor: '#fff',
                marginTop: convert(80),
                marginLeft: convert(12),
                marginRight: convert(12)
              }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: convert(11),
                    color: Colors.darkGray,
                    marginTop: convert(45),
                    marginLeft: convert(10),
                  }}
                >领域简介</Text>
                <Text
                  style={{
                    fontSize: convert(13),
                    color: 'black',
                    marginTop: convert(10),
                    marginLeft: convert(10),
                    maxWidth: winWidth - convert(114)
                  }}

                > {_.get(realm, 'intro')}</Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: convert(11),
                    color: Colors.darkGray,
                    marginTop: convert(30),
                    marginLeft: convert(10),
                  }}
                >创立者</Text>

                <View style={{ flexDirection: 'row', width: '100%' }}>
                  <View style={{ marginTop: convert(10), marginLeft: convert(10) }}>
                    <Avatar
                      size={convert(36)}
                      user={realm.creator}
                    />
                  </View>
                  <View style={{ marginLeft: convert(10) }}>
                    <Text style={{ color: 'black', fontWeight: 'bold' }}>{_.get(realm, 'creator.profile.nickname')}</Text>
                    <Text style={{ color: '#555', marginTop: convert(3), fontSize: convert(13), maxWidth: convert(200), }}>
                      {_.get(realm, 'creator.profile.intro')}
                    </Text>
                  </View>
                </View>

                <View style={{ backgroundColor: Colors.lightGray, borderRadius: convert(10), marginLeft: convert(10), marginRight: convert(10) }}>
                  <Text style={{ color: '#555', marginTop: convert(5), fontSize: convert(11), maxWidth: convert(200), marginLeft: convert(10) }}>
                    {_.get(realm, 'creatorIntro')}
                  </Text>
                </View>

                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: convert(11),
                    color: Colors.darkGray,
                    marginTop: convert(20),
                    marginLeft: convert(10),
                  }}
                >{_.get(realm, 'statistics.numOfMembers')}个成员 · {_.get(realm, 'statistics.numOfTopics')}个讨论</Text>


                <View style={{ flexDirection: 'row', marginTop: convert(10) }}>
                  {
                    members.map((member, index) =>
                      <View style={{ padding: convert(1) }} key={index}>
                        <Avatar size={convert(26)} user={member}></Avatar>
                      </View>
                    )
                  }
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: convert(30), height: 93, alignItems: 'center' }}>
                  <Avatar
                    size={convert(30)}
                    user={currentUser}
                  />
                  <View>
                    <Text >长按扫描二维码</Text>
                    <Text >进入该领域 👉</Text>
                  </View>
                  <View style={{ marginRight: convert(20) }}>
                    {
                      this.state.qrcodeUrl &&
                      <FastImage source={{
                        uri: 'data:image/png;base64,' + this.state.qrcodeUrl
                      }}
                        style={{ width: convert(80), height: convert(80) }} />
                    }
                  </View>
                </View>
              </View>

              <View style={{ alignItems: 'center', justifyContent: 'center', height: convert(40), flexDirection: 'row' }}>
                <FastImage
                  source={require("../../assets/longlogo.png")}
                  style={{
                    backgroundColor: "transparent",
                    width: convert(195),
                    height: convert(23)
                  }}
                />
              </View>
            </View>
          </ViewShot>
        </ScrollView>

        <View style={{
          flexDirection: 'row',
          position: 'absolute',
          bottom: statusBarHeight,
          width: '100%',
          backgroundColor: '#fff',
          elevation: convert(10)
        }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              const wechatInstalled = await WeChat.isWXAppInstalled()
              if (wechatInstalled) {
                const tag = await this.viewShot.current.capture()
                await WeChat.shareToSession({
                  type: 'imageFile',
                  imageUrl: tag
                })
              } else {
                ToastAndroid.show('未安装微信', ToastAndroid.LONG)
              }
            }}
            style={styles.box}
          >
            <FastImage
              style={styles.imageStyle}
              source={require('../../assets/wechat.png')}
            />
            <Text style={{ marginBottom: convert(10) }}>微信好友</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              const wechatInstalled = await WeChat.isWXAppInstalled()
              if (wechatInstalled) {
                const tag = await this.viewShot.current.capture()
                await WeChat.shareToTimeline({
                  type: 'imageFile',
                  imageUrl: tag
                })
              } else {
                ToastAndroid.show('未安装微信', ToastAndroid.LONG)
              }
            }}
            style={styles.box}
          >
            <FastImage
              style={styles.imageStyle}
              source={require('../../assets/pengyouquan.png')}
            />
            <Text style={{ marginBottom: convert(10) }}>朋友圈</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={async () => {
              const tag = await this.viewShot.current.capture()

              try {
                await CameraRoll.saveToCameraRoll(tag, 'photo')
                ToastAndroid.show('已保存到相册', ToastAndroid.LONG)
              } catch (error) {
                ToastAndroid.show('没有储存权限，无法保存', ToastAndroid.LONG)
              }
            }}
            style={styles.box}
          >
            <FastImage
              style={styles.imageStyle}
              source={require('../../assets/share.png')}
            />
            <Text style={{ marginBottom: convert(10) }}>保存图片</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

}

const styles = StyleSheet.create({
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    width: winWidth / 3,
    height: convert(100)
  },
  imageStyle: {
    width: convert(40),
    height: convert(40),
    backgroundColor: 'transparent'
  }
})