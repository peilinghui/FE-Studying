import React from 'react'
import { CameraKitCameraScreen, CameraKitCamera } from "react-native-camera-kit"
import { connect } from 'react-redux'
import { Dispatch } from 'redux'

type Props = {
  dispatch: Dispatch<{}>
  onClose: () => void
}

@(connect() as any)
export default class extends React.Component<Props> {
  render() {
    const { dispatch, onClose } = this.props
    return (
      <CameraKitCameraScreen
        onBottomButtonPressed={(event: any) => {
          dispatch({ type: 'topic/uploadReplyImages', event })
          onClose()
        }}
        flashImages={{
          on: require('../assets/flashOn.png'),
          off: require('../assets/flashOff.png'),
          auto: require('../assets/flashAuto.png')
        }}
        cameraFlipImage={require('../assets/cameraFlipIcon.png')}
        captureButtonImage={require('../assets/cameraButton.png')}
      />
    )
  }
}
