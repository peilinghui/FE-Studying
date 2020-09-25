import React from 'react'
import { View, Text, FlatList, Modal, TextInput, TouchableOpacity, StyleSheet, ToastAndroid, Alert } from 'react-native'
import TouchableIcon from "../TouchableIcon"
import { convert } from '../../utils/ratio';
import { Dispatch } from 'redux'
import LinearGradient from 'react-native-linear-gradient'
import { connect } from 'react-redux'


interface Props {
  dispatch: Function
  onClose: () => void
  visible: boolean
  onPress: (item: any) => void
  amount: number
  currentUser?: any
}

interface State {
  textContent: string;
}

@(connect(({ auth: { detail } }: any) => ({ currentUser: detail })) as any)

export default class WithdrawModal extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      textContent: '',
    }
  }

  render() {
    const { visible, onClose, onPress, amount, currentUser } = this.props
    const { textContent } = this.state;
    return (
      <Modal
        animationType={'slide'}
        transparent={true}
        visible={visible}
      >
        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', flex: 1 }}>
          <View style={{ backgroundColor: '#fff', flex: 1, marginTop: convert(200), borderRadius: convert(12) }}>

            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                height: convert(80),
              }}>
              <Text style={{
                fontSize: convert(20),
                fontWeight: '600',
                color: 'black',
                marginLeft: convert(110),
                marginTop: convert(20),
              }}>提现需实名</Text>
              <TouchableIcon
                style={{
                  right: 0,
                  margin: convert(10)
                }}
                name="md-close-circle"
                onPress={onClose}
              />
            </View>

            <TextInput
              style={{
                fontSize: convert(18),
                lineHeight: convert(30),
                // height: convert(40),
                // marginTop: convert(10),
                marginLeft: convert(15)
              }}
              multiline={true}
              placeholder={'需与微信绑定银行卡姓名一致'}

              onChangeText={textContent => this.setState({ textContent })}
            />

            <TouchableOpacity
              activeOpacity={.7}
              style={styles.readyCon}
              onPress={async () => {
                this.props.dispatch({
                  type: 'user/weChatPayWithdraw',
                  textContent: textContent,
                  amount: amount,
                  callBack: (sucess: boolean) => {
                    if (sucess) {
                      this.props.onClose()
                    } else {
                      Alert.alert('提示', '提现失败！',
                        [
                          {
                            text: "好的"
                          },
                        ])
                    }
                    this.props.onClose()
                  }
                })
              }}
            >
              <LinearGradient
                colors={['#007AFF', '#007AFF']}
                start={{ y: 0.4, x: 0 }}
                style={{
                  borderRadius: convert(8),
                  padding: convert(15),
                  flexDirection: 'row'
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    flex: 1,
                    fontSize: convert(16),
                    lineHeight: convert(18),
                    color: 'white'
                  }}
                >确认并提现</Text>
              </LinearGradient>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  readyCon: {
    borderRadius: convert(15),
    marginHorizontal: convert(10),
  },
})