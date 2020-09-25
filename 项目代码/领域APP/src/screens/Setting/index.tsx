import React from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { View, Text, TouchableOpacity } from 'react-native'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Header from '../../components/Header'
import Icon from 'react-native-vector-icons/Ionicons'
import { Dispatch } from 'redux'
import { StackActions } from 'react-navigation'
import ActionSheet from 'react-native-actionsheet'
import ImagePicker from 'react-native-image-crop-picker'
import Layout from '../../constants/Layout';
import { convert, winWidth } from "../../utils/ratio";
import Zhugeio from 'react-native-plugin-zhugeio'
import FastImage from 'react-native-fast-image';

const Row = ({ label, value, onPress }: any) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: convert(10) }}>
    <Text style={{ fontSize: convert(20), color: '#000' }}>{label}</Text>
    <TouchableOpacity
      activeOpacity={0.7}
      style={{ flexDirection: 'row', alignItems: 'center' }}
      onPress={onPress}
    >
      <Text style={{ fontSize: convert(20), maxWidth: winWidth - convert(200) }} numberOfLines={1}>{value ? value : '点击设置'}</Text>
      <Icon name='ios-arrow-forward' size={convert(20)} color='#000' style={{ marginLeft: convert(5) }} />
    </TouchableOpacity>
  </View>
)

type Props = {
  dispatch: Dispatch<any>
  currentUser: any
}

@(connect(
  ({ auth: { detail } }: any) => ({ currentUser: detail })
) as any)
export default class Setting extends React.Component<Props> {
  imageActionSheet: any
  constructor(props: Props) {
    super(props)
    this.state = {
      modal: ''
    }
    this.imageActionSheet = React.createRef()
  }

  componentDidMount(){
    Zhugeio.startTrack('资料修改');
  }

  componentWillUnmount(){
    Zhugeio.endTrack('资料修改',{});
  }

  imagePicker = async (index: number) => {
    const { dispatch } = this.props
    switch (index) {
      case 0:
        const image = await ImagePicker.openPicker({ multiple: false, mediaType: 'photo' })
        dispatch({ type: 'user/updateAvatar', image })
        break
      case 1:
        const cameraImage = await ImagePicker.openCamera({ mediaType: 'photo' })
        dispatch({ type: 'user/updateAvatar', image: cameraImage })
        break
      case 2:
      default:
    }
  }


  render() {
    const { dispatch, currentUser } = this.props
    const { profile } = currentUser
    const { avatar, nickname, intro, location, school } = profile
    return (
      <View style={{ paddingTop: getStatusBarHeight(true) }}>
        <Header><Text>帐号信息</Text></Header>
        <View style={{ paddingHorizontal: convert(16) }}>
          <Text style={{ marginVertical: convert(10) }}>主要信息</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: convert(20), color: '#000' }}>头像</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => this.imageActionSheet.current.show()}>
              <FastImage
                source={{ uri: _.get(avatar, 'url') }}
                style={{ width: convert(40), height: convert(40), borderRadius: convert(20), alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon name='md-cloud-upload' size={convert(20)} color='#fff' />
              </FastImage>
            </TouchableOpacity>
          </View>
          <ActionSheet
            ref={this.imageActionSheet}
            title="选择图片"
            options={['相册', '相机', '取消']}
            cancelButtonIndex={2}
            onPress={this.imagePicker}
          />
          <Row
            label='姓名'
            value={nickname}
            onPress={() => dispatch(StackActions.push({
              routeName: 'FieldEdit',
              params: { title: '姓名', field: 'nickname', value: nickname },
            }))}
          />
          <Row
            label='一句话介绍'
            value={intro}
            onPress={() => dispatch(StackActions.push({
              routeName: 'FieldEdit',
              params: { title: '简介', field: 'intro', value: intro },
            }))}
          />
          <Text style={{ marginVertical: convert(10) }}>详细信息</Text>
          <Row
            label='常驻地'
            value={location}
            onPress={() => dispatch(StackActions.push({
              routeName: 'FieldEdit',
              params: { title: '常驻地', field: 'location', value: location },
            }))}
          />
          <Row
            label='学校信息'
            value={school}
            onPress={() => dispatch(StackActions.push({
              routeName: 'FieldEdit',
              params: { title: '学校', field: 'school', value: school },
            }))}
          />
        </View>
      </View>
    )
  }
}