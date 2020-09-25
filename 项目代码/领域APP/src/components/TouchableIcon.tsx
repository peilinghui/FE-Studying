import React from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'

interface Props extends TouchableOpacityProps {
  name: string
  size: number
  color: string
}

const TouchableIcon = ({ size, color, activeOpacity, name, onPress, ...rest }: Props) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={activeOpacity}
    {...rest}>
    <Icon
      name={name}
      size={size}
      color={color}
    />
  </TouchableOpacity>
)

TouchableIcon.defaultProps = {
  size: 26,
  color: '#555',
  activeOpacity: 0.7,
}

export default TouchableIcon
