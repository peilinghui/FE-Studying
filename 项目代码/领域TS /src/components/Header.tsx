import { Text, TouchableOpacity, View } from 'react-native'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/Ionicons'
import React, { ReactNode } from 'react'
import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import { convert } from '../utils/ratio';
type Props = {
  dispatch: Dispatch<any>
  children: ReactNode
}

export default connect()(({ dispatch, children }: Props) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      height: convert(50),
      alignItems: 'center',
    }}>
    <TouchableOpacity
      style={{
        height: 50,
        marginLeft: 20,
        marginRight: 15,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
      }}
      activeOpacity={0.7}
      onPress={() => dispatch(NavigationActions.back())}
    >
      <Icon
        name="ios-arrow-back"
        size={26}
      />
    </TouchableOpacity>
    {children}
    <Text style={{ width: 40 }}>&nbsp;</Text>
  </View>
))
