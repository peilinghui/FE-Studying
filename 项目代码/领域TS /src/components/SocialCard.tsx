import React from 'react'
import { Image, Text, TouchableOpacity, View, ImageBackground, StyleProp } from 'react-native'
import TouchableIcon from './TouchableIcon'
import FastImage from 'react-native-fast-image';

type Props = {
  card: any
  style: StyleProp<any>
  onDelete: () => void
}

export default class extends React.Component<Props> {
  static defaultProps = {
    style: {},
  }

  state = {
    pressed: false
  }

  render() {
    const { card, style, onDelete } = this.props
    const {
      data: {
        followerCount,
        avatarUrl,
        name,
        backgroundImageUrl,
        logoUrl,
        text,
      }
    } = card
    const replacedText = text.replace('{{followerCount}}', followerCount)
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={{ width: 136, height: 174, ...style }}
        onPress={() => this.setState(({ pressed }: any) => ({ pressed: !pressed }))}
      >
        <FastImage
          style={{ flex: 1, alignItems: 'center', position: 'relative' }}
          source={{ uri: backgroundImageUrl }}
        >
          <FastImage
            source={{ uri: logoUrl }}
            style={{ width: 63, height: 27, position: 'absolute', top: 12, left: 12 }}
          />
          {this.state.pressed ?
            <TouchableIcon
              name="md-close-circle"
              style={{ position: 'absolute', top: 10, right: 12 }}
              onPress={onDelete}
            />
            : null}
          {
            avatarUrl ?
            <View
              style={{
                width: 45,
                height: 45,
                borderRadius: 23,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 31,
                marginBottom: 37,
              }}
            >
                <FastImage
                style={{ width: 43, height: 43, borderRadius: 22 }}
                source={{ uri: avatarUrl }}
              />
            </View>
            :
            <View
              style={{
                width: 45,
                height: 45,
                borderRadius: 23,
                backgroundColor: 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 31,
                marginBottom: 37,
              }}
            ></View>
          }
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{name}</Text>
          <Text style={{ color: '#fff', fontSize: 13 }}>{replacedText}</Text>
        </FastImage>
      </TouchableOpacity>
    )
  }
}
