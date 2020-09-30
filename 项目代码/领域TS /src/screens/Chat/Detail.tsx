import React from 'react'
import { View, Text, KeyboardAvoidingView, TextInput, FlatList, ActivityIndicator, EmitterSubscription, Platform, Keyboard, Clipboard,ToastAndroid } from 'react-native'
import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-x-helper'
import { NavigationScreenProps } from 'react-navigation'
import Header from '../../components/Header'
import { connect } from 'react-redux'
import Avatar from '../../components/Avatar'
import { objectHash } from '../../utils/functions'
import MessageCard from '../../components/MessageCard'
import Colors from '../../constants/Colors'
import ActionSheet from 'react-native-actionsheet'
import _ from 'lodash'
import TouchableIcon from '../../components/TouchableIcon'
import RealmModal from '../../components/Modal/Realm'
import TopicModal from '../../components/Modal/Topic'
import { Dispatch } from 'redux'
import ImagePicker from 'react-native-image-crop-picker'
import BranchView from '../../components/Chat/BranchView'
import { convert, winWidth, winHeight } from '../../utils/ratio';
import Zhugeio from 'react-native-plugin-zhugeio'
import ImageResizer from 'react-native-image-resizer';

interface Props extends NavigationScreenProps {
  dispatch: Dispatch<any>
  currentUser: any
  chat: any
  branches: any[]
  selectedBranch: any
  messages: any[]
}

type State = {
  modal: string
  keyboardOn: boolean
  selectedMessage: any
  messageInputText: string
  visible:boolean
}

@(connect(
  ({
    auth: { detail },
    chat: { chat, branches, selectedBranch, messages }
  }: any) => ({
    currentUser: detail,
    chat,
    branches,
    selectedBranch,
    messages,
  })) as any)
export default class extends React.Component<Props> {
  private keyboardWillShowSub?: EmitterSubscription
  private keyboardWillHideSub?: EmitterSubscription
  actionSheet: any
  imageActionSheet: any
  textInput: any

  state: State = {
    modal: '',
    keyboardOn: false,
    selectedMessage: null,
    messageInputText: '',
    visible:false
  }

  componentDidMount() {
    // Binding keyboard events
    this.keyboardWillShowSub = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
      : Keyboard.addListener('keyboardDidShow', this.keyboardWillShow)
    this.keyboardWillHideSub = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
      : Keyboard.addListener('keyboardDidHide', this.keyboardWillHide)
  }

  componentWillUnmount() {
    this.keyboardWillShowSub!.remove()
    this.keyboardWillHideSub!.remove()
  }

  setModalVisible = (modal: string) => this.setState({ modal })

  keyboardWillShow = () => this.setState({ keyboardOn: true })

  keyboardWillHide = () => this.setState({ keyboardOn: false, selectedMessage: null })

  async sendMessage() {
    const { dispatch } = this.props
    const { messageInputText: content, selectedMessage, visible } = this.state

    requestAnimationFrame(() => {
      this.setState({ messageInputText: '' })
    })

    this.textInput.clear()

    if (content.trim() === '') {
      ToastAndroid.show('不能发送空消息！', ToastAndroid.LONG)
      return
    }
    Zhugeio.track('发送讨论消息', {});
    dispatch({
      type: 'chat/reply',
      replyType: selectedMessage && visible ? 'reply' : 'text',
      ...(selectedMessage ? {
        elements: { messageId: selectedMessage._id }
      } : {}),
      content,
      callback: () => {
        this.setState({ selectedMessage: null })
      },
    })
  }

  _renderBottomBar = () => {
    const { messageInputText } =this.state
    return <View
      style={{
        padding: convert(10),
        borderTopColor: Colors.lightGray,
        borderTopWidth: convert(1)
      }}
    >
      {this.state.keyboardOn && (
        this.state.selectedMessage&& this.state.visible ?
          <View style={{ padding: convert(5), display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>正在引用:{this.state.selectedMessage.content}</Text>
            <TouchableIcon
              name="md-close"
              onPress={() => this.setState({ selectedMessage: null })}
            />
          </View>
          : <View
            style={{
              paddingHorizontal: 5,
              paddingVertical: 5,
              flexDirection: 'row',
              alignSelf: 'flex-end'
            }}
          >
            <TouchableIcon
              name="md-image"
              onPress={() => this.imageActionSheet.show()}
            />
            <TouchableIcon
              name="md-chatboxes"
              onPress={() => this.setModalVisible('topic')}
              style={{ marginLeft: convert(30) }}
            />
            <TouchableIcon
              name="md-radio-button-off"
              onPress={() => this.setModalVisible('realm')}
              style={{ marginLeft: convert(30) }}
            />
          </View>
      )}
      <ActionSheet
        ref={(o: any) => this.imageActionSheet = o}
        title="选择图片"
        options={['相册', '相机', '取消']}
        cancelButtonIndex={2}
        onPress={async (index: number) => {
          const { dispatch } = this.props
          switch (index) {
            case 0:
              const images = await ImagePicker.openPicker({
                // cropping: true,
                multiple: false,
                mediaType: 'photo'
              })
              if (!Array.isArray(images)) {
                ImageResizer.createResizedImage(images.path, 8, 6, 'JPEG', 80)
                  .then(({ uri }) => {
                    dispatch({ type: 'app/showLoading' })
                    dispatch({
                      type: 'chat/replyImages',
                      images: [images],
                      callback() {
                        dispatch({ type: 'app/hideLoading' })
                      }
                    })
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }
              break
            case 1:
              const image = await ImagePicker.openCamera({ 
                mediaType: 'photo',
                // cropping: true,
                multiple: false,
              })
              if (!Array.isArray(image)) {
                ImageResizer.createResizedImage(image.path, 8, 6, 'JPEG', 80)
                  .then(({ uri }) => {
                    dispatch({ type: 'app/showLoading' })
                    dispatch({
                      type: 'chat/replyImages',
                      images: [image],
                      callback() {
                        dispatch({ type: 'app/hideLoading' })
                      }
                    })
                  })
                  .catch(err => {
                    console.log(err);
                  });
              }
              break
            case 2:
            default:
          }
        }}
      />
      <TopicModal
        visible={this.state.modal === 'topic'}
        onClose={() => this.setModalVisible('')}
        onPress={(item) => {
          this.props.dispatch({
            type: 'chat/reply',
            replyType: 'topic',
            content: '[话题]',
            elements: { topicId: item._id }
          })
          this.setModalVisible('')
        }}
      />
      <RealmModal
        visible={this.state.modal === 'realm'}
        onClose={() => this.setModalVisible('')}
        onPress={(item) => {
          this.props.dispatch({
            type: 'chat/reply',
            replyType: 'realm',
            content: '[领域]',
            elements: { realmId: item._id }
          })
          this.setModalVisible('')
        }}
      />
      <View
        style={{  flexDirection: 'row'}}>
        <View
          style={{
            borderRadius: convert(15),
            overflow: "hidden",
            backgroundColor: Colors.lightGray,
            marginLeft: convert(15),
            marginTop: convert(10),
            bottom: getBottomSpace() + convert(10),
            width: winWidth - convert(60),
          }}>
          <TextInput
            style={{
              textAlignVertical: "center"
            }}
            value={messageInputText}
            placeholder="说说你的想法"
            onChangeText={messageInputText =>
              this.setState({ messageInputText })
            }
            returnKeyType={"send"}
            onSubmitEditing={() => this.sendMessage()}
            blurOnSubmit={false}
            ref={ref => (this.textInput = ref)}
            multiline={true}
            underlineColorAndroid="transparent"
          />
        </View>
        <TouchableIcon name='md-arrow-dropup-circle' size={convert(25)} color={messageInputText.trim() === '' ? Colors.darkGray : 'blue'}
          style={{ marginLeft: convert(5), marginRight: convert(15), width: convert(30), height: convert(30), marginTop: convert(10) }}
          onPress={() => this.sendMessage()} />
      </View>
    </View>
  }

  render() {
    const { currentUser, chat, selectedBranch, messages } = this.props
    const { users = [] } = chat
    const opposite = users.find(({ _id }: any) => _id !== currentUser._id)
    return (
      <View style={{ paddingTop: getStatusBarHeight(true), flex: 1, position: 'relative' }}>
        <Header>
          <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
            <Avatar user={opposite} size={convert(30)} />
            <Text style={{ lineHeight: convert(30), marginLeft: convert(8), }}>{_.get(opposite, 'profile.nickname')}</Text>
          </View>
        </Header>
        <BranchView />
        <View style={{ flex: 1, paddingBottom: this.state.keyboardOn ? convert(100) : convert(60) }}>
          <FlatList
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingVertical: convert(10) }}
            onEndReached={() => console.log('onEndReached')}
            bounces={messages.length > 5}
            inverted
            maxToRenderPerBatch={40}
            data={messages}
            keyExtractor={(item, index) => objectHash(item)}
            renderItem={({ item }) => (
              <MessageCard
                message={item}
                fromMyself={item.fromUser && item.fromUser._id === currentUser._id}
                onAgree={() => console.log('onAgree')}
                onSelected={() => {
                  this.setState({ selectedMessage: item },
                    () => this.actionSheet.show()
                  )
                }}
              />
            )}
            ListEmptyComponent={_.get(selectedBranch, 'statistics.numOfMessages') === 0 ? (
              <View style={{ paddingTop: convert(30) }}>
                <Text style={{ fontSize: convert(20), color: Colors.darkGray, alignSelf: 'center' }} >
                  暂无消息，快来聊天吧
                  </Text>
              </View>
            ) : (
                <View style={{ paddingTop: convert(30) }}>
                  <ActivityIndicator size="large" color={Colors.darkGrayAlpha(0.4)} />
                </View>
              )}
          />
          <ActionSheet
            ref={(o: any) => this.actionSheet = o}
            title={this.state.selectedMessage ? this.state.selectedMessage.content : null}
            options={['复制','引用', '举报', '取消']}
            cancelButtonIndex={3}
            destructiveButtonIndex={1}
            onPress={(index: number) => {
              switch (index) {
                case 0:
                  Clipboard.setString(this.state.selectedMessage.content);
                
                  break
                case 1:
                  this.textInput.blur()
                  setTimeout(() => {
                    this.textInput.focus()
                  }, 100)
                  this.setState({visible:true})
                  break
                case 2:
                
                  break
                case 3:
                default:
              }
            }}
          />
        </View>
        <KeyboardAvoidingView
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            backgroundColor: '#fff',
          }}>
          {this._renderBottomBar()}
        </KeyboardAvoidingView>
      </View>
    )
  }
}