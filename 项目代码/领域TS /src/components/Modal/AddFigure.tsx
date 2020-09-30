import React from 'react'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import Modal from './Modal'
import { connect } from 'react-redux'
import EmojiSelector from 'react-native-emoji-selector'
import { Dispatch } from 'redux'
import Button from '../Button'
import { getSuggestionFigures } from '../../services/feature'
import { convert } from "../../utils/ratio";
type Props = {
  dispatch: Dispatch<{}>
  onClose: () => void
  visible: boolean
  userId: string
}

@(connect() as any)
export default class extends React.Component<Props> {
  static defaultProps = {
    dispatch: null
  }
  state = {
    emojiSelectorVisible: false,
    figure: '',
    emoji: '😀',
    suggestion: [],
  }

  getSuggestion = async () => {
    const data = await getSuggestionFigures()
    this.setState({ suggestion: data })
  }

  render() {
    const { dispatch, onClose, visible, userId } = this.props
    return (
      <Modal visible={visible} onClose={onClose} onModalShow={this.getSuggestion}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal:convert(20),
            paddingTop: convert(10),
            paddingBottom: convert(8),
            borderBottomColor: '#F7F7F7',
            borderBottomWidth: convert(1),
          }}
        >
          <Text style={{ fontSize: convert(18), fontWeight: '500', color: '#000' }}>新增形象</Text>
          <Button
            onPress={() => {
              const { emoji, figure } = this.state
              if (emoji !== '' && figure !== '') {
                dispatch({
                  type: 'user/addFigure',
                  userId,
                  figure: `${emoji} ${figure}`
                })
                onClose()
              }
            }}
          >新增</Button>
        </View>
        <View style={{ paddingTop: convert(10), flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: convert(20), }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => this.setState(({ emojiSelectorVisible }: any) => ({
                emojiSelectorVisible: !emojiSelectorVisible
              }))}
              style={{
                width: convert(50),
                height: convert(28),
                backgroundColor: 'rgba(0,0,0,0.06)',
                borderRadius: convert(6),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: convert(13),
              }}
            >
              <Text style={{ fontSize: convert(18) }}>{this.state.emoji}</Text>
            </TouchableOpacity>
            <TextInput
              style={{ fontSize: convert(18) }}
              placeholder='输入形象标签'
              value={this.state.figure}
              onChangeText={val => this.setState({ figure: val })}
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
            /> : <View style={{ alignItems: 'flex-end', marginTop: convert(60), paddingHorizontal: convert(20), }}>
              <Text style={{ fontSize: convert(24), color: '#000', fontWeight: '500' }}>来找些灵感</Text>
              <Text style={{ fontSize: convert(14), color: '#BBBBC5' }}>这有些无聊的词儿，仅供参考</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: convert(20) }}>
                {this.state.suggestion.map((v: string, k: number) => (
                  <Button
                    style={{ marginBottom: convert(20), marginRight: convert(14) }}
                    key={`${v}${k}`}
                    onPress={() => {
                      const [emoji, figure] = v.split(/\s(.+)/)
                      this.setState({ emoji, figure })
                    }}
                  >
                    <Text>{v}</Text>
                  </Button>
                ))}
              </View>
            </View>}
        </View>
      </Modal>
    )
  }
}

