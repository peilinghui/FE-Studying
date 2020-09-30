import React from 'react'
import { TouchableOpacity, View, TextInput } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import TouchableIcon from '../TouchableIcon';
import { convert } from "../../utils/ratio";

type Props = {
  onSubmit: (branch: string) => void
  styles?: any;
  openStyles?:any
}

export default class extends React.Component<Props> {
  state = {
    open: false,
    text: ''
  }

  render() {
    return (this.state.open ?
      <View style={{ position: 'relative', marginVertical: convert(10), marginRight: convert(12), ...this.props.openStyles }}>
        <TextInput
          autoFocus
          placeholder="输入话题"
          returnKeyType="done"
          returnKeyLabel="新建"
          onChangeText={(text) => this.setState({ text })}
          value={this.state.text}
          onSubmitEditing={() => {
            this.props.onSubmit(this.state.text)
            this.setState({ text: '', open: false })
          }}
          style={{
            width: convert(174),
            height: convert(40),
            borderRadius: convert(8),
            backgroundColor: '#fff',
          }}
        />
        <TouchableIcon
          name="md-close-circle"
          size={18}
          color="#dbdbdb"
          onPress={() => this.setState({ open: false })}
          style={{ position: 'absolute', top: convert(-5), right: convert(-5) }}
        />
      </View>
      :
      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          backgroundColor: '#fff',
          width: convert(47),
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: convert(5),
          paddingHorizontal: convert(10),
          marginVertical: convert(10),
          borderRadius: convert(8),
          marginRight: convert(12),
          ...this.props.styles
        }}
        onPress={() => this.setState({ open: true })}
      >
        <Icon name="md-add" size={24} color="#a4a4a4" />
      </TouchableOpacity>
    )
  }
}