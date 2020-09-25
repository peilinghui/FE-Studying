
import React, { Component } from 'react';
import RNFS from 'react-native-fs';
import {
  View,
  Modal,
  ActivityIndicator, 
  CameraRoll, 
  ToastAndroid,
  TouchableOpacity,
  Text,
  PermissionsAndroid
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { convert, winHeight, winWidth } from '../utils/ratio';
import Icon from 'react-native-vector-icons/Ionicons'

interface Props {
  cancel: Function
  currentImage: number
  imageData: any
  modalVisible: boolean
}

interface State { }

export default class LookPhotoModal extends Component<Props, State>  {

  private androidDownPath: any
  constructor(props: Readonly<Props>) {
    super(props);
    this.renderLoad = this.renderLoad.bind(this);
    this.savePhoto = this.savePhoto.bind(this);
    this._Close = this._Close.bind(this);
    this.androidDownPath = `${RNFS.DocumentDirectoryPath}/${((Math.random() * 1000) | 0)}.jpg`;
  }

  _Close() {
    this.props.cancel();
  }

  renderLoad() { //这里是写的一个loading
    return (
      <View style={{ marginTop: convert(100) }}>
        <ActivityIndicator animating={true} size={"large"} />
      </View>
    )
  }

  savePhoto(imageurl: string) {
    this.checkPermission()
    let DownloadFileOptions = {
      fromUrl: imageurl,          //下载路径
      toFile: this.androidDownPath     // Local filesystem path to save the file to
    }
    let result = RNFS.downloadFile(DownloadFileOptions);
    let _this = this;
    result.promise.then(function (val: any) {
      console.log("文件保存成功：" + _this.androidDownPath)
      let promise = CameraRoll.saveToCameraRoll(_this.androidDownPath);
      promise.then(function (result) {
        ToastAndroid.show('已保存到系统相册', ToastAndroid.LONG)
      }).catch(function (error) {
        ToastAndroid.show('没有储存权限，无法保存', ToastAndroid.LONG)
      });
    }, function (val: any) {
      console.log('Error Result:' + JSON.stringify(val));
    }
    ).catch(function (error: { message: any; }) {
      console.log(error.message);
    });
  }

  checkPermission() {
    try {
      //返回Promise类型
      const granted = PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      )
      granted.then((data) => {
        this.show("是否获取读写权限" + data)
      }).catch((err) => {
        this.show(err.toString())
      })
    } catch (err) {
      this.show(err.toString())
    }
  }

  show(data:any) {
    ToastAndroid.show(data, ToastAndroid.LONG)
  }

  
  render() {
    const { imageData, currentImage } = this.props
    const lookImageArr = imageData.map((item: { url: any; }) => item.url)

    return (
      <Modal
        animationType={"fade"}
        transparent={true}
        visible={this.props.modalVisible}
      //    onRequestClose={() => { this._pressSignClose() }}
      >
        <View style={{
          flex: 1,
          backgroundColor: '#000000bb'
        }}>
          <ImageViewer
            // onShowModal={this.props.modalVisible}
            imageUrls={this.props.imageData} // 照片路径
            enableImageZoom={true} // 是否开启手势缩放
            saveToLocalByLongPress={true} //是否开启长按保存
            index={this.props.currentImage} // 初始显示第几张
            failImageSource={require('../assets/failImage.png')} // 加载失败图片
            loadingRender={this.renderLoad}
            enableSwipeDown={true}
            menuContext={{ "saveToLocal": "保存到相册", "cancel": "取消" }}
            onClick={() => { // 图片单击事件
              this._Close()
            }}
            pageAnimateTime={200}
            enablePreload={true}
            onSwipeDown={() => this._Close()}
            onSave={(url: string) => { this.savePhoto(url) }}
            maxOverflow={200}
            backgroundColor="transparent"
            renderHeader={() => {
              return (
                <TouchableOpacity
                  style={{ left: convert(30), top: convert(30), position: 'absolute' }}
                  activeOpacity={0.7}
                  onPress={() => this._Close()}
                >
                  <Icon
                    name={'ios-arrow-back'}
                    size={convert(20)}
                    style={{
                      lineHeight: convert(30),
                      color: 'white',
                    }}
                  />
                </TouchableOpacity>
              )
            }}
          >
          </ImageViewer>
          <TouchableOpacity
            style={{ right: convert(30), bottom: convert(30), position: 'absolute' }}
            activeOpacity={0.7}
            onPress={() => { this.savePhoto(lookImageArr[currentImage]) }}
          >
            <View
              style={{
                height: convert(40),
                width: convert(100),
                borderRadius: convert(10),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#00000055'
              }}>
              <Text
                style={{
                  fontSize: convert(14),
                  color: 'white',
                  // lineHeight: convert(40)
                }}
              >保存图片</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

}