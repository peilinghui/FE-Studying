import React from 'react'
import { connect } from 'react-redux'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Icon from 'react-native-vector-icons/Ionicons'
import { Dispatch } from 'redux'
import { NavigationActions, NavigationScreenProp, StackActions } from 'react-navigation'
import { convert, winWidth } from "../../utils/ratio";

type Props = {
  dispatch: Dispatch<any>
  navigation: NavigationScreenProp<any>
}

@(connect() as any)
export default class FieldEdit extends React.Component<Props, { val: string }> {
  constructor(props: Props) {
    super(props)
    this.state = {
      val: this.props.navigation.getParam('value')
    }
  }

  submit = () => {
    const { dispatch, navigation } = this.props
    const field = navigation.getParam('field')
    dispatch({ type: 'user/updateProfile', profile: { [field]: this.state.val } })
    dispatch(NavigationActions.back())
  }

  render() {
    const { dispatch, navigation } = this.props
    const title = navigation.getParam('title')
    return (
      <View style={{ paddingTop: getStatusBarHeight(true) }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: convert(50),
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{
              height: convert(50),
              marginLeft: convert(20),
              marginRight: convert(15),
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            activeOpacity={0.7}
            onPress={() => dispatch(NavigationActions.back())}
          >
            <Icon
              name="ios-arrow-back"
              size={convert(26)}
            />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={this.submit}>
            <Text style={{ width: convert(40) }}>完成</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: convert(16) }}>
          <Text style={{ fontSize: convert(20), color: '#000' }}>修改{title}</Text>
          <TextInput
            placeholder='请输入...'
            value={this.state.val}
            onChangeText={val => this.setState({ val })}
            multiline={true}
          />
        </View>
      </View>
    )
  }
}