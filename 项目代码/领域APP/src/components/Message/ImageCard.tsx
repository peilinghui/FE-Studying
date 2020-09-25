import React from 'react'
import _ from 'lodash'
import { Image, Dimensions, View, TouchableWithoutFeedback, GestureResponderEvent } from 'react-native'
import Colors from '../../constants/Colors'
import { convert } from "../../utils/ratio";
import LookPhotoModal from '../../components/LookPhotoModal';
import FastImage from 'react-native-fast-image';
import { CacheImage } from 'react-native-rn-cacheimage'

type OnLongPressCallback = (event: GestureResponderEvent) => void;
type Props = {
  message: any
  styles?: any;
  onLongPressImage?: OnLongPressCallback;
}

type State = {
  heights: { [index: string]: number }
  modal: string
  disableQiniu: boolean;
}

export default class extends React.Component<Props, State> {

  private onPress?: OnLongPressCallback

  constructor(props: Props) {
    super(props)
    this.onPress = this.props.onLongPressImage
  }

  state: State = {
    heights: {},
    modal: '',
    disableQiniu: false
  }
  // calculateImageHeight = () => {
  //   if (!_.has(this.props, 'message.elements.images')) {
  //     return
  //   }
  //   const { images = [] } = this.props.message.elements
  //   images.map(({ url }: any) =>
  //     Image.getSize(url, (width, height) => {
  //       const screenWidth = convert(250)
  //       const rate = width > 0 && height > 0 ? height / width : 1
  //       const adjustedHeight = Math.floor(screenWidth * rate)
  //       this.setState(prevState => ({
  //         ...prevState,
  //         heights: {
  //           ...prevState.heights,
  //           [url]: adjustedHeight,
  //         },
  //       }))
  //     }, (error) => console.log(error))
  //   )
  // }

  componentDidMount() {
    // this.calculateImageHeight()
  }

  setModalVisible = (modal: string) => this.setState({ modal });

  render() {
    if (!_.has(this.props, 'message.elements.images')) {
      return <></>
    }
    const [{ url }] = this.props.message.elements.images
    const { [url]: height = convert(250) } = this.state.heights
    const { disableQiniu } = this.state
    return (

      <View
        style={{
          backgroundColor: Colors.lightGray,
          borderRadius: convert(12)
        }}
      >
        <TouchableWithoutFeedback onPress={() => this.setModalVisible("imageModel")} onLongPress={this.props.onLongPressImage}>
          <Image
            style={{ width: convert(230), height:convert(150), borderRadius: convert(12), ...this.props.styles }}
            source={{
              uri: url + (disableQiniu ? '' : '?imageMogr2/auto-orient/format/jpg/thumbnail/!80p/interlace/1/size-limit/$(fsize)')
            }}
            onError={() => {
              this.setState({ disableQiniu: true });
            }}
          />
        </TouchableWithoutFeedback>
        <LookPhotoModal
          modalVisible={this.state.modal === "imageModel"}
          currentImage={0}
          imageData={this.props.message.elements.images}
          cancel={() => this.setModalVisible("")} />
      </View>
    )
  }
}
