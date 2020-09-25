import React from 'react'
import { Dimensions, Platform, View, StatusBar } from 'react-native'
import RNModal, { ModalProps } from 'react-native-modal'
import Layout from '../../constants/Layout';

interface Props extends ModalProps {
  onClose: () => void
  visible: boolean
  children: Element
}

const deviceWidth = Dimensions.get('window').width
const deviceHeight = Platform.OS === 'ios'
  ? Layout.window.height
  : Layout.window.realHeight

const Modal = ({ onClose, visible, children, isVisible, ...restProps }: Props) => (
  <RNModal
    isVisible={visible}
    onSwipeComplete={onClose}
    onBackdropPress={onClose}
    onBackButtonPress={onClose}
    swipeDirection="down"
    useNativeDriver
    deviceWidth={deviceWidth}
    deviceHeight={deviceHeight}
    style={{ justifyContent: 'flex-end', margin: 0, paddingTop: 100 }}
    {...restProps}
  >
    <View style={{ backgroundColor: 'white', flex: 1, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
      {children}
    </View>
  </RNModal>
)


Modal.defaultProps = {
  isVisible: false
}

export default Modal
