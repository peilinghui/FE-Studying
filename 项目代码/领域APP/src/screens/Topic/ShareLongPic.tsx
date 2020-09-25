import React from 'react'
import _ from 'lodash';
import { View, Text, TouchableOpacity, Image, CameraRoll, ToastAndroid, StyleSheet, ScrollView, TouchableWithoutFeedback } from 'react-native'
import { connect } from 'react-redux'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Dispatch } from 'redux'
import { NavigationScreenProp, StackActions, NavigationActions } from 'react-navigation'
import ViewShot from 'react-native-view-shot'
// import QRCode from 'react-native-qrcode-svg'
import * as WeChat from 'react-native-wechat'
import { getMiniProgramCode } from '../../services/feature';
import { convert, winWidth, winHeight, statusBarHeight } from '../../utils/ratio';
import FastImage from 'react-native-fast-image';
interface Props {
  dispatch: Dispatch<any>
  navigation: NavigationScreenProp<any>
  currentUser: any
}

type State = {
  qrcodeUrl?: string
  imageHeight: number
}

@(connect(
  ({ auth: { detail } }: any) => ({ currentUser: detail })
) as any)

export default class ShareLongPic extends React.Component<Props, State> {
  static navigationOptions = {
    header: null
  }

  private viewShot: any
  private imagePath: any
  constructor(props: Props) {
    super(props)
    this.state = {
      qrcodeUrl: '',
      imageHeight: 400,
    }
    this.viewShot = React.createRef()
  }

  async componentDidMount() {
    const { currentUser, navigation, dispatch } = this.props
    const topic = navigation.getParam('topic')
    const scene = 't:' + topic._id
    try {
      dispatch({ type: 'app/showLoading' })
      const url = await getMiniProgramCode(scene)
      this.setState({ qrcodeUrl: url });
      Image.getSize(this.imagePath, (width, height) => (
        this.setState({ imageHeight: height / width * (winWidth - convert(74))}, () => {
          dispatch({ type: 'app/hideLoading' })
        })), () => {});
    } catch (error) {
      dispatch({ type: 'app/hideLoading' })
    }
  }

  render() {
    const { dispatch, navigation, currentUser } = this.props
    const topic = navigation.getParam('topic')
    this.imagePath = this.props.navigation.getParam('previewSource')
    return (
      <View style={{ paddingTop: getStatusBarHeight(true) }}>
        <View style={{ height: convert(40), justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{ color: 'black', fontSize: convert(17), marginRight: convert(100) }}
          ></Text>
          <TouchableWithoutFeedback
            style={{ marginRight: convert(25) }}
            onPress={() => dispatch(NavigationActions.back())}
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
            分享讨论</Text>
          <Text numberOfLines={1}
            style={{ color: 'rgba(0, 0, 0, 0.46)', fontSize: convert(15), marginTop: convert(6), paddingHorizontal: convert(20) }}>
            邀请朋友一起围观、参与这个讨论</Text>
          <ViewShot
            ref={this.viewShot}
            style={{
              width: winWidth - convert(50),
              backgroundColor: '#007AFF',
              marginTop: convert(20),
              borderRadius: convert(10),
              marginLeft: convert(25)
            }}
          >
            <View style={{ height: convert(70),justifyContent:'center', flexDirection: 'row' }}>
              <FastImage
                source={require("../../assets/wlogo.png")}
                style={{
                  width: convert(15),
                  height: convert(15),
                  marginLeft: convert(5),
                  marginTop:convert(50),
                  marginRight: convert(5),
                  backgroundColor: "transparent",
                  borderRadius: convert(5),
                }}
              />
              <Text style={{
                color: '#fff',
                fontSize: convert(12),
                marginTop: convert(50),
                fontFamily:'bold'
              }}>领域 · {topic.realm.title}</Text>
            </View>
            <View
              style={{
                borderRadius: convert(10),
                backgroundColor: '#fff',
                marginTop: convert(10),
                marginLeft: convert(12),
                marginRight: convert(12),
                width: winWidth - convert(74),
                height: this.state.imageHeight+convert(20),
              }}
            >
              <FastImage
                style={{
                  width: winWidth - convert(74),
                  height: this.state.imageHeight,
                  borderRadius: convert(10),
                }}
                resizeMode="contain"
                source={{ uri: this.imagePath }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: convert(30), height: convert(93), alignItems: 'center' }}>
              <View style={{ marginRight: convert(15) }}>
                <Text style={{ color: 'white' }}>长按扫描二维码参与讨论</Text>
                <Text style={{ color: 'white' }}>查看最新的讨论动态 👉</Text>
              </View>
              <View style={{ marginRight: convert(20) }}>
                <FastImage source={{ uri: 'data:image/png;base64,' + this.state.qrcodeUrl }}
                  style={{ width: convert(80), height: convert(80) }} />
              </View>
            </View>

            <View style={{ alignItems: 'center', justifyContent: 'center', height: convert(40), flexDirection: 'row' }}>
              <Image
                source={require("../../assets/longlogo.png")}
                style={{
                  backgroundColor: "transparent",
                  width: convert(195),
                  height: convert(23)
                }}
              />
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