import React from 'react';
import {
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  TouchableOpacity,
  Alert,
  PermissionsAndroid
} from 'react-native';
import { NavigationScreenProps, NavigationActions, StackActions } from 'react-navigation'
import { Dispatch } from 'redux';
import { CameraKitCameraScreen, CameraKitCamera } from "react-native-camera-kit"
import Header from '../../components/Header';
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { checkStatus } from "../../services/feature";
import { convert } from '../../utils/ratio';

interface Props extends NavigationScreenProps {
  dispatch: Dispatch<any>
}

interface State {
  isCameraAuthorized: boolean;
}
export default class QRScannerViewScreen extends React.Component<Props, State>{


  constructor(props: any) {
    super(props);
    this.state = {
      isCameraAuthorized: false
    }
  }

  componentDidMount() {
    this.requestPermissions()
  }

  onBottomButtonPressed(event: any) {
    const captureImages = JSON.stringify(event.captureImages);
    Alert.alert(
      `${event.type} button pressed`,
      `${captureImages}`,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false }
    )
  }

  requestPermissions = async () => {
    const success = await CameraKitCamera.checkDeviceCameraAuthorizationStatus()
    if (success > 0) {
      this.setState({ isCameraAuthorized: true })
    } else {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)
      if (granted === 'granted') {
        this.setState({ isCameraAuthorized: true })
      }
    }
  }

  render() {
    return (
      <View style={{ marginTop: getStatusBarHeight(true), }}>
        <Header><Text>扫一扫</Text></Header>
        {this.state.isCameraAuthorized && (
          <CameraKitCameraScreen
            // ref={(cam:any) => this.camera = cam}
            sytle={{ backgroundColor: 'white' }}
            actions={{ rightButtonText: 'Done', leftButtonText: 'Cancel' }}
            onBottomButtonPressed={(event: any) => this.onBottomButtonPressed(event)}
            onReadCode={((event: any) => {
              const webLoginUrl = event.nativeEvent.codeStringValue;
              checkStatus(webLoginUrl);
              this.props.navigation.pop()
            })}
            hideControls={true}
            showFrame={true}
            scanBarcode={true}
            laserColor={"#fff"}
            frameColor={"#fff"}
            surfaceColor={"black"}
            colorForScannerFrame={'#fff'}
            offsetForScannerFrame={20}
            heightForScannerFrame={200}
            flashImages={{
              on: require('../../assets/flashOn.png'),
              off: require('../../assets/flashOff.png'),
              auto: require('../../assets/flashAuto.png')
            }}
            cameraOptions={{
              flashMode: 'auto',             // on/off/auto(default)
              focusMode: 'on',               // off/on(default)
              zoomMode: 'on',                // off/on(default)
              ratioOverlay: '1:1',            // optional, ratio overlay on the camera and crop the image seamlessly
              ratioOverlayColor: '#00000077' // optional
            }}
          // scannerOptions={this.state.scannerOptions}
          // cameraFlipImage={require('../../assets/cameraFlipIcon.png')}
          // captureButtonImage={require('../../assets/cameraButton.png')}
          />
        )}
      </View>
    )
  }
}
