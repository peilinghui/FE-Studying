import React from 'react'
import { View, Text } from 'react-native'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { Dispatch } from 'redux'
import { NavigationScreenProp } from 'react-navigation'
import { connect } from 'react-redux'
import List from '../../components/List'
import { getRelations } from '../../services/user'
import Header from '../../components/Header'
import Follower from '../../components/Follower'
import Zhugeio from 'react-native-plugin-zhugeio'
interface Props {
  dispatch: Dispatch<any>
  navigation: NavigationScreenProp<any>
  currentUser: any
}

export default connect(
  ({ auth: { detail } }: any) => ({ currentUser: detail }))
(({ dispatch, navigation, currentUser }: Props) => {


    const userId = navigation.getParam('userId')

    async function request(cursorAt: any, limit: number, offset: number) {
      const data = await getRelations('followee', userId, currentUser._id, offset, limit);
      return data.map((item: any) => ({ ...item, height: 80 }))
    }

    return (
      <View style={{ paddingTop: getStatusBarHeight(true) }}>
        <Header><Text>关注的人</Text></Header>
        <View style={{ height: '100%' }}>
          <List
            request={request}
            useOffset={true}
            rowRenderer={(layoutType, user,index) => <Follower user={user} key={index}/>}
          />
        </View>
      </View>
    )
  }
)
