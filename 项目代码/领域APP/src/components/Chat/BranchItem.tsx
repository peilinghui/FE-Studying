import React from 'react'
import { TouchableOpacity, Text } from 'react-native'

type Props = {
  selected: boolean
  branch: any
  onPress: () => void
}

export default ({ selected, branch, onPress }: Props) => {
  const { tags: [tag = {}], statistics: { numOfMessages } } = branch
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        paddingVertical: 4,
        paddingHorizontal: 10,
        marginVertical: 10,
        backgroundColor: selected ? '#1589EE' : '#fff',
        borderRadius: 8,
        marginRight: 12,
      }}
    >
      <Text style={{ fontSize: 14, color: selected ? '#fff' : '#000' }}># {tag.name}</Text>
      <Text style={{ fontSize: 9, color: selected ? '#fff' : '#bbb' }}>{numOfMessages} 讨论</Text>
    </TouchableOpacity>
  )
}