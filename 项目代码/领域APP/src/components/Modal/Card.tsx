import React, {ReactNode} from 'react'
import {View, Text, TouchableOpacity, TextInput, StyleSheet,ToastAndroid} from 'react-native'
import Modal from './Modal'
import {Dispatch} from 'redux'
import {connect} from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import Button from '../Button'
import FastImage from 'react-native-fast-image';

type Props = {
  dispatch: Dispatch<any>
  onClose: () => void
  visible: boolean
  children: ReactNode
  features: any[]
}

@(connect() as any)
export default class extends React.Component<Props> {
  static defaultProps = {
    dispatch: null
  }
  state = {
    type: '',
    link: '',
    item: undefined,
  }

  submit = () => {
    if (this.state.link !== ''&&this.state.type !== '') {
      this.props.dispatch({
        type: 'user/addCard',
        cardType: this.state.type,
        connectionId: this.state.link,
        callBack:(sucess:boolean)=>{
          if(sucess){
            this.props.onClose()
          }else {
            ToastAndroid.show('添加失败！', ToastAndroid.LONG)
          }
        }
      })
    }
  }

  _renderTypeContent = (type: string) => {
    const {item} = this.state;

    return (
      <View>
        <TextInput
          style={{fontSize: 18}}
          placeholder={item.placeholder}
          value={this.state.link}
          onChangeText={val => this.setState({link: val})}
          onSubmitEditing={this.submit}
        />
      </View>
    )

  }

  render() {
    const {onClose, visible, children, features} = this.props
    return (
      <View>
        {children}
        <Modal visible={visible} onClose={onClose} onModalShow={() => this.setState({type: '', link: '',item: undefined,})}>
          <View style={{padding: 20}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20}}>
              <Text
                style={{color: '#000', fontSize: 18, fontWeight: '500'}}
              >{this.state.type !== '' ? this.state.item.title : ''}</Text>
              {this.state.type !== '' ? <Button onPress={this.submit}>添加</Button> : null}
            </View>
            {this.state.type !== '' ?
              this._renderTypeContent(this.state.type)
              :
              <View style={{flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'space-between'}}>
                {
                  features && features.length > 0 && features.map((item, index) => {

                    return (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.7}
                        onPress={() => this.setState({type: item.type, item: item})}
                      >
                        <FastImage
                          style={styles.card}
                          source={{uri: item.addImageUrl}}
                          resizeMode={'stretch'}
                        />
                        <Text style={{color: 'white'}}>{item.title}</Text>
                      </TouchableOpacity>
                    )
                  })
                }
                <View
                  style={{
                    ...styles.card,
                    backgroundColor: '#F2F2F2',
                    color: '#BBBBC5',
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  <Text>即将迎来更多...</Text>
                </View>
              </View>
            }
          </View>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  card: {
    width: 155,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  }
})
