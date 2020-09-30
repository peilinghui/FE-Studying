import React from 'react'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import Modal from './Modal'
import EmojiSelector from 'react-native-emoji-selector'
import Button from '../Button'

type Props = {
  onClose: () => void
  visible: boolean
  onSubmit: (tag: string) => void
}

export default class extends React.Component<Props> {
  static defaultProps = {
    dispatch: null
  }
  state = {
    emojiSelectorVisible: false,
    text: '',
    emoji: '🏷️',
  }

  render() {
    const { onClose, visible, onSubmit } = this.props
    return (
      <Modal
        visible={visible}
        onClose={onClose}
        onModalShow={() => this.setState({
          emojiSelectorVisible: false,
          text: '',
          emoji: '🏷️',
        })}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 8,
            borderBottomColor: '#F7F7F7',
            borderBottomWidth: 1,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '500', color: '#000' }}>新建话题</Text>
          <Button
            onPress={() => {
              const { emoji, text } = this.state
              if (emoji !== '' && text !== '') {
                onSubmit(`${emoji} ${text}`)
                onClose()
              }
            }}
          >确定</Button>
        </View>
        <View style={{ paddingTop: 10, flex: 1, }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => this.setState(({ emojiSelectorVisible }: any) => ({
                emojiSelectorVisible: !emojiSelectorVisible
              }))}
              style={{
                width: 50,
                height: 28,
                backgroundColor: 'rgba(0,0,0,0.06)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 13,
              }}
            >
              <Text style={{ fontSize: 18 }}>{this.state.emoji}</Text>
            </TouchableOpacity>
            <TextInput
              style={{ fontSize: 18 }}
              placeholder='输入话题标签'
              value={this.state.text}
              onChangeText={val => this.setState({ text: val })}
              onFocus={() => this.setState({ emojiSelectorVisible: false })}
            />
          </View>
          {this.state.emojiSelectorVisible ?
            <EmojiSelector
              onEmojiSelected={(emoji: string) => this.setState({
                emoji,
                emojiSelectorVisible: false
              })}
              showSearchBar={false}
              showSectionTitles={false}
              columns={12}
            /> : null}
        </View>
      </Modal>
    )
  }
}

