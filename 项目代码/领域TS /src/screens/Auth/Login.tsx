import React from 'react'
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Button,
  TouchableOpacity,
  Linking,
  ImageBackground,
} from 'react-native'
import { NavigationScreenProps, NavigationActions } from 'react-navigation'
import * as WeChat from 'react-native-wechat'
import { connect } from 'react-redux'
import { convert } from "../../utils/ratio";
import FastImage from 'react-native-fast-image';
interface Props extends NavigationScreenProps {
  dispatch: Function
}

interface State {
  isWeChatInstalled: boolean;
}

@(connect() as any)
export default class LoginScreen extends React.Component<Props, State> {
  static navigationOptions = {
    header: null
  }

  constructor(props: Props) {
    super(props)
    this.state = {
      isWeChatInstalled: false
    }
  }

  async componentDidMount() {
    // load wechat info
    const isWeChatInstalled = await WeChat.isWXAppInstalled()
    this.setState({ isWeChatInstalled })
  }

  wechatLogin = async () => {
    const { dispatch } = this.props
    const { code } = await WeChat.sendAuthRequest('snsapi_userinfo')
    dispatch({ type: 'app/showLoading' })
    dispatch({
      type: 'auth/wechatLogin',
      appId: 'wxee75c867edaf55ff',
      appSecret: 'f96b5e7f0147eb28b9f4f57fb026b96b',
      code,
      callback: () => {
        dispatch({ type: 'app/hideLoading' })
      }
    })
  }

  gotoMobileLogin = () => this.props.dispatch(NavigationActions.navigate({ routeName: 'MobileLogin' }))

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle='light-content'
          backgroundColor='transparent'
          translucent={true}
        />
        <ImageBackground
          resizeMode='cover'
          style={{ flex: 1, paddingHorizontal: convert(20) }}
          source={require('../../assets/loginBackground.jpg')}
        >
          <View style={{ flex: 1 }} />
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#fff', fontSize: convert(18) }}>领域</Text>
              <Text style={{ color: '#fff', fontSize: convert(32), marginTop: convert(10), fontWeight: 'bold' }}>不错过好友所在的小圈子</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={this.state.isWeChatInstalled
                  ? this.wechatLogin
                  : this.gotoMobileLogin}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: convert(10),
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: convert(12),
                  width: convert(160),
                  textAlign: 'center',
                  marginTop: convert(100),
                  alignSelf: 'center',
                }}
              >
                <Text style={{ color: '#000', fontSize: convert(16) }}>
                  {this.state.isWeChatInstalled ? '使用微信登录' : '手机号登录'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: convert(20) }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: '#999' }}>登录领域即接受 </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('https://www.atrealm.com/agreement.html')}
                ><Text style={{ color: '#fff' }}>用户协议</Text></TouchableOpacity>
              </View>
              {this.state.isWeChatInstalled ?
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={this.gotoMobileLogin}
                ><Text style={{ color: '#999' }}>手机号登录</Text></TouchableOpacity>
                : null}
            </View>
          </View>
        </ImageBackground>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
})
