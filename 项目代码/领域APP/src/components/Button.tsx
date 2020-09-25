import React, { ReactNode } from 'react'
import { TouchableOpacity, Text, StyleProp } from 'react-native'

type Props = {
  children: string | ReactNode
  onPress: () => void
  style: StyleProp<any>
}

const Button = ({ children, onPress, style }: Props) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={{
      backgroundColor: '#efeff4',
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      paddingVertical: 5,
      ...style,
    }}
    onPress={onPress}
  >
    {typeof children === 'string' ?
      <Text
        style={{
          color: '#007AFF',
          fontSize: 15,
          fontWeight: '600',
        }}>
        {children}
      </Text>
      : children}
  </TouchableOpacity>
)

Button.defaultProps = {
  style: {}
}

export default Button
