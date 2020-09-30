import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native'
import Modal from './Modal'
import { CameraKitCamera, CameraKitCameraScreen, CameraKitGallery } from 'react-native-camera-kit'
import { TabView, SceneMap } from 'react-native-tab-view'
import Gallery from '../Gallery'
import Camera from '../Camera'
import { connect } from 'react-redux'
import { Dispatch } from "redux"

type Props = {
  onClose: () => void
  visible: boolean
  dispatch: Dispatch<{}>
  topicId: string
}

type State = {
  index: number
  routes: { key: string, title: string }[]
}

@(connect() as any)
export default class extends React.Component<Props, State> {
  static defaultProps = {
    dispatch: null
  }

  state: State = {
    index: 0,
    routes: [
      { key: 'Gallery', title: '图库' },
      { key: 'Camera', title: '拍照' },
    ],
  }

  _renderTabBar = ({ navigationState, jumpTo }: any) => {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: 50,
          backgroundColor: '#f7f7f7',
          alignItems: 'center',
        }}
      >
        {navigationState.routes.map(({ key, title }: any) => (
          <View style={{ flex: 1, alignItems: 'center' }} key={key}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => jumpTo(key)}
            >
              <Text>{title}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>)
  }

  render() {
    const { onClose, visible, dispatch, topicId } = this.props
    const { title } = this.state.routes[this.state.index]
    return (
      <Modal visible={visible} onClose={onClose}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 50,
          }}
        >
          <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
            <Text>取消</Text>
          </TouchableOpacity>
          <Text>{title}</Text>
          {this.state.index === 0 ?
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                dispatch({
                  type: 'topic/uploadReplyImages',
                  topicId
                })
                onClose()
              }}
            >
              <Text>下一步</Text>
            </TouchableOpacity>
            : <Text style={{ width: 42 }}>&nbsp;</Text>}
        </View>
        <TabView
          tabBarPosition="bottom"
          renderTabBar={this._renderTabBar}
          useNativeDriver
          navigationState={this.state}
          renderScene={SceneMap({ Gallery, Camera })}
          onIndexChange={async (index: number) => {
            this.setState({ index })
            if (index === 1) {
              const isCameraAuthorized = await CameraKitCamera.checkDeviceCameraAuthorizationStatus()
              if (!isCameraAuthorized || isCameraAuthorized === -1) {
                CameraKitCamera.requestDeviceCameraAuthorization()
              }
            }
          }}
          initialLayout={{
            width: Dimensions.get('window').width,
            height: 0,
          }}
        />
      </Modal>)
  }

}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
  },
})
