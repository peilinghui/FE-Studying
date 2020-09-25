import React from 'react'
import {
  View,
  Button,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Picker,
  ToastAndroid,
} from "react-native"
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationActions } from "react-navigation"
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import allCountries from '../../utils/allCountries'
import Colors from '../../constants/Colors';
import { convert } from "../../utils/ratio";
interface Props {
  navigation: NavigationScreenProp<any, any>
  dispatch: Function
}

@(connect() as any)
export default class extends React.Component<Props> {
  static navigationOptions = {
    header: null
  }

  state = {
    mobile: '',
    password: '',
    code: '86',
  }

  render() {
    const { dispatch } = this.props
    const { mobile, password } = this.state
    const { height } = Dimensions.get('window')
    const countries = allCountries.getCountries()
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ paddingTop: getStatusBarHeight(true), flex: 1 }}>
          <StatusBar
            barStyle='light-content'
            backgroundColor='#000'
          />
          <View style={{ flex: 1, backgroundColor: '#000', paddingHorizontal: convert(20), justifyContent: 'space-between' }}>
            <View>
              <View style={{ alignItems: 'flex-end' }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => dispatch(NavigationActions.back())}
                >
                  <Text style={{ paddingVertical: convert(15), color: '#fff' }}>取消</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ color: '#fff', fontSize: convert(30), marginTop: convert(80) }}>欢迎回来，朋友</Text>
              <Text style={{ color: '#999', fontSize: convert(20), marginTop: convert(10) }}>我们暂未开放手机号注册，老用户可用手机号登录。</Text>
            </View>
            <Text style={{ fontSize: convert(18), color: 'green', justifyContent: 'space-between', marginBottom: convert(10), paddingVertical: convert(10) }}>登录</Text>
          </View>
          <KeyboardAvoidingView
            style={{
              height: height / 2,
              backgroundColor: '#fff',
              paddingHorizontal: convert(20),
              justifyContent: 'space-between',
            }}
          >
            <View>
              <View style={{ flexDirection: 'row' }}>
                <Picker
                  selectedValue={this.state.code}
                  style={{ height: convert(50), width: convert(160) }}
                  onValueChange={(itemValue, itemIndex) =>
                    this.setState({ code: itemValue })
                  }
                >
                  {countries.map(({ name, dialCode }: any) => (
                    <Picker.Item key={name} label={name} value={dialCode} />
                  ))}
                </Picker>
                <TextInput
                  placeholder='手机号码'
                  value={mobile}
                  style={{ fontSize: convert(16) }}
                  onChangeText={val => this.setState({ mobile: val })}
                />
              </View>
              <TextInput
                secureTextEntry
                placeholder='密码'
                value={password}
                style={{ fontSize: convert(16) }}
                onChangeText={val => this.setState({ password: val })}
              />
            </View>
            <View style={{ marginBottom: convert(50) }}>
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.blue,
                  alignItems: 'center',
                  padding: convert(10),
                  borderRadius: convert(12)
                }}
                activeOpacity={0.8}
                onPress={() => {
                  if (mobile !== '' && password !== '') {
                    dispatch({ type: 'app/showLoading' })
                    dispatch({
                      type: 'auth/login',
                      countryCode:86,
                      mobile,
                      password,
                      callback: () => {
                        dispatch({ type: 'app/hideLoading' })
                      },
                      onError: () => {
                        dispatch({ type: 'app/hideLoading' })
                        ToastAndroid.show('登录失败', ToastAndroid.LONG)
                      }
                    })
                  }
                }}
              >
                <Text style={{ color: 'white', fontSize: convert(17) }}>登录</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}
