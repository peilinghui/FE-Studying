import React from 'react'
import { View, TouchableWithoutFeedback, Keyboard, Text } from 'react-native'
import Header from '../../components/Header'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { search as searchUser } from '../../services/user'
import List from '../../components/List'
import { NavigationScreenProp, StackActions } from 'react-navigation'
import Avatar from '../../components/Avatar'
import Button from '../../components/Button'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'
import Colors from '../../constants/Colors';
import { convert } from '../../utils/ratio';

type Props = {
  navigation: NavigationScreenProp<any>
  dispatch: Dispatch<any>
}

@(connect() as any)
export default class extends React.Component<Props> {
  request = async () => {
    const keyword = this.props.navigation.getParam('keyword')
    const users = await searchUser({ keyword })
    return users.map((item: any) => ({ ...item, height: convert(64) }))
  }

  render() {
    return (
      <View style={{ flex: 1, paddingTop: getStatusBarHeight(true) }}>
        <Header><Text>你可能认识</Text></Header>
        <View style={{ flex: 1 }}>
          <List
            request={this.request}
            rowRenderer={(layoutType, item) => (
              <View style={{ flexDirection: 'row', marginLeft: convert(16), }}>
                <Avatar user={item} size={convert(40)} />
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingRight: convert(16),
                    paddingVertical: convert(5),
                    borderBottomWidth: convert(1),
                    borderBottomColor: Colors.lightGray,
                    marginLeft: convert(10),
                  }}
                >
                  <View>
                    <Text>{item.profile.nickname}</Text>
                    <Text>{item.profile.intro || '暂无介绍'}</Text>
                  </View>
                  <Button
                    onPress={() => this.props.dispatch(StackActions.push({
                      routeName: 'UserViewer',
                      params: { userId: item._id },
                    }))}
                  >查看</Button>
                </View>
              </View>
            )}
          />
        </View>
      </View>
    )
  }
}