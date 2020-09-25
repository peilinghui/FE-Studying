import React from 'react'
import { View, TouchableWithoutFeedback, Keyboard, TextInput, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import Header from '../../components/Header'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import Icon from 'react-native-vector-icons/Ionicons';
import { search as searchRealm } from '../../services/realm'
import { search as searchUser } from '../../services/user'
import RealmCard from '../../components/RealmCard'
import { connect } from 'react-redux'
import { StackActions } from 'react-navigation'
import { Dispatch } from 'redux'
import Avatar from '../../components/Avatar'
import Button from '../../components/Button';
import { objectHash } from '../../utils/functions';
import Layout from '../../constants/Layout';
import { convert, winHeight, winWidth } from '../../utils/ratio';

type Props = {
  dispatch: Dispatch<any>
}

type State = {
  keyword: string
  realms: any[] | null
  users: any[] | null
}

@(connect() as any)
export default class extends React.Component<Props, State> {
  state: State = {
    keyword: '',
    realms: null,
    users: null,
  }

  search = async () => {
    if (this.state.keyword != '') {
      const realms = await searchRealm({ keyword: this.state.keyword })
      const users = await searchUser({ keyword: this.state.keyword })
      this.setState({ realms, users })
    } else {
      this.setState({ realms: null, users: null })
    }
  }

  render() {
    const { dispatch } = this.props
    const { keyword, realms, users } = this.state
    const { width } = Dimensions.get('window')
    return (
      <View style={{ flex: 1, paddingTop: getStatusBarHeight(true) }}>
        <Header><Text style={{ fontSize: convert(15), color: '#000',fontWeight:'bold'}}>搜索</Text></Header>
        <View
          style={{
            backgroundColor: 'rgba(142,142,147,0.12)',
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: convert(16),
            borderRadius: convert(10),
            height: convert(40),
          }}
        >
          <Icon
            name='md-search'
            color='#8E8E93'
            size={convert(13)}
            style={{ marginHorizontal: convert(10) }}
          />
          <TextInput
            placeholderTextColor='#8E8E93'
            placeholder='搜索领域或用户'
            style={{ fontSize: convert(13), }}
            value={this.state.keyword}
            onChangeText={val => this.setState({ keyword: val }, this.search)}
            autoFocus
          />
        </View>
        {users &&
          <View style={{ marginTop: convert(20), }}>
          <View style={{ flexDirection: 'row', paddingHorizontal: convert(16), justifyContent: 'space-between' }}>
            <Text style={{ fontSize: convert(20), color: '#000' }}>用户</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => dispatch(StackActions.push({
                  routeName: 'SearchUser',
                  params: { keyword },
                }))}
              >
                <Text>查看全部 ></Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={users.slice(0, 10)}
              horizontal
            ItemSeparatorComponent={() => <View style={{ width: convert(20) }} />}
              ListEmptyComponent={() =>
                <View style={{ paddingHorizontal: convert(16), flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text>没有找到用户</Text>
                </View>
              }
              keyExtractor={(item, index) => objectHash(item)}
              renderItem={({ item }: any) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', width: width - convert(80), marginVertical: convert(10), marginHorizontal: convert(16), }}>
                  <Avatar user={item} size={convert(40)} />
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginLeft: convert(10),
                      paddingVertical: convert(5),
                    }}
                  >
                    <View>
                      <Text style={{ color: '#000' }}>{item.profile.nickname}</Text>
                      <Text>{item.profile.intro || '暂无介绍'}</Text>
                    </View>
                    <Button
                      onPress={() => dispatch(StackActions.push({
                        routeName: 'UserViewer',
                        params: { userId: item._id },
                      }))}
                    >查看</Button>
                  </View>
                </View>
              )}
            />
          </View>
        }
        {realms &&
          <View>
          <Text style={{ marginTop: convert(30), marginBottom: convert(10), paddingHorizontal: convert(16), fontSize: convert(20), color: '#000' }}>领域</Text>
            <FlatList
            style={{ maxHeight: winHeight - convert(300) }}
            contentContainerStyle={{ paddingBottom: convert(20) }}
            ItemSeparatorComponent={() => <View style={{ height: convert(20) }} />}
              ListEmptyComponent={() =>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text>没有找到领域</Text>
                </View>
              }
              data={realms}
              keyExtractor={(item, index) => objectHash(item)}
              renderItem={({ item }: any) => (
                <View style={{ paddingHorizontal: convert(16) }}>
                  <RealmCard
                    onPress={() => {
                      dispatch({ type: 'realm/read', item })
                      dispatch(StackActions.push({
                        routeName: 'RealmViewer',
                        params: {
                          realmId: item._id
                        },
                      }))
                    }}
                    onPressAvatar={(user) => dispatch(StackActions.push({
                      routeName: 'UserViewer',
                      params: { userId: user._id },
                    }))}
                    realm={item}
                  />
                </View>
              )}
            />
          </View>
        }
        {keyword === '' &&
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: convert(25) }}>输入关键字开始查找</Text>
          </View>
        }
      </View>
    )
  }
}